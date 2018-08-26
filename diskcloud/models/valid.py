# success: return True fail: return False
def re_match(pattern,value):
    import re

    match_obj = re.match(pattern,value)
    if match_obj == None:
        return False
    return True

def valid_username(username):
    return re_match('^[a-zA-Z]{1}[a-zA-Z0-9_\-]{7,31}$',username)

def valid_password(password):
    return re_match('^[a-zA-Z0-9_!@#$%,\+\-\^\.]{8,32}$',password)

def valid_user(username,pw_hashed):
    from diskcloud.models.mysql import select_execute

    pw = select_execute('select password from user where username = %s',(username,))
    if pw == False:
        return False
    if pw[0] == pw_hashed:
        return True
    return False

def valid_file_name(name):
    if len(name) <= 64:
        return re_match('^[\w!@#$%,\+\-\^]{1}([ ]?[\w!@#$%,.\+\-\^])*[ ]?[\w!@#$%,\+\-\^]{1}$',name)
    return False

def valid_dir_name(name):
    if len(name) <= 64:
        return re_match('^[\w!@#$%,\+\-\^]{1}([ ]?[\w!@#$%,\+\-\^])*$',name)
    return False

def valid_url_path(url_path,root_ok=False):
    from flask import current_app
    from pathlib import Path
    from diskcloud.models.session import valid_session
    from diskcloud.models.response import gen_error_res

    url_path = url_path.strip().replace('..','').replace('~','')
    if url_path.endswith('/'):
        return gen_error_res('invalid path.',400)
    if root_ok == False:
        if url_path.count('/') == 0:
            return gen_error_res('invalid path,path cannot be root dir.',404)
    username = url_path.split('/',maxsplit=1)[0]
    if valid_session('username',username):
        path = Path(current_app.config['FILES_FOLDER'],url_path)
        if path.exists():
            if path.is_file():
                return {'url_path': url_path,'is_file': True}
            elif path.is_dir():
                if url_path == username:
                    return {'url_path': url_path, 'is_file': False, 'is_username': True}
                return {'url_path': url_path, 'is_file': False}
        else:
            return gen_error_res('invalid path,path is not dir or file.',404)
    return gen_error_res('invalid session.',401)
