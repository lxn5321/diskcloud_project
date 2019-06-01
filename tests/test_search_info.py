if __name__ == "__main__" and __package__ is None:
    from sys import path
    from os.path import dirname as dir

    path.append(dir(path[0]))
    __package__ = "diskcloud_project"

def create_app():
    from diskcloud.models.file import get_search_info
    from flask import Flask

    app = Flask(__name__)
    app.config.from_pyfile('../diskcloud/config/debug_config.py',silent=True)

    with app.app_context():
        return get_search_info('erfan2333', 'asd*')

if __name__ == "__main__":
    print(create_app())
