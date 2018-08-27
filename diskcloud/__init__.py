def create_app():
    from flask import Flask

    app = Flask(__name__)

    # @app.before_first_request
    # def check_config():
    #     pass

    # default config
    app.config.from_mapping(
        SECRET_KEY = 'default',
        TESTING = True,
    )
    #import config from file
    app.config.from_pyfile('config/config.py',silent=True)

    # add blueprint
    from .blueprint.api.bp import api_bp
    from .blueprint.diskcloud.bp import diskcloud_bp

    app.register_blueprint(diskcloud_bp, url_prefix='/diskcloud/')
    app.register_blueprint(api_bp, url_prefix='/api/v1/')

    # add url route
    # from .views.settings import Settings
    from .views.about import About
    # app.add_url_rule('/settings','settings',Settings)

    app.add_url_rule('/about','about',About)

    # add custom command
    import diskcloud.cli

    diskcloud.cli.init_app(app)
    # @click.argument('host','username','password')
    # init_db(host,username,password):

    # register teardown appcontextfunction
    @app.teardown_appcontext
    def teardown_db(self):
        from flask import g

        db = g.pop('db',None)
        if db is not None:
            db.close()

    return app
