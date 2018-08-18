import os
from flask import request,jsonify,abort
from pathlib import PurePath
from diskcloud.models.session import valid_session,delete_session as del_session
from diskcloud.models.file import get_files_folder,walk_dir_json

def MainApi(username):
    if valid_session('username',username):
        user_path = PurePath(get_files_folder(),username)
        if os.path.exists(user_path):
            if request.method == 'GET':
                json_obj = walk_dir_json(user_path)
                return jsonify(json_obj)
            if request.method == 'POST':
                pass
        else:
            response = jsonify({'reason': 'path cannot be found'})
            response.status_code = 404
            return response
    response = jsonify({'reason': 'invalid session'})
    response.status_code = 401
    return response

def GenerateLink(username):
    pass
