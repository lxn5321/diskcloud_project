from flask import request,redirect,render_template,url_for,make_response,current_app

from diskcloud.models.session import create_session,get_value_session,delete_session as del_session
from diskcloud.models.valid import valid_user
from diskcloud.models.string import hash_sha3
from diskcloud.models.cookie import get_username_cookie,set_cookie_id

def Login():
    if request.method == 'POST':
        username  = request.form.get('username')
        password = request.form.get('password')
        pw_hashed = hash_sha3(password)
        if valid_user(username,pw_hashed):
            create_session('username',username)
            response = redirect(url_for('DiskCloud.Main',username = username))
            if request.form.get('enable_cookie',False):
                cookie_id = set_cookie_id(username)
                if cookie_id:
                    response.set_cookie('login_id',cookie_id,86400,domain=current_app.config['SESSION_COOKIE_DOMAIN'],path=current_app.config['SESSION_COOKIE_PATH'],httponly=current_app.config['SESSION_COOKIE_HTTPONLY'],secure=current_app.config['SESSION_COOKIE_SECURE'],samesite=current_app.config['SESSION_COOKIE_SAMESITE'])
                else:
                    return render_template('error.html',err_mes = 'Setting cooike failed')
            return response
        else:
            return render_template('error.html',err_mes = 'Login error,wrong username or password')

    cookie_id = request.cookies.get('login_id')
    if request.args.get('logout'):
        response = make_response(render_template('login.html'))
        if cookie_id:
            response.delete_cookie('login_id',path=current_app.config['SESSION_COOKIE_PATH'],domain=current_app.config['SESSION_COOKIE_DOMAIN'])
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
