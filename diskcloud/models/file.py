from flask import send_from_directory,current_app

def file_resource(path):
    path_str = path.resolve().as_posix()
    arr = path_str.rsplit('/',maxsplit=1)
    dirpath = arr[0]
    filename = arr[1]
    return  send_from_directory(dirpath,filename,as_attachment=True)

def compress_resource(path,url_path):
    import tarfile
    import pathlib
    tar_path = pathlib.Path(current_app.config['COMPRESS_FOLDER'], url_path + '.tar')
    tar_path_str = tar_path.resolve().as_posix()
    pathlib.Path(tar_path.parent).mkdir(parents=True,exist_ok=True)
    try:
        with tarfile.open(tar_path_str,'x') as tar:
            tar.add(path,arcname=path.name)
    except FileExistsError:
        pass
    arr = tar_path_str.rsplit('/',maxsplit=1)
    dirpath = arr[0]
    filename = arr[1]
    return  send_from_directory(dirpath,filename,as_attachment=True)
    # path_str = path.resolve().as_posix()
    # if path_str.endswith('/'):
    #     path_str = path_str.rsplit('/',maxsplit=1)[0]
