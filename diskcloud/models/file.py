def download(path):
    from flask import current_app,make_response
    from pathlib import Path
    from tarfile import open
    from urllib.parse import quote
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.valid import valid_url_path

    result = valid_url_path(path)
    if isinstance(result,dict):
        if result['is_file'] is True:
            complete_path = Path(current_app.config['FILES_FOLDER'],'user',path)
            complete_path_str = complete_path.resolve().as_posix()
            if current_app.config['TESTING'] == False:
                content_length = get_size(complete_path)
                content_mime = get_mime(complete_path)
        if result['is_file'] is False:
            complete_path = Path(current_app.config['FILES_FOLDER'], 'tar', path + '.tar')
            complete_path_str = complete_path.resolve().as_posix()
            Path(complete_path.parent).mkdir(parents=True,exist_ok=True)
            try:
                with open(complete_path_str,'x') as tar:
                    tar.add(Path(current_app.config['FILES_FOLDER'],'user',path).as_posix(), arcname = complete_path.name)
            except FileExistsError:
                from os import remove

                remove(complete_path_str)
                with open(complete_path_str,'x') as tar:
                    tar.add(Path(current_app.config['FILES_FOLDER'],'user',path).as_posix(), arcname = complete_path.name)
            if current_app.config['TESTING'] == False:
                content_length = get_size(complete_path)
                content_mime = "application/x-tar"

        filename = complete_path_str.rsplit('/',maxsplit=1)[1]

        if current_app.config['TESTING'] == True:
            from flask import send_from_directory

            dirname = complete_path_str.rsplit('/',maxsplit=1)[0]
            return send_from_directory(dirname, filename, as_attachment=True)

        response = make_response('')
        filename_escape = quote(filename)
        response.headers['X-Accel-Redirect'] = current_app.config['NGINX_X_ACCEL_REDIRECT'] + complete_path.relative_to(current_app.config['FILES_FOLDER']).as_posix()
        response.headers['Content-Disposition'] = "attachment;filename=" + filename_escape + ";filename*=UTF-8''" + filename_escape
        response.headers['Content-Length'] = content_length
        response.headers['Content-Type'] = content_mime
        return response
    else:
        return result

def get_folder_content(username, path, name):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.mysql import select_execute

    path = Path(path, name).as_posix()
    dir_list = []
    file_list = []
    result = select_execute('select name, mtime from storage where username = %s and path = %s and type = %s', (username, path, 1))
    for i in range(len(result)):
        dir_list.append([result[i][0], result[i][1]])
    result = select_execute('select name, mtime, size from storage where username = %s and path = %s and type = %s', (username, path, 0))
    for i in range(len(result)):
        file_list.append([result[i][0], result[i][1], result[i][2]])
    json_obj = {'directories': dir_list,'files': file_list}
    return json_obj

def get_whole_folder_info(username):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.mysql import select_execute

    def walk(username, path):
        dir_list = []
        dir_dict = {}
        result = select_execute('select name from storage where username = %s and path = %s and type = %s', (username, path, 1))
        for i in range(len(result)):
            dir_list.append(result[i][0])
        if len(dir_list) != 0:
            for i in dir_list:
                dir_dict[i] = walk(username, Path(path, i).as_posix())
            return dir_dict
        return '0'

    json_obj = walk(username, '.')
    return json_obj

def rename(username, path, name, af_name):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.mysql import update_execute, db_commit, db_rollback

    if update_execute('update storage set name = %s where username = %s and path = %s and name = %s', (af_name, username, path, name)):
        bf_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name)
        af_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, af_name)
        try:
            bf_path.rename(af_path)
        except:
            db_rollback()
            return gen_error_res('fail to rename', 500)
        db_commit()
        return ('', 200)
    return gen_error_res('fail to update datebase', 500)

def moveto(username, bf_path, bf_name, af_path, af_name):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.mysql import update_execute, db_commit, db_rollback

    path = Path(af_path, af_name).as_posix()

    if update_execute('update storage set path = %s where username = %s and path = %s and name = %s', (path, username, bf_path, bf_name)):
        bf_path = Path(current_app.config['FILES_FOLDER'], 'user', username, bf_path, bf_name)
        af_path = Path(current_app.config['FILES_FOLDER'], 'user', username, af_path, af_name, bf_name)
        try:
            bf_path.rename(af_path)
        except:
            db_rollback()
            return gen_error_res('fail to move', 500)
        db_commit()
        return ('', 200)
    else:
        return gen_error_res('fail to update datebase', 500)

def delete(username, path, name, is_file):
    from pathlib import Path
    from shutil import rmtree
    from os import remove
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.mysql import select_execute, delete_execute, db_commit, db_rollback

    def delete_db(username, path, name):
        return delete_execute('delete from storage where username = %s and path = %s and name = %s', (username, path, name))

    def delete_folder_db(username, path, name):
        if delete_db(username, path, name):
            path = Path(path, name).as_posix()
            result = select_execute('select name from storage where username = %s and path = %s and type = %s', (username, path, 0))
            for i in range(len(result)):
                if delete_db(username, path, result[i][0]) is False:
                    return False
            result = select_execute('select name from storage where username = %s and path = %s and type = %s', (username, path, 1))
            for i in range(len(result)):
                if delete_folder_db(username, path, result[i][0]) is False:
                    return False
            return True
        return False

    if is_file is True:
        if delete_db(username, path, name):
            path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name).as_posix()
            try:
                remove(path)
            except:
                db_rollback()
                return gen_error_res('fail to delete',500)
            db_commit()
            return ('', 200)
        else:
            return gen_error_res('fail to update datebase', 500)
    else:
        if delete_folder_db(username, path, name):
            path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name).as_posix()
            try:
                rmtree(path)
            except:
                db_rollback()
                return gen_error_res('fail to delete',500)
            db_commit()
            return ('', 200)
        else:
            db_rollback()
            return gen_error_res('fail to update datebase', 500)

def create_file(username, path, name, filename):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.time import now_time_str
    from diskcloud.models.mysql import insert_execute, db_commit, db_rollback

    if insert_execute('insert into storage(username, path, name, size, mtime, type) values(%s, %s, %s, %s, %s, %s)', (username, Path(path, name).as_posix(), filename, 0, now_time_str(), 0)):
        try:
            path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name, filename).as_posix()
            file = open(path,'a+')
            file.close()
        except:
            db_rollback()
            return gen_error_res('fail to create file', 500)
        db_commit()
        return ('',200)
    else:
        db_rollback()
        return gen_error_res('fail to insert data to datebase', 500)

def create_folder(username, path, name, foldername):
    from pathlib import Path
    from os import mkdir
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.time import now_time_str
    from diskcloud.models.mysql import insert_execute, db_commit, db_rollback

    if insert_execute('insert into storage(username, path, name, mtime, type) values(%s, %s, %s, %s, %s)', (username, Path(path, name).as_posix(), foldername, now_time_str(), 1)):
        path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name, foldername).as_posix()
        try:
            mkdir(path)
        except:
            db_rollback()
            return gen_error_res('fail to create folder', 500)
        db_commit()
        return ('',200)
    else:
        db_rollback()
        return gen_error_res('fail to insert data to datebase', 500)

def save_file(username, path, name, file):
    from pathlib import Path
    from flask import current_app
    from diskcloud.models.response import gen_error_res
    from diskcloud.models.time import now_time_str
    from diskcloud.models.mysql import insert_execute, db_commit, db_rollback

    whole_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name, file.filename)
    whole_path_str = whole_path.as_posix()
    try:
        file.save(whole_path_str)
    except:
        return gen_error_res('fail to save uploaded file', 500)
    if insert_execute('insert into storage(username, path, name, size, mtime, type) values(%s, %s, %s, %s, %s, %s)', (username, Path(path, name).as_posix(), file.filename, whole_path.stat().st_size, now_time_str(), 0)):
        db_commit()
        return True
    return gen_error_res('fail to insert data to datebase', 500)

def get_mime(path):
    from .mime import MIME

    return MIME.get(path.suffix)
