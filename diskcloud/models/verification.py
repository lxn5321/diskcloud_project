from diskcloud.models.mysql import select_execute,update_execute

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
    pw = select_execute('select password from user where username = %s',(username,))
    if pw == False:
        return False
    if pw[0] == pw_hashed:
        return True
    return False

# success: return username fail: return False
def get_username_cookie(cookie_id):
    username = select_execute("select username from user where cookie_id = %s",(cookie_id,))
    if username == False:
        return False
    return username[0]

# success: return cookie_id fail: return False
def set_cookie_id(username):
    import secrets

    cookie_id = secrets.token_hex(32)
    value = update_execute("update user set cookie_id = %s where username = %s",(cookie_id,username))
    if value == True:
        value = cookie_id
    return value
