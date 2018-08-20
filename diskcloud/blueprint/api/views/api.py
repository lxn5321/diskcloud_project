from flask import request,jsonify,abort,current_app
from pathlib import Path
from diskcloud.models.session import valid_session
from diskcloud.models.file import walk_dir_json
from diskcloud.models.response import gen_error_res

def MainApi(dirpath):
    username = dirpath.split('/',maxsplit=1)[0]
    if valid_session('username',username):
        dirpath = Path(current_app.config['FILES_FOLDER'],dirpath)
        if dirpath.exists():
            if request.method == 'GET':
                if dirpath.is_dir():
                    json_obj = walk_dir_json(dirpath)
                    return jsonify(json_obj)
                elif dirpath.is_file():
                    pass
                else:
                    return gen_error_res(401,'invalid path')
            if request.method == 'POST':
                pass
        else:
            return gen_error_res(404,'path cannot be found')
    return gen_error_res(401,'invalid session')

def GenerateLink():
    pass
