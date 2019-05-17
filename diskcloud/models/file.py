def download(path,is_file=None):
    from flask import current_app,make_response
    from pathlib import Path
    from tarfile import open
    from urllib.parse import quote
    from diskcloud.models.response import gen_error_res

    if isinstance(path,Path):
        file_path = path
        sub_path = file_path.relative_to(current_app.config['FILES_FOLDER']).as_posix()
    else:
        file_path = Path(current_app.config['FILES_FOLDER'],path)
        sub_path = path

    if is_file is None:
        if file_path.exists():
            if file_path.is_file():
                is_file = True
            else:
                is_file = False
        else:
            return gen_error_res('invalid path,path is not file or dir.',404)

    if is_file is True and current_app.config['TESTING'] == False:
        content_length = get_size(file_path)
        content_mime = get_mime(file_path)
    if is_file is False:
        sub_path = Path(current_app.config['COMPRESS_FOLDER'], sub_path + '.tar').as_posix()
        tar_path = Path(current_app.config['FILES_FOLDER'], sub_path)
        tar_path_str = tar_path.resolve().as_posix()
        Path(tar_path.parent).mkdir(parents=True,exist_ok=True)
        try:
            with open(tar_path_str,'x') as tar:
                tar.add(file_path,arcname=file_path.name)
        except FileExistsError:
            from os import remove
            
            remove(tar_path_str)
            with open(tar_path_str,'x') as tar:
                tar.add(file_path,arcname=file_path.name)
        if current_app.config['TESTING'] == False:
            content_length = get_size(tar_path)
            content_mime = "application/x-tar"

    filename = sub_path.rsplit('/',maxsplit=1)[1]

    if current_app.config['TESTING'] == True:
        from flask import send_from_directory

        dirname = Path(current_app.config['FILES_FOLDER'], sub_path).resolve().as_posix().rsplit('/',maxsplit=1)[0]
        return send_from_directory(dirname, filename, as_attachment=True)

    response = make_response('')
    filename_escape = quote(filename)
    response.headers['X-Accel-Redirect'] = current_app.config['NGINX_X_ACCEL_REDIRECT'] + sub_path
    response.headers['Content-Disposition'] = "attachment;filename=" + filename_escape + ";filename*=UTF-8''" + filename_escape
    response.headers['Content-Length'] = content_length
    response.headers['Content-Type'] = content_mime
    return response

def get_info(path_str):
    from pathlib import Path
    from flask import current_app

    dirs_list = []
    files_list = []
    root_path = Path(current_app.config['FILES_FOLDER'],path_str)
    for c_path in root_path.iterdir():
        if c_path.is_dir():
            dir_name = c_path.name
            dir_mtime = get_mtime(c_path)
            dirs_list.append([dir_name,dir_mtime])
        if c_path.is_file():
            file_name = c_path.name
            file_mtime = get_mtime(c_path)
            file_size = get_size(c_path)
            files_list.append([file_name,file_mtime,file_size])
    json_obj = {'directories': dirs_list,'files': files_list}
    return json_obj

def walk_dir_folder(username):
    from pathlib import Path
    from flask import current_app

    def walk(path):
        dir_list = [c_path for c_path in path.iterdir() if c_path.is_dir()]
        dir_dict = {}
        if len(dir_list) != 0:
            for c_path in dir_list:
                dir_dict[c_path.name] = walk(c_path)
            return dir_dict
        return '0'
    root_path = Path(current_app.config['FILES_FOLDER'],username)
    json_obj = walk(root_path)
    return json_obj

def moveto(bf_path,af_path):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.response import gen_error_res

    bf_path_suffix= bf_path.rsplit('/',maxsplit=1)[1]
    file_folder = current_app.config['FILES_FOLDER']
    before_path = Path(file_folder,bf_path)
    after_path = Path(file_folder,af_path,bf_path_suffix)
    before_path.rename(after_path)
    return ('',200)

def rename(path_str,name,is_file):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.valid import valid_file_name,valid_dir_name
    from diskcloud.models.response import gen_error_res

    try:
        if is_file:
            if valid_file_name(name):
                path_prefix = path_str.rsplit('/',maxsplit=1)[0]
                file_folder = current_app.config['FILES_FOLDER']
                before_path = Path(file_folder,path_str)
                after_path = Path(file_folder,path_prefix,name)
                before_path.rename(after_path)
                return ('',200)
        else:
            if valid_dir_name(name):
                path_prefix = path_str.rsplit('/',maxsplit=1)[0]
                file_folder = current_app.config['FILES_FOLDER']
                before_path = Path(file_folder,path_str)
                after_path = Path(file_folder,path_prefix,name)
                before_path.rename(after_path)
                return ('',200)
    except:
        return gen_error_res('fail to rename', 500)
    return gen_error_res('invalid name', 400)

def delete(path_str,is_file):
    from pathlib import Path
    from shutil import rmtree
    from os import remove
    from flask import current_app
    from diskcloud.models.response import gen_error_res

    file_path = Path(current_app.config['FILES_FOLDER'],path_str).as_posix()
    try:
        if is_file is True:
            remove(file_path)
        else:
            rmtree(file_path)
        return ('',200)
    except:
        return gen_error_res('fail to delete',500)

def create_file(path_str,name):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.valid import valid_file_name

    if valid_file_name(name):
        file_path = Path(current_app.config['FILES_FOLDER'],path_str,name).as_posix()
        try:
            file = open(file_path,'a+')
            file.close()
            return ('',200)
        except:
            return gen_error_res('fail to create file', 500)
    return gen_error_res('invalid file name', 400)

def create_folder(path_str, name):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.valid import valid_dir_name
    from os import mkdir

    if valid_dir_name(name):
        folder_path = Path(current_app.config['FILES_FOLDER'],path_str,name).as_posix()
        try:
            mkdir(folder_path)
            return ('',200)
        except:
            return gen_error_res('fail to create folder', 500)
    return gen_error_res('invalid folder name', 400)

def save_file(path_str, file):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.valid import valid_file_name
    from diskcloud.models.response import gen_error_res

    if valid_file_name(file.filename):
        try:
            file.save(Path(current_app.config['FILES_FOLDER'],path_str,file.filename).as_posix())
            return True
        except:
            return gen_error_res('fail to save uploaded file', 500)
    return gen_error_res('invalid file name', 400)

def get_mtime(path):
    import time

    mtime = path.stat().st_mtime
    mtime_s = time.strftime("%y-%m-%d %H:%M",time.localtime(mtime))
    return mtime_s

def get_size(path):
    return path.stat().st_size

def get_mime(path):
    from .mime import MIME
    suffix = path.suffix
    return MIME.get(suffix)
