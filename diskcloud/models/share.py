def generate_id(path_str,id_life):
    from diskcloud.models.mysql import insert_execute,select_execute,update_execute
    from diskcloud.models.string import generate_random_str
    from datetime import datetime,timedelta
    from flask import current_app
    from pathlib import Path

    # set expire time string
    if id_life != 0:
        expire_time = datetime.utcnow() + timedelta(hours=id_life)
        expire_time_str = expire_time.strftime("%y%m%d%H%M%S")
    else:
        expire_time_str = 'permanent'

    result_sel = select_execute("select expire_time,sid from share where path = %s",(path_str,))
    if result_sel != False:
        result_life = valid_expire_time(result_sel[0])
        if result_life == 'permanent':
            return generate_id_return(True,result_sel[1])
        elif result_life:
            result_update = update_execute('update share set expire_time = %s where path = %s',(expire_time_str, path_str))
            if result_update:
                return generate_id_return(True,result_sel[1])
            return generate_id_return(False,'Fail to update expired share.')
        else:
            sid = generate_random_str(8)
            result_update = update_execute('update share set expire_time = %s, sid = %s where path = %s',(expire_time_str, sid, path_str))
            if result_update:
                return generate_id_return(True,sid)
            return generate_id_return(False,'Fail to update expired share.')
    # cannot find the same path
    else:
        username = path_str.split('/',maxsplit=1)[0]
        sid = generate_random_str(8)
        result = insert_execute("insert into share values(%s,%s,%s,%s)",(sid, username, path_str, expire_time_str))
        if result:
            return generate_id_return(True,sid)
        return generate_id_return(False,'SQL Error,cannot generate a share id.')

def generate_id_return(succeed,value):
    if succeed is True:
        return {'succeed': True, 'sid': value}
    else:
        return {'succeed': False, 'reason': value}

def valid_sid(sid):
    from diskcloud.models.verification import re_match
    from diskcloud.models.mysql import select_execute

    if re_match('[a-zA-Z0-9]{8}',sid):
        result = select_execute('select expire_time,path from share where sid = %s',(sid,))
        if result != False:
            if valid_expire_time(result[0]):
                return result[1]
    return False

def valid_expire_time(expire_time_str):
    from datetime import datetime

    if expire_time_str == 'permanent':
        return 'permanent'
    expire_time = datetime.strptime(expire_time_str,"%y%m%d%H%M%S")
    now_time = datetime.utcnow()
    if now_time < expire_time:
        return True
    return False
