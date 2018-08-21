from flask import Blueprint
from .views.api import Json,File

api_bp = Blueprint('Api',__name__,static_folder='static',template_folder='templates')

api_bp.add_url_rule('/json/<path:path>','Json',Json)
api_bp.add_url_rule('/file/<path:url_path>','File',File)
