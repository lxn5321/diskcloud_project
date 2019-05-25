from flask import request,views
from diskcloud.models.valid import valid_url_path
from diskcloud.models.response import gen_error_res

class FileApi(views.MethodView):
    # route request method
    def get(self,path):
        if request.args.get('info') == '1':
            return self.Info(path)
        if request.args.get('share') == '1':
            return self.GenerateId(path)
        if request.args.get('folder_info') == '1':
            return self.WholeFolderInfo(path)
        return self.Download(path)
    def post(self,path):
        if request.args.get('create_file') == '1':
            return self.CreateFile(path)
        if request.args.get('create_folder') == '1':
            return self.CreateFolder(path)
        if request.args.get('upload_files') == '1':
            return self.UploadFiles(path)
    # def put(self,path):
    #     return 'PUT'+path
    def patch(self,path):
        if request.args.get('af_name', None) is not None:
            return self.Rename(path)
        return self.Move(path)
    def delete(self,path):
        return self.Delete(path)
    # Main Processer
    # url_path = username/path
    def Info(self,url_path):
        from diskcloud.models.file import get_folder_content
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(url_path, True)
        if isinstance(result,dict):
            if result['is_file']:
                pass
            else:
                json_obj = get_folder_content(result['username'], result['path'] , result['name'])
                return gen_json_res(json_obj)
        return result

    def WholeFolderInfo(self,url_path):
        from diskcloud.models.file import get_whole_folder_info
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(url_path, True)
        if isinstance(result,dict):
            if result['path'] == '.' and result['name'] == '.':
                json_obj = get_whole_folder_info(result['username'])
                return gen_json_res(json_obj)
            else:
                return gen_error_res('invalid url', 400)
        return result

    def Download(self,url_path):
        from diskcloud.models.file import download

        return download(url_path)

    def GenerateId(self,url_path):
        from diskcloud.models.share import generate_id
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(url_path)
        if isinstance(result,dict):
            # check id_life
            id_life = request.args.get('life')
            if id_life is None:
                return gen_error_res('invalid life parameter',400)
            try:
                id_life = int(id_life)
            except ValueError:
                return gen_error_res('invalid life parameter',400)
            if not 0 <= id_life <= 24:
                return gen_error_res('invalid life parameter',400)
            # generate share id
            result = generate_id(result['username'], result['path'], result['name'], id_life)
            if result['succeed']:
                return gen_json_res({'sid': result['sid']})
            return gen_error_res(result['reason'],500)
        return result

    def Rename(self,url_path):
        from diskcloud.models.file import rename
        from diskcloud.models.valid import valid_file_name,valid_dir_name

        result = valid_url_path(url_path)
        if isinstance(result,dict):
            af_name = request.args.get('af_name', None)
            if af_name is None:
                return gen_error_res("invalid request args",400)
            if result['is_file']:
                result2 = valid_file_name(af_name)
            else:
                result2 = valid_dir_name(af_name)

            if result2:
                return rename(result['username'], result['path'], result['name'], af_name)
            else:
                return result2
        return result

    def Move(self,url_path):
        from diskcloud.models.file import moveto

        af_path = request.json.get("af_path", None)
        if af_path is None:
            return gen_error_res("request body error,invalid data",400)
        bf_result = valid_url_path(url_path)
        if isinstance(bf_result,dict):
            af_result = valid_url_path(af_path,root_ok=True)
            if isinstance(af_result,dict):
                if af_result['is_file'] is False:
                    return moveto(bf_result['username'], bf_result['path'], bf_result['name'], af_result['path'], af_result['name'])
                return gen_error_res("af_path must be a dir",400)
            return af_result
        return bf_result

    def Delete(self,url_path):
        from diskcloud.models.file import delete

        result = valid_url_path(url_path)
        if isinstance(result,dict):
            return delete(result['username'], result['path'], result['name'], result['is_file'])
        return result

    def CreateFile(self,url_path):
        from diskcloud.models.file import create_file
        from diskcloud.models.valid import valid_file_name

        name = request.args.get('name', None)
        if name is None:
            return gen_error_res("invalid request args",400)
        result = valid_url_path(url_path, True)
        if isinstance(result,dict):
            if result['is_file'] is False:
                if valid_file_name(name):
                    return create_file(result['username'], result['path'], result['name'], name)
                return gen_error_res("invalid file name",400)
            return gen_error_res("path must be a dir",400)
        return result

    def CreateFolder(self,url_path):
        from diskcloud.models.file import create_folder
        from diskcloud.models.valid import valid_dir_name

        name = request.args.get('name', None)
        if name is None:
            return gen_error_res("invalid request args",400)
        result = valid_url_path(url_path, True)
        if isinstance(result,dict):
            if result['is_file'] is False:
                if valid_dir_name(name):
                    return create_folder(result['username'], result['path'], result['name'], name)
                return gen_error_res("invalid folder name",400)
            return gen_error_res("path must be a dir",400)
        return result

    def UploadFiles(self,url_path):
        from diskcloud.models.file import save_file
        from diskcloud.models.valid import valid_file_name

        result = valid_url_path(url_path, True)
        if isinstance(result,dict):
            if result['is_file'] is False:
                files = request.files
                if len(files) == 0:
                    return gen_error_res("no selected file")
                for i in files:
                    if valid_file_name(files[i].filename):
                        result = save_file(result['username'], result['path'],  result['name'], files[i])
                        if result is not True:
                            return result
                    else:
                        return gen_error_res('invalid file name', 400)
                return ('', 200)
            return gen_error_res("path must be a dir",400)
        return result
