from flask import Blueprint
from .api.file_api import FileApi
from .api.user_api import UserApi

back_end = Blueprint('BackEnd',__name__,static_folder='static')

back_end.add_url_rule('/file/<path:path>/', endpoint='FileApi', view_func=FileApi.as_view('file_api'), methods=['GET','POST','PATCH','DELETE'])
back_end.add_url_rule('/user/', endpoint='UserApi', view_func=UserApi.as_view('user_api'), methods=['POST'])
