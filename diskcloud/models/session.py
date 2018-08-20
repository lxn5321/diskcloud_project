from datetime import datetime,timedelta
from flask import session

def create_session(session_name,session_value):
    session[session_name] = session_value

def valid_session(session_name,correct_value):
    value = session_exise(session_name)
    if value:
        if correct_value == value:
            return True
        else:
            session.pop(session_name)
    return False

def get_value_session(session_name):
    if session_exise(session_name):
        return session[session_name]
    else:
        return False

def session_exise(session_name):
    try:
        value = session[session_name]
        if value:
            return value
        return False
    except KeyError:
        return False

def delete_session(session_name):
    if session_exise(session_name):
        session.pop(session_name)
        return True
    return False
