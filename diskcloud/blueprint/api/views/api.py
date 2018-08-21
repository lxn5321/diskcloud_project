from flask import request,jsonify,abort,current_app
from pathlib import Path
from diskcloud.models.session import valid_session
from diskcloud.models.json import walk_dir_json
from diskcloud.models.response import gen_error_res
from diskcloud.models.file import file_resource,compress_resource

def Json(path):
    username = path.split('/',maxsplit=1)[0]
    if valid_session('username',username):
        path = Path(current_app.config['FILES_FOLDER'],path)
        if path.exists():
            if request.method == 'GET':
                if path.is_dir():
                    json_obj = walk_dir_json(path)
                    return jsonify(json_obj)
                elif path.is_file():
                    pass
                else:
                    return gen_error_res(401,'invalid path')
            if request.method == 'POST':
                pass
        else:
            return gen_error_res(404,'path cannot be found')
    return gen_error_res(401,'invalid session')

def File(url_path):
    if url_path.endswith('/'):
        url_path = url_path.rsplit('/',maxsplit=1)[0]
    username = url_path.split('/',maxsplit=1)[0]
    if valid_session('username',username):
        path = Path(current_app.config['FILES_FOLDER'],url_path)
        if path.exists():
            if request.method == 'GET':
                if path.is_dir():
                    return compress_resource(path,url_path)
                elif path.is_file():
                    return file_resource(path)
                else:
                    return gen_error_res(401,'invalid path')
            if request.method == 'POST':
                pass
        else:
            return gen_error_res(404,'path cannot be found')
    return gen_error_res(401,'invalid session')
