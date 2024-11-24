import functools
import os
from flask import (
    Blueprint, current_app, render_template
)
from flask import send_file
from player.db import get_db

bp = Blueprint('user', __name__, url_prefix='/user')


@bp.route('/<int:user_id>/player', methods=['GET'])
def player(user_id):
    return render_template('player/index.html')

@bp.route('/<int:user_id>/file/<string:filename>', methods=['GET'])
def retrieve_file(user_id, filename):
    file_path = get_file_path(user_id, filename)
    return send_file(file_path)

@bp.route('/<int:user_id>/song', methods=['GET'])
def all_songs(user_id):
    db = get_db()
    songs = db.execute(
        'SELECT * FROM song WHERE created_by = ?',
        (user_id, )
    ).fetchall()
    # TODO: join
    return { 'songs': [dict(song) for song in songs] }

def get_file_path(user_id, filename):
    user_dir = get_user_dir(user_id)
    return os.path.join(user_dir, filename)

def get_user_dir(user_id):
    return os.path.join(current_app.config['USER_FOLDER'], str(user_id))
