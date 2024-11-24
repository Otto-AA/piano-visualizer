from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from player.db import get_db
from player.auth import login_required
from werkzeug.utils import secure_filename


bp = Blueprint('songs', __name__, url_prefix='/songs')


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
        file_name = secure_filename(name)
        song_type = request.form['type']
        design_id = get_default_design_id()
        creation_date = request.form['date']
        print(creation_date)

        # TODO: save files and add them to db
        db = get_db()
        error = None

        if len(name) == 0 or len(file_name) == 0:
            error = 'Please use a different file name'

        if error is None:
            try:
                db.execute(
                    'INSERT INTO song (name, file_name, type, design, created_by, song_creation) VALUES (?, ?, ?, ?, ?, ?)',
                    (name, file_name, song_type, design_id, g.user['id'], creation_date)
                )
                db.commit()
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
