import json
import os
import click
from flask import (
    Blueprint, abort, current_app, flash, g, redirect, render_template, request, send_file, url_for
)
from flask.cli import with_appcontext
from werkzeug.utils import secure_filename
from player.auth import login_required
from player.db import get_db

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
DEFAULT_DESIGNS_DIR = os.path.join(SCRIPT_DIR, 'default_designs')


bp = Blueprint('designs', __name__, url_prefix='/designs')


@bp.route('/', methods=['GET', 'POST'])
@login_required
def create_design():
    db = get_db()
    if request.method == 'POST':
        data, error = get_upload_request_data(request)
        
        if error is None:
            cursor = db.cursor()
            try:
                cursor.execute(
                    'INSERT INTO designs (name, created_by, background_color, tick_gradient,'
                    ' tick_width, piano_border_white, piano_border_black, piano_border_color,'
                    ' key_pressed_color, font_color) '
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    (data['name'], g.user['id'], data['background_color'], ','.join(data['tick_gradient']),
                     data['tick_width'], data['piano_border_white'], data['piano_border_black'], data['piano_border_color'],
                     data['key_pressed_color'], data['font_color'])
                )
                design_id = cursor.lastrowid
                cursor.close()
                db.commit()
                if 'background_image' in data:
                    upload_design_image(data, design_id)
                if 'updateSong' in request.args:
                    song_id = request.args.get('updateSong', type=int)
                    update_song_design_id(song_id, design_id)
            except db.IntegrityError:
                error = f'A design with a similar name already exists.'
            else:
                return redirect(url_for('index'))
        flash(error)
    # oldest design seems like a good template
    # however this removes previous input if an error occured
    default_design = db.execute(
        'SELECT * FROM designs '
        'ORDER BY created_at '
        'LIMIT 1').fetchone()
    default_design = prepare_design_dto(default_design)

    return render_template('designs/upload.html', design=default_design)

@bp.route('/<int:design_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_design(design_id):
    db = get_db()
    # oldest design seems like a good template
    design = get_design(design_id)
    assert_design_owner(design, g.user['id'])

    return render_template('designs/upload.html', design=design)

@bp.route('/<int:design_id>', methods=['GET'])
def get_design(design_id):
    db = get_db()
    design = db.execute(
        'SELECT * '
        'FROM designs LEFT JOIN images ON designs.id = images.design_id '
        'WHERE id = ?', (design_id, )).fetchone()
    return prepare_design_dto(design)

def prepare_design_dto(design):
    design = dict(design)
    design['tick_gradient'] = design['tick_gradient'].split(',')
    return design

def assert_design_owner(design, user_id):
    if design['created_by'] != user_id:
        abort(403, 'This design is not created by you')

def update_song_design_id(song_id, design_id):
    """set design id of song"""
    db = get_db()
    db.execute(
        'UPDATE songs '
        'SET design_id = ? '
        'WHERE songs.id = ?',
        (design_id, song_id)
    )
    db.commit()

def upload_design_image(data, design_id):
    # TODO: can overwrite images from different designs with the same name
    # kinda risky. consider hash comparing instead
    db = get_db()
    file = data['background_image']
    creator = data['image_creator']
    link = data['image_link']
    filename = secure_filename(file.filename)
    file_path = get_image_file_path(filename)
    file.save(file_path)
    try:
        db.execute(
            'INSERT INTO images (design_id, image_file_name, image_creator, image_link) '
            'VALUES (?, ?, ?, ?)',
            (design_id, filename, creator, link)
        )
        db.commit()
    except db.IntegrityError:
        pass

def get_image_file_path(image_name):
    return os.path.join(get_images_folder(), image_name)

def get_images_folder():
    return os.path.abspath(current_app.config['IMAGE_FOLDER'])

def get_upload_request_data(req):
    error = None
    data = {
        'name': req.form['name'],
        'background_color': req.form['background_color'],
        'tick_width': req.form['tick_width'],
        'piano_border_white': req.form.get('piano_border_white') != None,
        'piano_border_black': req.form.get('piano_border_black') != None,
        'piano_border_color': req.form['piano_border_color'],
        'key_pressed_color': req.form['key_pressed_color'],
        'font_color': req.form['font_color'],
        'tick_gradient': [],
    }
    for i in range(3):
        data['tick_gradient'].append(req.form[f'tick_gradient_{i}'])

    if 'background_image' in req.files:
        file = req.files['background_image']
        if hasattr(file, 'filename') and file.filename != '':
            if allowed_file(file.filename):
                data['background_image'] = file
                data['image_creator'] = req.form['image_creator']
                data['image_link'] = req.form['image_link']
                if len(data['image_creator']) == 0 or len(data['image_link']) == 0:
                    error = 'If background image is given, you must specify the creator'
            else:
                error = 'Invalid file extension. Only allowed: ' + ', '.join(ALLOWED_SONG_EXTENSIONS)
    if len(data['name']) == 0:
        error = 'Please enter a design name.'
    return data, error


ALLOWED_SONG_EXTENSIONS = ['jpg', 'jpeg', 'png']
def allowed_file(filename):
    return '.' in filename and get_file_extension(filename) in ALLOWED_SONG_EXTENSIONS

def get_file_extension(filename):
    return filename.rsplit('.', 1)[1].lower()


def init_default_designs(user_id):
    db = get_db()
    for file in os.scandir(DEFAULT_DESIGNS_DIR):
        with open(file.path) as design_file:
            d = json.load(design_file)
            name = file.name.split('.')[0]
            db.execute(
                'INSERT INTO designs '
                '(name, created_by, background_color, tick_gradient, tick_width,'
                ' piano_border_white, piano_border_black, piano_border_color,'
                ' key_pressed_color, font_color) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (name, user_id, d['background_color'], d['tick_gradient'], d['tick_width'],
                 d['piano_border_white'], d['piano_border_black'], d['piano_border_color'],
                 d['key_pressed_color'], d['font_color'])
            )
            click.echo(f'Inserted {file.name}')
    db.commit()

@click.command('init-designs')
@click.argument('user-id')
@with_appcontext
def init_default_designs_command(user_id):
    """Insert default designs into database, created by user_id"""
    init_default_designs(user_id)
    click.echo('Initialized the default designs')

def init_app(app):
    app.cli.add_command(init_default_designs_command)
