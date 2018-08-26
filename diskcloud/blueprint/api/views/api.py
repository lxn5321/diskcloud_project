from flask import request,views
from diskcloud.models.valid import valid_url_path

class FileApi(views.MethodView):
    # route request method
    def get(self,path):
        if request.args.get('info') == '1':
            return self.Info(path)
        if request.args.get('share') == '1':
            return self.GenerateId(path)
        if request.args.get('folder_info') == '1':
            return self.FolderInfo(path)
        return self.Download(path)
    def post(self,path):
        return 'POST'+path
    def put(self,path):
        return 'PUT'+path
    def patch(self,path):
        if request.args.get('name') != None:
            return self.Rename(path)
        return self.Move(path)
    def delete(self,path):
        return self.Delete(path)
    # Main Processer
    def Info(self,url_path):
        from diskcloud.models.file import get_info
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(url_path,True)
        if isinstance(result,dict):
            if result['is_file']:
                pass
            else:
                json_obj = get_info(result['url_path'])
                return gen_json_res(json_obj)
        return result

    def FolderInfo(self,url_path):
        from diskcloud.models.file import walk_dir_folder
        from diskcloud.models.response import gen_json_res

        result = valid_url_path(url_path,True)
        if isinstance(result,dict):
            if result.get('is_username'):
                json_obj = walk_dir_folder(result['url_path'])
                return gen_json_res(json_obj)
            else:
                return gen_error_res('invalid url',400)
        return result

    def Download(self,url_path):
        from diskcloud.models.file import download

        result = valid_url_path(url_path)
        if isinstance(result,dict):
            return download(result['url_path'],result['is_file'])
        return result

    def GenerateId(self,url_path):
        from diskcloud.models.share import generate_id
        from diskcloud.models.response import gen_error_res,gen_json_res

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
            username = url_path.split('/',maxsplit=1)[0]
            result = generate_id(result['url_path'],id_life)
            if result['succeed']:
                return gen_json_res({'sid': result['sid']})
            return gen_error_res(result['reason'],500)
        return result

    def Rename(self,url_path):
        from diskcloud.models.file import rename

        result = valid_url_path(url_path)
        if isinstance(result,dict):
            return rename(result['url_path'],request.args.get('name'),result['is_file'])
        return result

    def Move(self,url_path):
        from diskcloud.models.file import moveto
        from diskcloud.models.response import gen_error_res

        af_path = request.json.get("af_path",None)
        if af_path is None:
            return gen_error_res("request body error,invalid data",400)
        bf_result = valid_url_path(url_path)
        if isinstance(bf_result,dict):
            af_result = valid_url_path(af_path,root_ok=True)
            if isinstance(af_result,dict):
                if af_result['is_file'] == False:
                    return moveto(url_path,af_path)
                return gen_error_res("af_path must be a dir",400)
            return af_result
        return bf_result

    def Delete(self,url_path):
        from diskcloud.models.file import delete

        result = valid_url_path(url_path)
        if isinstance(result,dict):
            return delete(result['url_path'],result['is_file'])
        return result
