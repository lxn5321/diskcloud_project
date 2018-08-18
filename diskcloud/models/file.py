import os
from pathlib import Path,PurePath
from flask import current_app
import time

#return Pathlib.concrete paths class
def get_files_folder():
    files_folder = current_app.config['FILES_FOLDER']
    return Path(files_folder).resolve()

def walk_dir_json(path):
    obj = {}
    for a,b,c in os.walk(path):
        dirs_list = []
        files_list = []

        if a == str(path):
            root_path = "/"
        else:
            #change root_path to posix path in windows os
            root_path = str(PurePath(a).as_posix()).replace(str(path.as_posix()),'',1)

        for i in b:
            dir_list = [i,get_mtime(os.path.join(a,i))]
            dirs_list.append(dir_list)

        for i in c:
            real_path = os.path.join(a,i)
            file_list = [i,get_mtime(real_path),get_size(real_path)]
            files_list.append(file_list)

        root_dict = {'directories': dirs_list,'files': files_list}
        obj[root_path] = root_dict
    return obj


def get_mtime(path):
    mtime = os.path.getmtime(path)
    mtime_s = time.strftime("%y-%m-%d %H:%M",time.localtime(mtime))
    return mtime_s

def get_size(path):
    size = os.path.getsize(path)
    return size
