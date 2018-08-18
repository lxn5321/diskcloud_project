from flask import request,redirect,render_template,session,url_for,make_response

from diskcloud.models.session import create_session,get_value_session,delete_session as del_session
from diskcloud.models.models import valid_user,hash_sha3,set_cookie_id,get_username_cookie,form_exist

def Login():
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

    if request.method == 'POST':
        username  = request.form['username']
        password = request.form['password']
        pw_hashed = hash_sha3(password)
        if valid_user(username,pw_hashed):
            create_session('username',username)
            response = redirect(url_for('DiskCloud.Main',username = username))
            if form_exist('enable_cookie'):
                cookie_id = set_cookie_id(username)
                if cookie_id:
                    response.set_cookie('login_id',cookie_id,43200,path='/',httponly = True)
                else:
                    return render_template('error.html',err_mes = 'Setting cooike failed')
            return response
        else:
            return render_template('error.html',err_mes = 'Login error,invalid username or password')

    return render_template('login.html')
