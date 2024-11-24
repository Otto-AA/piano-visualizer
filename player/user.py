import os
from flask import (
    Blueprint, abort, current_app, make_response, render_template, send_file
)
from player.db import get_db

bp = Blueprint('users', __name__, url_prefix='/users')


@bp.route('/<int:user_id>/player', methods=['GET'])
def player(user_id):
    res = make_response(render_template('player/index.html'))
    res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    return res

@bp.route('/<int:user_id>/files/<string:filename>', methods=['GET'])
def retrieve_file(user_id, filename):
    file_path = get_file_path(user_id, filename)
    try:
        return send_file(file_path)
    except FileNotFoundError:
        abort(404, 'File not found')

@bp.route('/<int:user_id>/songs', methods=['GET'])
def all_songs(user_id):
    db = get_db()
    songs = db.execute(
        'SELECT name, file_name, songs.type, design_id, GROUP_CONCAT(file.type) as files '
        'FROM songs INNER JOIN song_files file ON songs.id = file.song_id '
        'WHERE created_by = ? '
        'GROUP BY name, file_name, songs.type, design_id',
        (user_id, )
    ).fetchall()
    result = []
    for song in songs:
        song = dict(song)
        song['files'] = song['files'].split(',')
        result.append(song)
    return { 'songs': result }

def get_file_path(user_id, filename):
    user_dir = get_user_dir(user_id)
    return os.path.join(user_dir, filename)

def get_user_dir(user_id):
    return os.path.join(current_app.config['USER_FOLDER'], str(user_id))
