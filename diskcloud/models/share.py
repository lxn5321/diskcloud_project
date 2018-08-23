def generate_id(username,id_life,path):
    from diskcloud.models.mysql import insert_execute,select_execute,update_execute
    from diskcloud.models.string import generate_random_str
    from datetime import datetime,timedelta
    from flask import current_app

    path = path.relative_to(current_app.config['FILES_FOLDER']).as_posix()
    # get expire time string
    if id_life != 0:
        expire_time = datetime.utcnow() + timedelta(hours=id_life)
        expire_time_str = expire_time.strftime("%y%m%d%H%M%S")
    else:
        expire_time_str = 'permanent'

    result_sel = select_execute("select expire_time,sid from share where path = %s",(path,))
    if result_sel != False:
        result_life = valid_life(result_sel[0])
        if result_life == 'permanent':
            return result_sel[1]
        elif result_life:
            result_update = update_execute('update share set expire_time = %s where path = %s',(expire_time_str,path))
            if result_update:
                return result_sel[1]
            return [False,'fail to update']
        else:
            sid = generate_random_str(8)
            result_update = update_execute('update share set expire_time = %s, sid = %s where path = %s',(expire_time_str,sid,path))
            if result_update:
                return sid
            return [False,'fail to update']
    else:
        sid = generate_random_str(8)
        result = insert_execute("insert into share values(%s,%s,%s,%s)",(sid,username,path,expire_time_str))
        if result:
            return sid
        return [False,'SQL Error,cannot generate a share Id']

def valid_sid(sid):
    from diskcloud.models.verification import re_match
    from diskcloud.models.mysql import select_execute

    if re_match('[a-zA-Z0-9]{8}',sid):
        result = select_execute('select expire_time,path from share where sid = %s',(sid,))
        if result != False:
            if valid_life(result[0]):
                return result[1]
    return False

def valid_life(life_str):
    from datetime import datetime

    if life_str == 'permanent':
        return 'permanent'
    expire_time = datetime.strptime(life_str,"%y%m%d%H%M%S")
    now_time = datetime.utcnow()
    if now_time < expire_time:
        return True
    return False
