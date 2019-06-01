from flask import request,views
from diskcloud.models.valid import valid_url_path
from diskcloud.models.response import gen_error_res

class FileApi(views.MethodView):
    # route request method
    def get(self,path):
        if request.args.get('info') == '1':
            return self.Info(path)
        if request.args.get('folder_info') == '1':
            return self.WholeFolderInfo(path)
        if request.args.get('star_info') == '1':
            return self.StarInfo(path)
        if request.args.get('share_info') == '1':
            return self.ShareInfo(path)
        if request.args.get('trash_can_info') == '1':
            return self.TrashCanInfo(path)
        if request.args.get('search_info') == '1':
            return self.SearchInfo(path)
        if request.args.get('sid') == '1':
            return self.ShareId(path)
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
        if request.args.get('star') == '1':
            return self.Star(path)
        if request.args.get('star') == '0':
            return self.Unstar(path)
        if request.args.get('share') == '1':
            return self.Share(path)
        if request.args.get('share') == '0':
            return self.Unshare(path)
        if request.args.get('trash_can') == '1':
            return self.Trashcan(path)
        if request.args.get('trash_can') == '0':
            return self.Untrashcan(path)
        if request.json:
            if request.json.get('af_name', None):
                return self.Rename(path)
            if request.json.get("af_path", None):
                return self.Move(path)
    def delete(self,path):
        return self.Delete(path)
    # Main Processer
    # path = username/path
    def Info(self, path):
        from diskcloud.models.file import get_folder_content
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(path, True)
        if isinstance(result, dict):
            if result['is_file']:
                pass
            else:
                json_obj = get_folder_content(result['username'], result['path'] , result['name'])
                return gen_json_res(json_obj)
        return result

    def WholeFolderInfo(self, path):
        from diskcloud.models.file import get_whole_folder_info
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(path, True)
        if isinstance(result,dict):
            if result['path'] == '.' and result['name'] == '.':
                json_obj = get_whole_folder_info(result['username'])
                return gen_json_res(json_obj)
            else:
                return gen_error_res('invalid url', 400)
        return result

    def StarInfo(self, path):
        from diskcloud.models.file import get_star_info
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(path, True)
        if isinstance(result, dict):
            if result['path'] == '.' and result['name'] == '.':
                json_obj = get_star_info(result['username'])
                return gen_json_res(json_obj)
            else:
                return gen_error_res('invalid url', 400)
        return result

    def ShareInfo(self, path):
        from diskcloud.models.file import get_share_info
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(path, True)
        if isinstance(result, dict):
            if result['path'] == '.' and result['name'] == '.':
                json_obj = get_share_info(result['username'])
                return gen_json_res(json_obj)
            else:
                return gen_error_res('invalid url', 400)
        return result

    def TrashCanInfo(self, path):
        from diskcloud.models.file import get_trash_can_info
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(path, True)
        if isinstance(result, dict):
            if result['path'] == '.' and result['name'] == '.':
                json_obj = get_trash_can_info(result['username'])
                return gen_json_res(json_obj)
            else:
                return gen_error_res('invalid url', 400)
        return result

    def SearchInfo(self, path):
        from diskcloud.models.file import get_search_info
        from diskcloud.models.response import gen_json_res

        search_text = request.args.get('search_text', None)
        if search_text is None:
            return gen_error_res("invalid request args",400)
        result = valid_url_path(path, True)
        if isinstance(result, dict):
            if result['path'] == '.' and result['name'] == '.':
                json_obj = get_search_info(result['username'], search_text)
                return gen_json_res(json_obj)
            else:
                return gen_error_res('invalid url', 400)
        return result

    def ShareId(self, path):
        from diskcloud.models.share import get_sid
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(path)
        if isinstance(result, dict):
            result = get_sid(result['username'], result['path'], result['name']);
            if isinstance(result, dict):
                return gen_json_res(result)
        return result

    def Download(self, path):
        from diskcloud.models.file import download

        return download(path)

    def Move(self, path):
        from diskcloud.models.file import moveto

        bf_result = valid_url_path(path)
        if isinstance(bf_result,dict):
            af_path = request.json.get("af_path")
            af_result = valid_url_path(af_path,root_ok=True)
            if isinstance(af_result,dict):
                if af_result['is_file'] is False:
                    return moveto(bf_result['username'], bf_result['path'], bf_result['name'], af_result['path'], af_result['name'])
                return gen_error_res("af_path must be a dir",400)
            return af_result
        return bf_result

    def Delete(self,path):
        from diskcloud.models.file import delete

        result = valid_url_path(path)
        if isinstance(result,dict):
            return delete(result['username'], result['path'], result['name'], result['is_file'])
        return result

    def CreateFile(self,path):
        from diskcloud.models.file import create_file
        from diskcloud.models.valid import valid_file_name

        name = request.args.get('name', None)
        if name is None:
            return gen_error_res("invalid request args",400)
        result = valid_url_path(path, True)
        if isinstance(result,dict):
            if result['is_file'] is False:
                if valid_file_name(name):
                    return create_file(result['username'], result['path'], result['name'], name)
                return gen_error_res("invalid file name",400)
            return gen_error_res("path must be a dir",400)
        return result

    def CreateFolder(self,path):
        from diskcloud.models.file import create_folder
        from diskcloud.models.valid import valid_dir_name

        name = request.args.get('name', None)
        if name is None:
            return gen_error_res("invalid request args",400)
        result = valid_url_path(path, True)
        if isinstance(result,dict):
            if result['is_file'] is False:
                if valid_dir_name(name):
                    return create_folder(result['username'], result['path'], result['name'], name)
                return gen_error_res("invalid folder name",400)
            return gen_error_res("path must be a dir",400)
        return result

    def UploadFiles(self,path):
        from diskcloud.models.file import save_file
        from diskcloud.models.valid import valid_file_name

        result = valid_url_path(path, True)
        if isinstance(result,dict):
            if result['is_file'] is False:
                files = request.files
                if len(files) == 0:
                    return gen_error_res("no selected file")
                for i in files:
                    if valid_file_name(files[i].filename):
                        save_result = save_file(result['username'], result['path'],  result['name'], files[i])
                        if save_result is not True:
                            return save_result
                    else:
                        return gen_error_res('invalid file name', 400)
                return ('', 200)
            return gen_error_res("path must be a dir",400)
        return result

    def Rename(self,path):
        from diskcloud.models.file import rename
        from diskcloud.models.valid import valid_file_name,valid_dir_name
        from diskcloud.models.response import gen_error_res

        result = valid_url_path(path)
        if isinstance(result,dict):
            af_name = request.json.get('af_name')
            if result['is_file']:
                if not valid_file_name(af_name):
                    return gen_error_res('invalid file name', 400)
            else:
                if not valid_dir_name(af_name):
                    return gen_error_res('invalid dir name', 400)
            return rename(result['username'], result['path'], result['name'], af_name)
        return result

    def Share(self,path):
        from diskcloud.models.share import generate_id
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(path)
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

    def Unshare(self,path):
        from diskcloud.models.share import unshare

        result = valid_url_path(path)
        if isinstance(result,dict):
            return unshare(result['username'], result['path'],  result['name'])
        return result

    def Star(self, path):
        from diskcloud.models.file import star

        result = valid_url_path(path)
        if isinstance(result,dict):
            return star(result['username'], result['path'],  result['name'])
        return result

    def Unstar(self, path):
        from diskcloud.models.file import unstar

        result = valid_url_path(path)
        if isinstance(result,dict):
            return unstar(result['username'], result['path'],  result['name'])
        return result

    def Trashcan(self, path):
        from diskcloud.models.file import trash_can

        result = valid_url_path(path)
        if isinstance(result,dict):
            return trash_can(result['username'], result['path'],  result['name'], result['is_file'])
        return result

    def Untrashcan(self, path):
        from diskcloud.models.file import untrash_can

        result = valid_url_path(path)
        if isinstance(result,dict):
            return untrash_can(result['username'], result['path'],  result['name'], result['is_file'])
        return result
