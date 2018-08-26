from flask import Blueprint
from .views.api import FileApi

api_bp = Blueprint('Api',__name__,static_folder='static',template_folder='templates')

api_bp.add_url_rule('/file/<path:path>/',endpoint='FileApi',view_func=FileApi.as_view('file_api'),methods=['GET','POST','PUT','PATCH','DELETE'])
