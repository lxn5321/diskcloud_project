from flask import Blueprint

from .views.login import Login
from .views.main import Main
from .views.share import Share

diskcloud_bp = Blueprint('DiskCloud', __name__,
                         static_folder='static', template_folder='templates')

diskcloud_bp.add_url_rule('/', 'Login', Login, methods=['GET', 'POST'])
diskcloud_bp.add_url_rule('/u/<string:username>/','Main', Main)
diskcloud_bp.add_url_rule('/s/<string:sid>/','Share', Share, methods=['GET', 'POST'])
