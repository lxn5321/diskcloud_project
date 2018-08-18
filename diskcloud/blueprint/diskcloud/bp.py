from flask import Blueprint

from .views.login import Login
from .views.main import Main
from .views.upload import Upload

diskcloud_bp = Blueprint('DiskCloud', __name__,
                         static_folder='static', template_folder='templates')

diskcloud_bp.add_url_rule('/', 'Login', Login, methods=['GET', 'POST'])
diskcloud_bp.add_url_rule('/u/<string:username>',
                          'Main', Main, methods=['GET', 'POST'])
diskcloud_bp.add_url_rule('/upload', 'Upload', Upload, methods=['GET', 'POST'])
