from flask import Blueprint
from .views.api import Json,File,Generate

api_bp = Blueprint('Api',__name__,static_folder='static',template_folder='templates')

api_bp.add_url_rule('/json/<path:url_path>/','Json',Json,methods=['GET','POST'])
api_bp.add_url_rule('/file/<path:url_path>/','File',File,methods=['GET','POST'])
api_bp.add_url_rule('/generate/<path:url_path>/','Generate',Generate)
