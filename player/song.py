from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.utils import secure_filename
from player.user import get_file_path
from player.db import get_db
from player.auth import login_required


bp = Blueprint('song', __name__, url_prefix='/song')


@bp.route('/', methods=['GET'])
@login_required
def index():
    user_id = g.user['id']
    db = get_db()
    songs = db.execute(
        'SELECT * FROM song WHERE created_by = ?',
        (user_id, )
    ).fetchall()

    return render_template('songs/index.html', songs=songs)

def get_default_design_id():
    return 0

@bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if request.method == 'POST':

        name = request.form['name']
        song_type = request.form['type']
        design_id = get_default_design_id()
        creation_date = request.form['date']

        files = {}
        file_name = secure_filename(name)
        for file_type in ['audio', 'midi', 'pdf']:
            if (file_type + '_file') in request.files:
                file = request.files[file_type + '_file']
                # browser submits an empty filename if not specified
                if hasattr(file, 'filename') and file.filename != '':
                    if allowed_file(file.filename):
                        files[file_type] = file
                    else:
                        error = 'Invalid file extension. Only allowed: ' + ', '.join(ALLOWED_SONG_EXTENSIONS)
        db = get_db()
        error = None

        if len(name) == 0 or len(file_name) == 0:
            error = 'Please use a different file name.'
        if 'audio' not in files or 'midi' not in files:
            error = 'Audio and midi files are required.'

        if error is None:
            cursor = db.cursor()
            try:
                cursor.execute(
                    'INSERT INTO song (name, file_name, type, design, created_by, song_creation) VALUES (?, ?, ?, ?, ?, ?)',
                    (name, file_name, song_type, design_id, g.user['id'], creation_date)
                )
                song_id = cursor.lastrowid
                for file in files.values():
                    file_extension = get_file_extension(file.filename)
                    filename = f'{file_name}.{file_extension}'
                    file_path = get_file_path(g.user['id'], filename)
                    file.save(file_path)
                    try:
                        cursor.execute(
                            'INSERT INTO song_file (song_id, type) VALUES (?, ?)',
                            (song_id, file_extension)
                        )
                        db.commit()
                    except db.IntegrityError:
                        pass
            except db.IntegrityError:
                error = f'A song with a similar name already exists.'
            else:
                return redirect(url_for('index'))
        # TODO: show error in frontend
        flash(error)
    return render_template('songs/upload.html')


@bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit(id):
    song = get_song_by_id(id)
    if request.method == 'POST':
        db = get_db()
        error = f'Not implemented ({id})'

        flash(error)
    return render_template('songs/edit.html', song=song)


@bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete(id):
    if request.method == 'POST':
        db = get_db()
        error = f'Not implemented ({id})'

        flash(error)
    return render_template('songs/edit.html')

def get_song_by_id(id):
    db = get_db()
    song = db.execute(
        'SELECT * FROM song WHERE id = ?',
        (id, )
    ).fetchone()
    return song

ALLOWED_SONG_EXTENSIONS = ['mp3', 'mid', 'pdf']
def allowed_file(filename):
    return '.' in filename and get_file_extension(filename) in ALLOWED_SONG_EXTENSIONS

def get_file_extension(filename):
    return filename.rsplit('.', 1)[1].lower()
