from flask import request,redirect,render_template,url_for,make_response

from diskcloud.models.session import create_session,get_value_session,delete_session as del_session
from diskcloud.models.verification import get_username_cookie,valid_username,valid_password,valid_user,set_cookie_id
from diskcloud.models.string import hash_sha3

def Login():
    if request.method == 'POST':
        username  = request.form.get('username')
        password = request.form.get('password')
        if valid_username(username) and valid_password(username):
            pw_hashed = hash_sha3(password)
            if valid_user(username,pw_hashed):
                create_session('username',username)
                response = redirect(url_for('DiskCloud.Main',username = username))
                if request.form.get('enable_cookie',False):
                    cookie_id = set_cookie_id(username)
                    if cookie_id:
                        response.set_cookie('login_id',cookie_id,43200,path='/',httponly = True)
                    else:
                        return render_template('error.html',err_mes = 'Setting cooike failed')
                return response
            else:
                return render_template('error.html',err_mes = 'Login error,wrong username or password')
        else:
            return render_template('error.html',err_mes = 'Login error,invalid username or password')

    cookie_id = request.cookies.get('login_id')
    if request.args.get('logout'):
        response = make_response(render_template('login.html'))
        if cookie_id:
            response.delete_cookie('login_id')
        del_session('username')
        return response

    username = get_value_session('username')
    if username:
        return redirect(url_for('DiskCloud.Main',username = username))

    if cookie_id:
        username = get_username_cookie(cookie_id)
        if username:
            create_session('username',username)
            return redirect(url_for('DiskCloud.Main',username = username))
        else:
            response = make(render_template('login.html'))
            response.delete_cookie('login_id')
            return response

    return render_template('login.html')
