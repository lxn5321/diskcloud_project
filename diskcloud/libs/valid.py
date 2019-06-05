# success: return True fail: return False
def re_match(pattern,value):
    import re

    match_obj = re.match(pattern, value)
    if match_obj == None:
        return False
    return True

def valid_username(username):
    return re_match('^[a-zA-Z]{1}[a-zA-Z0-9_\-]{7,31}$',username)

def valid_password(password):
    return re_match('^[a-zA-Z0-9_!@#$%,\+\-\^\.]{8,32}$',password)

def valid_user(username,pw_hashed):
    from diskcloud.libs.mysql import select_execute

    if len(username) > 32:
        return False
    result = select_execute('select password from user where username = %s',(username,))
    if len(result) == 0:
        return False
    if result[0][0] == pw_hashed:
        return True
    return False

def valid_file_name(name):
    if len(name) <= 255:
        return re_match('^[\w!@#$%,\+\-\^\(\)]{1}([ ]?[\w!@#$%,.\+\-\^\(\)])*?[\w!@#$%,\+\-\^\(\)]{1}$',name)
    return False

def valid_dir_name(name):
    if len(name) <= 255:
        return re_match('^[\w!@#$%,\+\-\^\(\)]{1}([ ]?[\w!@#$%,\+\-\^\(\)])*$',name)
    return False

def valid_url_path(url_path, root_ok=False):
    from pathlib import Path
    from diskcloud.libs.session import valid_session
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.mysql import select_execute

    url_path = url_path.strip().replace('..','').replace('~','')
    if url_path.endswith('/'):
        return gen_error_res('invalid path.',400)
    if url_path.count('/') == 0:
        if root_ok == False:
            return gen_error_res('invalid path,path cannot be root dir.',404)
        username = url_path
        if valid_session('username', username):
            return {'username': username, 'path': '.', 'name': '.', 'is_file': False}
        else:
            return gen_error_res('invalid session.',401)
    elif url_path.count('/') == 1:
        path = '.'
        username, name = url_path.split('/', maxsplit = 1)
    else:
        username, others = url_path.split('/', maxsplit = 1)
        path, name = others.rsplit('/', maxsplit = 1)
    if valid_session('username',username):
        result = select_execute("select type from storage where username = %s and path = %s and name = %s", (username, path, name))
        if result[0][0] == 0:
            return {'username': username, 'path': path, 'name': name, 'is_file': True}
        elif result[0][0] == 1:
            return {'username': username, 'path': path, 'name': name, 'is_file': False}
        else:
            return gen_error_res('invalid path.',404)
    else:
        return gen_error_res('invalid session.',401)
