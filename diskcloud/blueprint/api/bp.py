from flask import Blueprint
from .views.api import MainApi,GenerateLink

api_bp = Blueprint('Api',__name__,static_folder='static',template_folder='templates')

api_bp.add_url_rule('/u/<string:username>','MainApi',MainApi)
api_bp.add_url_rule('/u/<string:username>/generatelink','GenerateLink',GenerateLink)
