if __name__ == "__main__" and __package__ is None:
    from sys import path
    from os.path import dirname as dir

    path.append(dir(path[0]))
    __package__ = "diskcloud_project"

def create_app():
    from diskcloud.models.mysql import delete_execute, db_rollback
    from flask import Flask

    app = Flask(__name__)
    app.config.from_pyfile('../diskcloud/config/debug_config.py',silent=True)

    with app.app_context():
        result = delete_execute('delete from storage where username = %s', ('test_username',))
        db_rollback()
        return result

if __name__ == "__main__":
    print(create_app())
