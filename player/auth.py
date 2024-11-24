import functools
import os

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from flask.cli import with_appcontext
import click
from werkzeug.security import check_password_hash, generate_password_hash
from player.db import get_db
from player.user import get_user_dir


bp = Blueprint('auth', __name__, url_prefix='/auth')


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))
        
        return view(**kwargs)
    
    return wrapped_view


# only logged in users allowed to register
# to prevent everyone from registering
# (invite only)
@bp.route('/register', methods=['GET', 'POST'])
@login_required
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        
        if error is None:
            try:
                create_user(username, password)
            except db.IntegrityError:
                error = f'User {username} is already registered.'
            else:
                return redirect(url_for('auth.login'))
        
        flash(error)
    return render_template('auth/register.html')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None
        user = db.execute(
            'SELECT * FROM users WHERE username = ?',
            (username, )
        ).fetchone()

        if user is None:
            error = 'Incorrect username.'
        elif not check_password_hash(user['password'], password):
            error = 'Incorrect password.'
        
        if error is None:
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('index'))
        
        flash(error)

    return render_template('auth/login.html')

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM users WHERE id = ?',
            (user_id, )
        ).fetchone()

def create_user(username, password):
    db = get_db()
    db.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        (username, generate_password_hash(password))
    )
    db.commit()
    user = db.execute(
        'SELECT * FROM users WHERE username = ?',
        (username, )
    ).fetchone()
    os.makedirs(get_user_dir(user['id']))
    return user


@click.command('create-user')
@click.argument('username')
@click.argument('password')
@with_appcontext
def create_user_command(username, password):
    """create a new user"""
    user = create_user(username, password)
    print(f"Created user {user['username']} with id {user['id']}")

def init_app(app):
    app.cli.add_command(create_user_command)
