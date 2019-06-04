from flask import Blueprint
from .file_api import FileApi
from .user_api import UserApi

api_bp = Blueprint('Api',__name__,static_folder='static')

api_bp.add_url_rule('/file/<path:path>/', endpoint='FileApi', view_func=FileApi.as_view('file_api'), methods=['GET','POST','PATCH','DELETE'])
api_bp.add_url_rule('/user/', endpoint='UserApi', view_func=UserApi.as_view('user_api'), methods=['POST'])
