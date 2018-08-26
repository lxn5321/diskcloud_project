from diskcloud.models.mysql import select_execute,update_execute
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
