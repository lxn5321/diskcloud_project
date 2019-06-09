from flask import request,views,current_app
from diskcloud.libs.response import gen_error_res

class UserApi(views.MethodView):
    def post(self):
        if request.args.get('login') == '1':
            return self.Login()
        if request.args.get('register') == '1':
            return self.Register()

    def Login(self):
        from diskcloud.libs.string import hash_sha3
        from diskcloud.libs.valid import valid_user
        from diskcloud.libs.response import gen_json_res
        from diskcloud.libs.cookie import set_cookie_id
        from diskcloud.libs.session import create_session

        username  = request.json.get('username')
        password = request.json.get('password')
        pw_hashed = hash_sha3(password)
        if valid_user(username,pw_hashed):
            create_session('username',username)
            if request.json.get('enable_cookie') == 'true':
                cookie_id = set_cookie_id(username)
                if cookie_id:
                    return gen_json_res({'login_id': cookie_id,
                    'max_age': current_app.config['SESSION_COOKIE_AGE'], 'domain': current_app.config['SESSION_COOKIE_DOMAIN'], 'path': current_app.config['SESSION_COOKIE_PATH'], 'secure': current_app.config['SESSION_COOKIE_SECURE'], 'samesite': current_app.config['SESSION_COOKIE_SAMESITE']})
                else:
                    return gen_error_res('不能设置COOKIE', 500)
            return ('', 200)
        else:
            return gen_error_res('错误的用户名或密码', 403)

    def Register(self):
        from os import mkdir
        from pathlib import Path
        from diskcloud.libs.string import hash_sha3
        from diskcloud.libs.session import create_session
        from diskcloud.libs.mysql import select_execute, insert_execute, db_commit, db_rollback

        if current_app.config['CAN_REGISTER']:
            username  = request.json.get('username')
            password = request.json.get('password')
            email = request.json.get('email')
            pw_hashed = hash_sha3(password)

            result = select_execute('select password from user where username = %s', (username,))
            if len(result) == 0:
                result = select_execute('select password from user where email = %s', (email,))
                if len(result) == 0:
                    result = insert_execute('insert into user(username, password, email) values(%s, %s, %s)', (username, pw_hashed, email))
                    if result:
                        user_path = Path(current_app.config['FILES_FOLDER'], 'user', username).as_posix()
                        trash_can_path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username).as_posix()
                        tar_path = Path(current_app.config['FILES_FOLDER'], 'tar', username).as_posix()
                        try:
                            mkdir(user_path)
                            mkdir(trash_can_path)
                            mkdir(tar_path)
                        except FileExistsError:
                            pass
                        except:
                            raise
                        db_commit()
                        create_session('username',username)
                        return ('', 200)
                    else:
                        db_rollback()
                        return gen_error_res('数据库插入数据失败', 500)
                return gen_error_res('该email已被使用', 403)
            return gen_error_res('该用户名已被使用', 403)
        return gen_error_res('注册功能暂不开放', 403)
