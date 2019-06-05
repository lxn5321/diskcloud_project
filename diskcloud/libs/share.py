def generate_id(username, path, name, id_life):
    from diskcloud.libs.mysql import select_execute, update_execute, db_commit, db_rollback
    from diskcloud.libs.string import generate_random_str
    from diskcloud.libs.time import strftime, now_time, now_time_str
    from datetime import timedelta
    from pathlib import Path

    # set expire time string
    if id_life != 0:
        expire_time = now_time() + timedelta(hours=id_life)
        expire_time_str = strftime(expire_time)
    else:
        expire_time_str = 'permanent'

    result_sel = select_execute("select expire_time,sid from storage where username = %s and path = %s and name = %s",(username, path, name))
    if result_sel[0][0] != None and result_sel[0][1] != None:
        result_life = valid_expire_time(result_sel[0][0])
        if result_life == 'permanent':
            return generate_id_return(True,result_sel[0][1])
        elif result_life:
            result_update = update_execute('update storage set share_time = %s, expire_time = %s where username = %s and path = %s and name = %s',(now_time_str(), expire_time_str, username, path, name))
            if result_update:
                db_commit()
                return generate_id_return(True,result_sel[0][1])
            db_rollback()
            return generate_id_return(False,'Fail to update expired share.')
        else:
            sid = generate_random_str(8)
            result_update = update_execute('update storage set share_time = %s, expire_time = %s, sid = %s where username = %s and path = %s and name = %s',(now_time_str(), expire_time_str, sid, username, path , name))
            if result_update:
                db_commit()
                return generate_id_return(True,sid)
            db_rollback()
            return generate_id_return(False,'Fail to generate a share id')
    sid = generate_random_str(8)
    result_update = update_execute('update storage set share = %s, share_time = %s, expire_time = %s, sid = %s where username = %s and path = %s and name = %s', (1 , now_time_str(), expire_time_str, sid, username, path , name))
    if result_update:
        db_commit()
        return generate_id_return(True,sid)
    db_rollback()
    return generate_id_return(False,'Fail to generate a share id')

def get_sid(username, path, name):
    from diskcloud.libs.mysql import select_execute
    from diskcloud.libs.response import gen_error_res
    from pathlib import Path

    result = select_execute('select sid from storage where username = %s and path = %s and name = %s', (username, path, name));
    sid = result[0][0]
    if sid != None:
        return {'sid': sid}
    else:
        return gen_error_res('fail to get the sid', 500)

def generate_id_return(succeed,value):
    if succeed is True:
        return {'succeed': True, 'sid': value}
    else:
        return {'succeed': False, 'reason': value}

def unshare(username, path, name):
    from diskcloud.libs.mysql import update_execute, db_commit, db_rollback
    from diskcloud.libs.response import gen_error_res

    result = update_execute('update storage set share = %s, share_time = %s, expire_time = %s, sid = %s where username = %s and path = %s and name = %s', (0, None, None, None, username, path, name))
    if result:
        db_commit()
        return ('', 200)
    db_rollback()
    return gen_error_res('fail to update datebase', 500)

def valid_sid(sid):
    from diskcloud.libs.valid import re_match
    from diskcloud.libs.mysql import select_execute

    if re_match('[a-zA-Z0-9]{8}',sid):
        result = select_execute('select expire_time,username,path,name from storage where sid = %s',(sid,))
        if len(result) != 0:
            if valid_expire_time(result[0][0]):
                return [result[0][1], result[0][2], result[0][3]]
    return False

def valid_expire_time(expire_time_str):
    from diskcloud.libs.time import now_time, strptime

    if expire_time_str == 'permanent':
        return 'permanent'
    expire_time = strptime(expire_time_str)
    if now_time() < expire_time:
        return True
    return False
