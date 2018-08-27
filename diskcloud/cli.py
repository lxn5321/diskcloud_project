import click
from flask.cli import with_appcontext

def init_app(app):
    app.cli.add_command(init_db)

@click.command()
@with_appcontext
@click.option('--force',is_flag=True,default=False,help='if database already exists,delete it.')
def init_db(force):
    import MySQLdb as sql
    from flask import current_app

    host = current_app.config['MYSQL_HOST']
    username = current_app.config['MYSQL_USERNAME']
    password = current_app.config['MYSQL_PASSWORD']
    db = sql.connect(host,username,password,charset='utf8')
    c = db.cursor()
    c.execute('show databases')
    arr = c.fetchall()
    if not force:
        for i in arr:
            if i[0] == 'diskcloud':
                c.close()
                db.close()
                click.echo("the diskcloud database already exist,if you want to delete it,please enter:flask init_db --force")
                return False
    try:
        c.execute('drop database diskcloud')
    except Exception as e:
        if(e.args[0] == 1008):
            pass
        else:
            raise e
    c.execute('create database diskcloud')
    c.execute('use diskcloud')
    c.execute('CREATE TABLE `user` (`username` VARCHAR(32) NOT NULL,`password` CHAR(64) NOT NULL,`cookie_id` CHAR(64) NULL DEFAULT NULL,PRIMARY KEY (`username`)) COLLATE="utf8mb4_0900_ai_ci" ENGINE=InnoDB;')
    c.execute('CREATE TABLE `share` (`sid` CHAR(8) NOT NULL,`username` VARCHAR(32) NOT NULL,`path` VARCHAR(1350) NOT NULL,`expire_time` CHAR(12) NOT NULL,PRIMARY KEY (`sid`),INDEX `FK_share_user` (`username`),CONSTRAINT `FK_share_user` FOREIGN KEY (`username`) REFERENCES `user` (`username`)) COLLATE="utf8mb4_0900_ai_ci" ENGINE=InnoDB;')
    c.close()
    db.close()
    click.echo("init db success!")
    return True
