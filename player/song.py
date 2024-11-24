import datetime
import os
from flask import (
    Blueprint, abort, flash, g, make_response, redirect, render_template, request, url_for
)
from werkzeug.utils import secure_filename
from player.design import create_default_design, update_song_design_id
from player.user import get_file_path
from player.db import get_db
from player.auth import login_required

DEFAULT_DESIGN_NAME = 'Green'

bp = Blueprint('songs', __name__, url_prefix='/songs')

@bp.context_processor
def inject_today_date():
    return {'today_date': datetime.date.today()}

@bp.route('/', methods=['GET'])
@login_required
def index():
    user_id = g.user['id']
    db = get_db()
    songs = db.execute(
        'SELECT * FROM songs WHERE created_by = ?',
        (user_id, )
    ).fetchall()

    return render_template('songs/index.html', songs=songs)

@bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if request.method == 'POST':
        db = get_db()
        data, error = get_upload_request_data(request)
        design_id = create_default_design(DEFAULT_DESIGN_NAME)

        if 'audio' not in data['files'] or 'midi' not in data['files']:
            error = 'Audio and midi files are required.'

        if error is None:
            cursor = db.cursor()
            try:
                cursor.execute(
                    'INSERT INTO songs (name, file_name, type, design_id, created_by, song_creation) VALUES (?, ?, ?, ?, ?, ?)',
                    (data['name'], data['file_name'], data['type'], design_id, g.user['id'], data['creation_date'])
                )
                db.commit()
                song_id = cursor.lastrowid
                update_song_design_id(song_id, design_id)
                upload_song_files(data['files'], song_id, data['file_name'])
                return redirect(url_for('designs.edit', design_id=design_id))
            except db.IntegrityError:
                error = f'A song with a similar name already exists.'
        flash(error)

    # set headers for SharedArrayBuffer used by ffmpeg
    res = make_response(render_template('songs/upload.html'))
    res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    return res


@bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit(id):
    song = get_song_by_id(id)
    if song is None:
        abort(404, 'Song not found.')
    assert_song_owner(song, g.user['id'])

    if request.method == 'POST':
        db = get_db()
        data, error = get_upload_request_data(request)
        if data['file_name'] != song['file_name']:
            error = 'Renaming songs not yet implemented'

        if error is None:
            try:
                db.execute(
                    'UPDATE songs '
                    'SET name = ?, file_name = ?, type = ?, song_creation = ? '
                    'WHERE id = ?',
                    (data['name'], data['file_name'], data['type'], data['creation_date'],
                     song['id'])
                )
                db.commit()
                upload_song_files(data['files'], song['id'], data['file_name'])
            except db.IntegrityError:
                error = f'A song with a similar name already exists.'
            else:
                return redirect(url_for('index'), code=303)
        print(error)
        flash(error)
    return render_template('songs/upload.html', song=song)

def get_upload_request_data(req):
    error = None
    data = {
        'name': req.form['name'],
        'file_name': secure_filename(req.form['name']),
        'type': req.form['type'],
        'creation_date': req.form['date'],
        'files': {}
    }
    for file_type in ['audio', 'midi', 'pdf']:
        if (file_type + '_file') in req.files:
            file = req.files[file_type + '_file']
            # browser submits an empty filename if not specified
            if hasattr(file, 'filename') and file.filename != '':
                if allowed_file(file.filename):
                    data['files'][file_type] = file
                else:
                    error = 'Invalid file extension. Only allowed: ' + ', '.join(ALLOWED_SONG_EXTENSIONS)
    if len(data['name']) == 0 or len(data['file_name']) == 0:
        error = 'Please use a different file name.'
    return data, error

def upload_song_files(files, song_id, file_name):
    db = get_db()
    for file in files.values():
        file_extension = get_file_extension(file.filename)
        filename = f'{file_name}.{file_extension}'
        file_path = get_file_path(g.user['id'], filename)
        file.save(file_path)
        try:
            db.execute(
                'INSERT INTO song_files (song_id, type) VALUES (?, ?)',
                (song_id, file_extension)
            )
            db.commit()
        except db.IntegrityError:
            pass

@bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete(id):
    db = get_db()
    song = get_song_with_files(id)
    assert_song_owner(song, g.user['id'])

    file_name = song['file_name']
    for file_extension in song['files']:
        path = get_file_path(g.user['id'], f'{file_name}.{file_extension}')
        os.remove(path)
    db.execute('DELETE FROM songs WHERE id = ?', (id, ))
    db.commit()
    return redirect(url_for('index'), code=303)

def assert_song_owner(song, user_id):
    if song['created_by'] != user_id:
        abort(403, 'This song is not created by you')

def get_song_by_id(id):
    db = get_db()
    song = db.execute(
        'SELECT * FROM songs WHERE id = ?',
        (id, )
    ).fetchone()
    return song

def get_song_with_files(song_id):
    db = get_db()
    song = db.execute(
        'SELECT name, file_name, songs.type, design_id, created_by, created_at, updated_at, song_creation, GROUP_CONCAT(file.type) as files '
        'FROM songs INNER JOIN song_files file ON songs.id = file.song_id '
        'WHERE songs.id = ? '
        'GROUP BY name, file_name, songs.type, design_id',
        (song_id, )
    ).fetchone()
    song = dict(song)
    song['files'] = song['files'].split(',')
    return song

ALLOWED_SONG_EXTENSIONS = ['mp3', 'mid', 'pdf']
def allowed_file(filename):
    return '.' in filename and get_file_extension(filename) in ALLOWED_SONG_EXTENSIONS

def get_file_extension(filename):
    return filename.rsplit('.', 1)[1].lower()
