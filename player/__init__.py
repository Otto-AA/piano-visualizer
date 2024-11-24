import os
from flask import Flask, send_from_directory
from . import db, auth, song, user, design, image

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    instance_path_absolute = os.path.abspath(app.instance_path)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(instance_path_absolute, 'player.sqlite'),
        USER_FOLDER=os.path.join(instance_path_absolute, 'users'),
        IMAGE_FOLDER=os.path.join(instance_path_absolute, 'images'),
        MAX_CONTENT_LENGTH=16 * 1000 * 1000
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    for path in [app.instance_path, app.config['USER_FOLDER'], app.config['IMAGE_FOLDER']]:
        try:
            os.makedirs(path)
        except OSError:
            pass

    db.init_app(app)
    design.init_app(app)
    auth.init_app(app)
    app.register_blueprint(auth.bp)
    app.register_blueprint(song.bp)
    app.add_url_rule('/songs', endpoint='index')
    app.register_blueprint(user.bp)
    app.register_blueprint(design.bp)
    app.register_blueprint(image.bp)


    # TODO: add this to a base.html template instead
    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'),
                                'favicon.ico', mimetype='image/vnd.microsoft.icon')

    return app
