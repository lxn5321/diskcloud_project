
# success: return username fail: return False
def get_username_cookie(cookie_id):
    from diskcloud.models.mysql import select_execute

    result = select_execute("select username from user where cookie_id = %s",(cookie_id,))
    if len(result) != 0:
        return result[0][0]
    return False

# success: return cookie_id fail: return False
def set_cookie_id(username):
    import secrets
    from diskcloud.models.mysql import update_execute, db_commit, db_rollback

    cookie_id = secrets.token_hex(32)
    result = update_execute("update user set cookie_id = %s where username = %s", (cookie_id, username))
    if result is True:
        db_commit()
        return cookie_id
    db_rollback()
    return False
