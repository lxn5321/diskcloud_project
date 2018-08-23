from flask import send_from_directory,current_app
from pathlib import Path
from diskcloud.models.response import gen_error_res

def download_resource(path):
    if not isinstance(path,Path):
        path = Path(path)
    if path.is_file():
        path_str = path.resolve().as_posix()
        arr = path_str.rsplit('/',maxsplit=1)
        dirpath = arr[0]
        filename = arr[1]
        return  send_from_directory(dirpath,filename,as_attachment=True)
    elif path.is_dir():
        path_str = path.relative_to(current_app.config['FILES_FOLDER']).as_posix()
        tar_path = Path(current_app.config['COMPRESS_FOLDER'], path_str + '.tar')
        tar_path_str = tar_path.resolve().as_posix()
        Path(tar_path.parent).mkdir(parents=True,exist_ok=True)
        try:
            with tarfile.open(tar_path_str,'x') as tar:
                tar.add(path,arcname=path.name)
        except FileExistsError:
            pass
        arr = tar_path_str.rsplit('/',maxsplit=1)
        dirpath = arr[0]
        filename = arr[1]
        return  send_from_directory(dirpath,filename,as_attachment=True)
    else
        return False
