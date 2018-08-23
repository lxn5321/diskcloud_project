from flask import request,jsonify
from pathlib import Path
from diskcloud.models.session import valid_session
from diskcloud.models.response import gen_error_res


def Json(url_path):
    from diskcloud.models.json import walk_dir_json

    path = url_path_check(url_path,True)
    if isinstance(path,Path):
        if request.method == 'GET':
            if path.is_dir():
                json_obj = walk_dir_json(path)
                return jsonify(json_obj)
            elif path.is_file():
                pass
            else:
                return gen_error_res(404,'invalid path')
        if request.method == 'POST':
            pass
    return path

def File(url_path):
    from diskcloud.models.file import download_resource

    path = url_path_check(url_path)
    if isinstance(path,Path):
        if request.method == 'GET':
            result = download_resource(path)
            if result != False:
                return result
            else:
                return gen_error_res(404,'invalid path')
        if request.method == 'POST':
            pass
    return path

def Generate(url_path):
    from diskcloud.models.share import generate_id

    path = url_path_check(url_path)
    if isinstance(path,Path):
        if request.method == 'GET':
            id_life = request.args.get('life','6')
            # str to int
            try:
                id_life = int(id_life)
            except ValueError:
                return gen_error_res(400,'invalid life parameter')
            if not 0 <= id_life <= 24:
                return gen_error_res(400,'invalid life parameter')
            # if path is dir or file,generate share id
            if path.is_dir() or path.is_file():
                username = url_path.split('/',maxsplit=1)[0]
                result = generate_id(username,id_life,path)
                if isinstance(result,list):
                    if result[0] == False:
                        return gen_error_res(500,result[1])
                return jsonify({"sid": result})
            else:
                return gen_error_res(404,'invalid path')
        return gen_error_res(400,'invalid request method')
    return path

def url_path_check(url_path,root_ok=False):
    from flask import current_app

    if root_ok == False:
        if url_path.count('/') == 0:
                return gen_error_res(404,'invalid path')
    username = url_path.split('/',maxsplit=1)[0]
    if valid_session('username',username):
        path = Path(current_app.config['FILES_FOLDER'],url_path)
        if path.exists():
            return path
        else:
            return gen_error_res(404,'path cannot be found')
    return gen_error_res(401,'invalid session')
