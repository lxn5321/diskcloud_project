def _get_db():
    from flask import g,current_app
    import MySQLdb as sql

    if 'db' not in g:
        sql_host = current_app.config['MYSQL_HOST']
        sql_username = current_app.config['MYSQL_USERNAME']
        sql_password = current_app.config['MYSQL_PASSWORD']
        g.db = sql.connect(sql_host,sql_username,sql_password,'diskcloud',charset='utf8')
    return g.db

def _get_cursor():
    return _get_db().cursor()

def valid_user(username,pw_hashed):
    c = _get_cursor()
    value = c.execute("select * from user where username = %s and password = %s",(username,pw_hashed))
    c.close()
    if value == 1:
        return True
    return False

# return a 64bit Hexadecimal as pw_hashed
def hash_sha3(password):
    import hashlib
    pw_hashed = hashlib.sha3_256(password.encode('utf-8')).hexdigest()
    return pw_hashed

# success: return username fail: return False
def get_username_cookie(cookie_id):
    c = _get_cursor()
    value = c.execute("select username from user where cookie_id = %s",(cookie_id,))
    if value == 1:
        username = c.fetchone()
        c.close()
        return username[0]
    c.close()
    return False

# success: return cookie_id fail: return False
def set_cookie_id(username):
    import secrets

    cookie_id = secrets.token_hex(32)
    db = _get_db()
    c = db.cursor()
    value = c.execute("update user set cookie_id = %s where username = %s",(cookie_id,username))
    if value == 1:
        db.commit()
        result = cookie_id
    else:
        db.rollback()
        result = False
    c.close()
    return result

def form_exist(form_id):
    from flask import request

    try:
        if request.form[form_id]:
            return True
        return False
    except KeyError:
        return False
