from flask import Blueprint
from .views.api import MainApi,GenerateLink

api_bp = Blueprint('Api',__name__,static_folder='static',template_folder='templates')

api_bp.add_url_rule('/p/<path:dirpath>','MainApi',MainApi)
api_bp.add_url_rule('/generatelink','GenerateLink',GenerateLink)
