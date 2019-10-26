def download(path):
    from flask import current_app,make_response
    from pathlib import Path
    from tarfile import open
    from urllib.parse import quote
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.valid import valid_url_path

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
                    tar.add(Path(current_app.config['FILES_FOLDER'],'user',path).as_posix(), arcname = complete_path.stem)
            except FileExistsError:
                from os import remove

                remove(complete_path_str)
                with open(complete_path_str,'x') as tar:
                    tar.add(Path(current_app.config['FILES_FOLDER'],'user',path).as_posix(), arcname = complete_path.stem)
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
        response.headers['X-Accel-Redirect'] = current_app.config['NGINX_X_ACCEL_REDIRECT'] + '/' +complete_path.relative_to(current_app.config['FILES_FOLDER']).as_posix()
        response.headers['Content-Disposition'] = "attachment;filename=" + filename_escape + ";filename*=UTF-8''" + filename_escape
        response.headers['Content-Length'] = content_length
        response.headers['Content-Type'] = content_mime
        return response
    else:
        return result

def get_folder_content(username, path, name):
    from pathlib import Path
    from diskcloud.libs.mysql import select_execute

    path = Path(path, name).as_posix()
    dir_list = []
    file_list = []
    result = select_execute('select type, name, modify_time, star, size from storage where username = %s and path = %s and trash_can = %s', (username, path, 0))
    for i in range(len(result)):
        if result[i][0] == 1:
            dir_list.append([result[i][1], result[i][2], result[i][3]])
        else:
            file_list.append([result[i][1], result[i][2], result[i][3], result[i][4]])
    json_obj = {'directories': dir_list,'files': file_list}
    return json_obj

def get_whole_folder_info(username):
    from diskcloud.libs.mysql import select_execute
    from pathlib import Path

    def walk(username, path):
        dir_dict = {}
        result = select_execute('select name from storage where username = %s and path = %s and type = %s and trash_can = %s', (username, path, 1, 0))
        for i in range(len(result)):
            dir_dict[result[i][0]] = walk(username, Path(path, result[i][0]).as_posix())
        if len(dir_dict) == 0:
            return '0'
        return dir_dict

    json_obj = walk(username, '.')
    return json_obj

def get_star_info(username):
    from diskcloud.libs.mysql import select_execute

    dir_list = []
    file_list = []
    result = select_execute('select type, name, star_time, size, path from storage where username = %s and star = %s and trash_can = %s', (username, 1, 0))
    for i in range(len(result)):
        if result[i][0] == 1:
            dir_list.append([result[i][1], result[i][2], result[i][4]])
        else:
            file_list.append([result[i][1], result[i][2], result[i][3], result[i][4]])
    json_obj = {'directories': dir_list, 'files': file_list}
    return json_obj

def get_share_info(username):
    from diskcloud.libs.mysql import select_execute

    dir_list = []
    file_list = []
    result = select_execute('select type, name, share_time, expire_time, star, path from storage where username = %s and share = %s and trash_can = %s', (username, 1, 0))
    for i in range(len(result)):
        if result[i][0] == 1:
            dir_list.append([result[i][1], result[i][2], result[i][3], result[i][4], result[i][5]])
        else:
            file_list.append([result[i][1], result[i][2], result[i][3], result[i][4], result[i][5]])
    json_obj = {'directories': dir_list, 'files': file_list}
    return json_obj

def get_trash_can_info(username):
    from diskcloud.libs.mysql import select_execute

    dir_list = []
    file_list = []
    result = select_execute('select type, name, trash_can_time, star, size, path from storage where username = %s and trash_can = %s', (username, 1))
    for i in range(len(result)):
        is_internal = False
        path = result[i][5]
        if path != '.':
            for n in range(len(result)):
                if result[i][5].rsplit('/', maxsplit = 1)[-1] == result[n][1]:
                    is_internal = True
                    break
        if not is_internal:
            if result[i][0] == 1:
                dir_list.append([result[i][1], result[i][2], result[i][3], result[i][5]])
            else:
                file_list.append([result[i][1], result[i][2], result[i][3], result[i][4], result[i][5]])
    json_obj = {'directories': dir_list, 'files': file_list}
    return json_obj

def get_search_info(username, search_name):
    from diskcloud.libs.mysql import select_execute
    from diskcloud.libs.string import name_parse

    dir_list = []
    file_list = []
    result = select_execute('select type, name, modify_time, star, size, path from storage where username = %s and trash_can = %s and name like %s', (username, 0, name_parse(search_name)))
    for i in range(len(result)):
        if result[i][0] == 1:
            dir_list.append([result[i][1], result[i][2], result[i][3], result[i][5]])
        else:
            file_list.append([result[i][1], result[i][2], result[i][3], result[i][4], result[i][5]])
    json_obj = {'directories': dir_list, 'files': file_list}
    return json_obj

def rename(username, path, name, af_name, is_file):
    from pathlib import Path
    from flask import current_app
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.mysql import select_execute, update_execute, db_commit, db_rollback

    def walk(username, path, af_path):
        result = select_execute('select name, type from storage where username = %s and path = %s and trash_can = %s', (username, path, 0))
        update_result = True
        for i in range(len(result)):
            update_result = update_result and update_execute('update storage set path = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_path, username, path, result[i][0], 0))
            if result[i][1] == 1:
                update_result = update_result and walk(username, Path(path, result[i][0]).as_posix(), Path(af_path, result[i][0]).as_posix())
        return update_result

    af_name = generate_name(username, path, af_name, 0)
    result = True
    if not is_file:
        result = walk(username, Path(path, name).as_posix(), Path(path, af_name).as_posix())
    if result and update_execute('update storage set name = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_name, username, path, name, 0)):
        bf_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name)
        af_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, af_name)
        try:
            bf_path.rename(af_path)
        except:
            db_rollback()
            return gen_error_res('重命名失败', 500)
        db_commit()
        return ('', 200)
    return gen_error_res('更新数据库失败', 500)

def moveto(username, bf_path, bf_name, af_path, af_name, is_file):
    from pathlib import Path
    from flask import current_app
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.mysql import update_execute, db_commit, db_rollback

    def walk(username, path, af_path):
        result = select_execute('select name, type from storage where username = %s and path = %s and trash_can = %s', (username, path, 0))
        update_result = True
        for i in range(len(result)):
            update_result = update_result and update_execute('update storage set path = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_path, username, path, result[i][0], 0))
            if result[i][1] == 1:
                update_result = update_result and walk(username, Path(path, result[i][0]).as_posix(), Path(af_path, result[i][0]).as_posix())
        return update_result

    af_path = Path(af_path, af_name).as_posix()
    af_name = generate_name(username, af_path, bf_name, 0)
    result = True
    if not is_file:
        result = walk(username, Path(bf_path, bf_name).as_posix(), Path(af_path, af_name).as_posix())
    if result and update_execute('update storage set path = %s, name = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_path, af_name, username, bf_path, bf_name, 0)):
        bf_path = Path(current_app.config['FILES_FOLDER'], 'user', username, bf_path, bf_name)
        af_path = Path(current_app.config['FILES_FOLDER'], 'user', username, af_path, af_name)
        try:
            bf_path.rename(af_path)
        except:
            db_rollback()
            return gen_error_res('移动失败', 500)
        db_commit()
        return ('', 200)
    else:
        return gen_error_res('更新数据库失败', 500)

def create_file(username, path, name, filename):
    from pathlib import Path
    from flask import current_app
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.time import now_time_str
    from diskcloud.libs.mysql import insert_execute, db_commit, db_rollback

    path = Path(path, name).as_posix()
    filename = generate_name(username, path, filename, 0)
    if insert_execute('insert into storage(username, path, name, size, modify_time, type) values(%s, %s, %s, %s, %s, %s)', (username, path, filename, 0, now_time_str(), 0)):
        try:
            path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, filename).as_posix()
            file = open(path,'a+')
            file.close()
        except:
            db_rollback()
            return gen_error_res('创建文件失败', 500)
        db_commit()
        return ('',200)
    else:
        db_rollback()
        return gen_error_res('向数据库内插入数据失败', 500)

def create_folder(username, path, name, foldername):
    from pathlib import Path
    from os import mkdir
    from flask import current_app
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.time import now_time_str
    from diskcloud.libs.mysql import insert_execute, db_commit, db_rollback

    path = Path(path, name).as_posix()
    foldername = generate_name(username, path, foldername, 0)
    if insert_execute('insert into storage(username, path, name, modify_time, type) values(%s, %s, %s, %s, %s)', (username, path, foldername, now_time_str(), 1)):
        path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, foldername).as_posix()
        try:
            mkdir(path)
        except:
            db_rollback()
            return gen_error_res('fail to create folder', 500)
        db_commit()
        return ('',200)
    else:
        db_rollback()
        return gen_error_res('向数据库内插入数据失败', 500)

def save_file(username, path, name, file):
    from pathlib import Path
    from flask import current_app
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.time import now_time_str
    from diskcloud.libs.mysql import insert_execute, db_commit, db_rollback

    path = Path(path, name).as_posix()
    filename = generate_name(username, path, file.filename, 0)
    whole_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, filename)
    whole_path_str = whole_path.as_posix()
    try:
        file.save(whole_path_str)
    except:
        return gen_error_res('保存已上传的文件失败', 500)
    if insert_execute('insert into storage(username, path, name, size, modify_time, type) values(%s, %s, %s, %s, %s, %s)', (username, path, filename, whole_path.stat().st_size, now_time_str(), 0)):
        db_commit()
        return True
    return gen_error_res('向数据库内插入数据失败', 500)

def star(username, path, name):
    from diskcloud.libs.mysql import update_execute, db_commit, db_rollback
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.time import now_time_str

    result = update_execute('update storage set star = %s, star_time = %s where username = %s and path = %s and name = %s and trash_can = %s', (1, now_time_str(), username, path, name, 0))
    if result:
        db_commit()
        return ('', 200)
    db_rollback()
    return gen_error_res('更新数据库失败', 500)

def unstar(username, path, name):
    from diskcloud.libs.mysql import update_execute, db_commit, db_rollback
    from diskcloud.libs.response import gen_error_res

    result = update_execute('update storage set star = %s, star_time = %s where username = %s and path = %s and name = %s and trash_can = %s', (0, None, username, path, name, 0))
    if result:
        db_commit()
        return ('', 200)
    db_rollback()
    return gen_error_res('更新数据库失败', 500)

def trash_can(username, path, name, is_file):
    from diskcloud.libs.mysql import select_execute, update_execute, db_commit, db_rollback
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.time import now_time_str
    from pathlib import Path
    from flask import current_app
    from shutil import move

    def walk(username, bf_path, af_path):
        result = select_execute('select name, type from storage where username = %s and path = %s and trash_can = %s', (username, bf_path.as_posix(), 0))
        update_result = True
        for i in range(len(result)):
            af_name = generate_name(username, af_path.as_posix(), result[i][0], 1)
            folder_path = Path(current_app.config['FILES_FOLDER'], 'user', username, bf_path)
            update_result = update_result and update_execute('update storage set path = %s, name = %s, trash_can = %s, trash_can_time = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_path.as_posix(), af_name, 1, now_time_str(), username, bf_path.as_posix(), result[i][0], 0))
            if af_name != result[i][0]:
                Path(folder_path, result[i][0]).rename(Path(folder_path, af_name))
            if result[i][1] == 1:
                update_result = update_result and walk(username, Path(bf_path, result[i][0]), Path(af_path, af_name))
        return update_result

    af_name = generate_name(username, path, name, 1)
    bf_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, name)
    af_path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username, path, af_name)
    result = update_execute('update storage set name = %s, trash_can = %s, trash_can_time = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_name, 1, now_time_str(), username, path, name, 0))

    try:
        if is_file:
            af_path.parent.mkdir(parents = True, exist_ok = True)
            move(bf_path.as_posix(), af_path.as_posix())
        else:
            result = result and walk(username, Path(path, name), Path(path, af_name))

            if af_path.is_dir():
                for child in bf_path.iterdir():
                    move(child.as_posix(), af_path.as_posix())
                bf_path.rmdir()
            elif not af_path.exists():
                move(bf_path.as_posix(), af_path.as_posix())
    except:
        db_rollback()
        return gen_error_res('移动失败', 500)

    if result:
        db_commit()
        return ('', 200)
    else:
        db_rollback()
        return gen_error_res('更新数据库失败', 500)

def untrash_can(username, path, name, is_file):
    from diskcloud.libs.mysql import select_execute, update_execute, db_commit, db_rollback
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.time import now_time_str
    from pathlib import Path
    from flask import current_app
    from shutil import move

    def is_empty(generator):
        try:
            i = next(generator)
        except StopIteration:
            return True
        return False

    def walk(username, path, af_path):
        result = select_execute('select name, type from storage where username = %s and path = %s and trash_can = %s', (username, path, 1))
        update_result = True
        for i in range(len(result)):
            update_result = update_result and update_execute('update storage set path = %s, trash_can = %s, trash_can_time = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_path, 0, now_time_str(), username, path, result[i][0], 1))
            if result[i][1] == 1:
                update_result = update_result and walk(username, Path(path, result[i][0]).as_posix(), Path(af_path, result[i][0]).as_posix())
        return update_result

    af_name = generate_name(username, path, name, 0)
    result = update_execute('update storage set name = %s, trash_can = %s, trash_can_time = %s where username = %s and path = %s and name = %s and trash_can = %s', (af_name, 0, None, username, path, name, 1))

    if not is_file:
        result = result and walk(username, Path(path, name).as_posix(), Path(path, af_name).as_posix())
    if result:
        bf_path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username, path, name)
        af_path = Path(current_app.config['FILES_FOLDER'], 'user', username, path, af_name)
        try:
            move(bf_path.as_posix(), af_path.as_posix())
            if bf_path.parent.resolve() != Path(current_app.config['FILES_FOLDER'], 'trash_can', username).resolve() and is_empty(bf_path.parent.iterdir()):
                bf_path.parent.rmdir()
        except:
            db_rollback()
            return gen_error_res('无法还原，原文件夹可能更名或移动了位置', 500)
        db_commit()
        return ('', 200)
    db_rollback()
    return gen_error_res('更新数据库失败', 500)

def delete(username, path, name, is_file):
    from pathlib import Path
    from shutil import rmtree
    from os import remove
    from flask import current_app
    from diskcloud.libs.response import gen_error_res
    from diskcloud.libs.mysql import select_execute, delete_execute, db_commit, db_rollback

    def is_empty(generator):
        try:
            i = next(generator)
        except StopIteration:
            return True
        return False

    def delete_db(username, path, name):
        return delete_execute('delete from storage where username = %s and path = %s and name = %s and trash_can = %s', (username, path, name, 1))

    def delete_folder_db(username, path, name):
        if delete_db(username, path, name):
            path = Path(path, name).as_posix()
            result = select_execute('select name, type from storage where username = %s and path = %s and trash_can = %s', (username, path, 1))
            for i in range(len(result)):
                if result[i][1] == 0:
                    if delete_db(username, path, result[i][0]) is False:
                        return False
                else:
                    if delete_folder_db(username, path, result[i][0]) is False:
                        return False
            return True
        return False

    def in_trash_can(username, path, name):
        result = select_execute('select name from storage where username = %s and path = %s and name = %s and trash_can = %s', (username, path, name, 1))
        if len(result) != 0:
            return True
        return False

    if in_trash_can(username, path, name):
        if is_file:
            if delete_db(username, path, name):
                path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username, path, name)
                try:
                    remove(path.as_posix())
                    if path.parent.resolve() != Path(current_app.config['FILES_FOLDER'], 'trash_can', username).resolve() and is_empty(path.parent.iterdir()):
                        path.parent.rmdir()
                except:
                    db_rollback()
                    return gen_error_res('删除失败',500)
                db_commit()
                return ('', 200)
            else:
                return gen_error_res('更新数据库失败', 500)
        else:
            if delete_folder_db(username, path, name):
                path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username, path, name).as_posix()
                try:
                    rmtree(path)
                except:
                    db_rollback()
                    return gen_error_res('删除失败',500)
                db_commit()
                return ('', 200)
            else:
                db_rollback()
                return gen_error_res('更新数据库失败', 500)
    return gen_error_res("不能删除，因为该文件或文件夹不在回收站中")

def empty_trash_can(username):
    from diskcloud.libs.mysql import delete_execute, db_commit, db_rollback
    from diskcloud.libs.response import gen_error_res
    from pathlib import Path
    from flask import current_app

    def delete_file(path):
        for i in path.iterdir():
            if i.is_file():
                i.unlink()
            elif i.is_dir():
                delete_file(i)
    def delete_folder(path):
        try:
            next(path.iterdir())
        except StopIteration:
            path.rmdir()
            return
        for i in path.iterdir():
            if i.is_dir():
                delete_folder(i)
        path.rmdir()
    def empty(path):
        delete_file(path)
        delete_folder(path)
        path.mkdir()

    if delete_execute('delete from storage where username = %s and trash_can = %s', (username, 1)):
        trash_can_path = Path(current_app.config['FILES_FOLDER'], 'trash_can', username)
        try:
            empty(trash_can_path)
        except:
            db_rollback()
            return gen_error_res('清空回收站失败',500)
        db_commit()
        return ('', 200)
    else:
        db_rollback()
        return gen_error_res('更新数据库失败', 500)

def generate_name(username, path, name, trash_can):
    from diskcloud.libs.mysql import select_execute
    from re import escape

    def get_index(name):
        if name.rfind(')') + 1 == name.rfind('.') or name.rfind(')') + 1== len(name):
            name_stem = name.rsplit('.', maxsplit = 1)[0]
            index1 = name_stem.rfind('(')
            index2 = name_stem.rfind(')')
            try:
                index = int(name_stem[index1 + 1: index2])
            except ValueError:
                return False
            return index
        return False

    if 1 <= get_index(name) < 10000:
        name1 = name[0:name.rfind('(')] + name[name.rfind(')') + 1:]
    else:
        name1 = name

    name_stem = name1.rsplit('.', maxsplit = 1)[0]
    try:
        name_suffix = name1.rsplit('.', maxsplit = 1)[1]
    except IndexError:
        name_suffix = ''
    if name_suffix == '':
        name_exp = '^' + escape(name1) + '(\\([1-9]{1}[0-9]*\\))?$'
    else:
        name_exp = '^' + escape(name_stem) + '(\\([1-9]{1}[0-9]*\\))?\\.' + escape(name_suffix) + '$'
    result = select_execute('select name from storage where username = %s and path = %s and name REGEXP %s and trash_can = %s', (username, path, name_exp, trash_can))
    number = []
    for i in range(len(result)):
        if result[i][0] == name:
            number.append(0)
            index = get_index(name)
            if index:
                number.append(index)
        else:
            index = get_index(result[i][0])
            if index:
                number.append(index)
    for i in range(10000):
        if i not in number:
            if i == 0:
                af_name = name
            else:
                index = len(name_stem)
                af_name = name1[0:index] + '(' + str(i) + ')' + name1[index:]
            break
    return af_name

def get_size(path):
    import os

    return os.path.getsize(path)

def get_mime(path):
    from .mime import MIME

    return MIME.get(path.suffix)
