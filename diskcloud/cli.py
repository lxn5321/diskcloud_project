import click
from flask.cli import with_appcontext

def init_app(app):
    app.cli.add_command(init_db)
    # app.cli.add_command(add_user)
    app.cli.add_command(remove_user)

@click.command()
@with_appcontext
@click.option('--force',is_flag=True,default=False,help='if database already exists,delete it.')
def init_db(force):
    import MySQLdb as sql
    from flask import current_app
    from pathlib import Path
    from shutil import rmtree
    from os import mkdir
    from time import sleep

    def empty(path):
        for i in path.iterdir():
            if i.is_file():
                i.unlink()
            elif i.is_dir():
                rmtree(i)

    host = current_app.config['MYSQL_HOST']
    username = current_app.config['MYSQL_USERNAME']
    password = current_app.config['MYSQL_PASSWORD']
    db = sql.connect(host,username,password,charset='utf8')
    c = db.cursor()
    c.execute('show databases')
    result = c.fetchall()
    is_exist = False
    for i in range(len(result)):
        if result[i][0] == 'diskcloud':
            is_exist = True
            break
    if is_exist and not force:
        c.close()
        db.close()
        click.echo("the diskcloud database already exist,if you want to delete it\nplease enter:flask init_db --force.")
        return False
    elif is_exist and force:
        user_path = Path(current_app.config['FILES_FOLDER'], 'user')
        trash_can_path = Path(current_app.config['FILES_FOLDER'], 'trash_can')
        tar_path = Path(current_app.config['FILES_FOLDER'], 'tar')
        try:
            empty(user_path)
            empty(trash_can_path)
            empty(tar_path)
            c.execute('drop database diskcloud')
        except:
            c.close()
            db.close()
            raise
    try:
        c.execute('create database diskcloud')
        c.execute('use diskcloud')
        c.execute(
              'CREATE TABLE `user` ('
    	    + '`username` VARCHAR(32) NOT NULL,'
    	    + '`password` CHAR(64) NOT NULL,'
    	    + '`cookie_id` CHAR(64) NULL DEFAULT NULL,'
            + '`email` VARCHAR(255) NOT NULL,'
    	    + 'PRIMARY KEY (`username`))'
            + 'COLLATE="utf8_general_ci"'
            + 'ENGINE=InnoDB;'
        )
        c.execute(
              'CREATE TABLE `storage` ('
            + '`username` VARCHAR(32) NOT NULL,'
        	+ '`path` VARCHAR(3500) NOT NULL,'
        	+ '`name` VARCHAR(255) NOT NULL,'
        	+ '`size` CHAR(12) NULL DEFAULT NULL,'
        	+ '`type` TINYINT(1) UNSIGNED NOT NULL,'
        	+ '`star` TINYINT(1) UNSIGNED NOT NULL DEFAULT "0",'
        	+ '`trash_can` TINYINT(1) UNSIGNED NOT NULL DEFAULT "0",'
        	+ '`share` TINYINT(1) UNSIGNED NOT NULL DEFAULT "0",'
        	+ '`sid` CHAR(8) NULL DEFAULT NULL,'
        	+ '`modify_time` CHAR(12) NOT NULL,'
        	+ '`star_time` CHAR(12) NULL DEFAULT NULL,'
        	+ '`share_time` CHAR(12) NULL DEFAULT NULL,'
        	+ '`expire_time` CHAR(12) NULL DEFAULT NULL,'
        	+ '`trash_can_time` CHAR(12) NULL DEFAULT NULL,'
        	+ 'PRIMARY KEY (`username`, `path`(500), `name`, `trash_can`),'
        	+ 'CONSTRAINT `FK_storage_user` FOREIGN KEY (`username`) REFERENCES `user`' + '(`username`))'
            + 'COLLATE="utf8_general_ci"'
            + 'ENGINE=InnoDB;'
        )
    except Exception as e:
        c.close()
        db.close()
        raise e
    c.close()
    db.close()
    click.echo("init db success!")
    return True

# @click.command()
# @with_appcontext
# @click.option('--username', required=True, prompt='username', help='username')
# @click.option('--password', required=True, prompt='password', hide_input=True, confirmation_prompt=True, help='password')
# @click.option('--email', required=True, prompt='password', hide_input=True, confirmation_prompt=True, help='password')
# @click.option('--force', is_flag=True, default=False, help='if user already exists,delete it.')
# def add_user(username, password, force):
#     from diskcloud.libs.mysql import select_execute, update_execute, insert_execute, delete_execute, db_commit, db_rollback
#     from diskcloud.libs.string import hash_sha3
#     from diskcloud.libs.valid import valid_username, valid_password
#     from shutil import rmtree
#     from os import mkdir
#     from pathlib import Path
#     from flask import current_app
#     from time import sleep
#
#     if not valid_username(username):
#         click.echo("invalid username!")
#         return False
#     elif not valid_password(password):
#         click.echo("invalid password!")
#         return False
#     password = hash_sha3(password)
#     user_path = Path(current_app.config['FILES_FOLDER'], 'user', username).as_posix()
#     trash_can_path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username).as_posix()
#     tar_path = Path(current_app.config['FILES_FOLDER'], 'tar', username).as_posix()
#     result = select_execute('select password from user where username = %s', (username,))
#     if len(result) != 0:
#         if not force:
#             click.echo("the username already exist,if you want to delete it,please add '--force' to enforce.")
#             return False
#         else:
#             try:
#                 rmtree(user_path)
#                 rmtree(trash_can_path)
#                 rmtree(tar_path)
#                 sleep(0.5)
#                 mkdir(user_path)
#                 mkdir(trash_can_path)
#                 mkdir(tar_path)
#             except:
#                 raise
#             delete_execute('delete from storage where username = %s', (username,))
#             result = update_execute('update user set password = %s where username = %s', (password, username))
#     else:
#         try:
#             mkdir(user_path)
#             mkdir(trash_can_path)
#             mkdir(tar_path)
#         except:
#             raise;
#         result = insert_execute('insert into user(username, password) values(%s, %s)', (username, password))
#     if result:
#         db_commit()
#         click.echo("create user success!");
#         return True
#     db_rollback()
#     click.echo("create user fail!")
#     return False

@click.command()
@with_appcontext
@click.option('--username', required=True, prompt='username', help='username')
def remove_user(username):
    from diskcloud.libs.mysql import select_execute, delete_execute, db_commit, db_rollback
    from diskcloud.libs.valid import valid_username
    from shutil import rmtree
    from pathlib import Path
    from flask import current_app

    if not valid_username(username):
        click.echo("invalid username!")
        return False
    user_path = Path(current_app.config['FILES_FOLDER'], 'user', username).as_posix()
    trash_can_path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username).as_posix()
    tar_path = Path(current_app.config['FILES_FOLDER'], 'tar', username).as_posix()
    result = select_execute('select password from user where username = %s', (username,))
    if len(result) != 0:
        try:
            rmtree(user_path)
            rmtree(trash_can_path)
            rmtree(tar_path)
        except FileNotFoundError:
            pass
        except:
            raise
        delete_execute('delete from storage where username = %s', (username,))
        result = delete_execute('delete from user where username = %s', (username,))
    else:
        click.echo("this user is not exist!")
        return False
    if result:
        db_commit()
        click.echo("remove user success!")
        return True
    db_rollback()
    click.echo("remove user fail!")
    return False
