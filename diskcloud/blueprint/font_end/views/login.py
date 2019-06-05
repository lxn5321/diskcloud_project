from flask import request,redirect,render_template,url_for,make_response,current_app
from diskcloud.libs.session import create_session,get_value_session,delete_session
from diskcloud.libs.valid import valid_user
from diskcloud.libs.string import hash_sha3
from diskcloud.libs.cookie import get_username_cookie,set_cookie_id

def Login():
    if request.args.get('logout'):
        response = make_response(render_template('login.html'))
        delete_session('username')
        return response

    username = get_value_session('username')
    if username:
        return redirect(url_for('FontEnd.Main',username = username))

    cookie_id = request.cookies.get('login_id')
    if cookie_id:
        username = get_username_cookie(cookie_id)
        if username:
            create_session('username',username)
            return redirect(url_for('FontEnd.Main',username = username))
        else:
            response = make(render_template('login.html'))
            response.set_cookie('login_id',path=current_app.config['SESSION_COOKIE_PATH'],domain=current_app.config['SESSION_COOKIE_DOMAIN'],secure=current_app.config['SESSION_COOKIE_SECURE'],samesite=current_app.coconfig['SESSION_COOKIE_SAMESITE'])

    return render_template('login.html')
