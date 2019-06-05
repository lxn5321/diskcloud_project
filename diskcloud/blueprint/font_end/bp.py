from flask import Blueprint

from .views.login import Login
from .views.main import Main
from .views.share import Share

font_end = Blueprint('FontEnd', __name__,
                         static_folder='static', template_folder='templates')

font_end.add_url_rule('/', 'Login', Login, methods=['GET', 'POST'])
font_end.add_url_rule('/u/<string:username>/','Main', Main)
font_end.add_url_rule('/s/<string:sid>/','Share', Share, methods=['GET', 'POST'])
