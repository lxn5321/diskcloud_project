#return Pathlib.concrete paths class

def walk_dir_json(path):
    dirs_list = []
    files_list = []
    for c_path in path.iterdir():
        if c_path.is_dir():
            dir_name = c_path.name
            dir_mtime = get_mtime(c_path)
            dirs_list.append([dir_name,dir_mtime])
        if c_path.is_file():
            file_name = c_path.name
            file_mtime = get_mtime(c_path)
            file_size = get_size(c_path)
            files_list.append([file_name,file_mtime,file_size])
    return {'directories': dirs_list,'files': files_list}

def get_mtime(path):
    import time
    mtime = path.stat().st_mtime
    mtime_s = time.strftime("%y-%m-%d %H:%M",time.localtime(mtime))
    return mtime_s

def get_size(path):
    return path.stat().st_size
