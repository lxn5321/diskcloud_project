def _get_db():
    from flask import current_app,g
    import MySQLdb as sql

    if 'db' not in g:
        sql_host = current_app.config['MYSQL_HOST']
        sql_username = current_app.config['MYSQL_USERNAME']
        sql_password = current_app.config['MYSQL_PASSWORD']
        g.db = sql.connect(sql_host,sql_username,sql_password,'diskcloud',charset='utf8')
    return g.db

def _get_cursor():
    return _get_db().cursor()

def select_execute(statement, tuple):
    c = _get_cursor()
    value = c.execute(statement, tuple)
    result = c.fetchall()
    c.close()
    return result

def update_execute(statement, tuple):
    db = _get_db()
    c = db.cursor()
    value = c.execute(statement, tuple)
    if value == 1:
        result = True
    else:
        result = False
    c.close()
    return result

def insert_execute(statement, tuple):
    return update_execute(statement, tuple)

def delete_execute(statement, tuple):
    return update_execute(statement, tuple)

def db_commit():
    db = _get_db()
    db.commit()

def db_rollback():
    db = _get_db()
    db.rollback()
