import json
import os
import click
from flask import (
    Blueprint, abort, current_app, render_template
)
from flask.cli import with_appcontext

from player.db import get_db

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
DEFAULT_DESIGNS_DIR = os.path.join(SCRIPT_DIR, 'default_designs')


bp = Blueprint('designs', __name__, url_prefix='/designs')


@bp.route('/', methods=['POST'])
def create_design():
    abort(405)

@bp.route('/<int:design_id>', methods=['GET'])
def get_design(design_id):
    db = get_db()
    design = db.execute('SELECT * FROM designs WHERE id = ?', (design_id, )).fetchone()
    design = dict(design)
    design['tick_gradient'] = design['tick_gradient'].split(',')
    return design


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

@click.command('init-default-designs')
@click.argument('user-id')
@with_appcontext
def init_default_designs_command(user_id):
    """Insert default designs into database, created by user_id"""
    init_default_designs(user_id)
    click.echo('Initialized the default designs')

def init_app(app):
    app.cli.add_command(init_default_designs_command)
