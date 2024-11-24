import os
from flask import (
    Blueprint, abort, current_app, send_file
)


bp = Blueprint('images', __name__, url_prefix='/images')


@bp.route('/<string:image_id>', methods=['GET'])
def retrieve_file(image_id):
    file_path = get_image_file_path(image_id)
    try:
        return send_file(file_path)
    except FileNotFoundError:
        abort(404, 'File not found')

def get_image_file_path(image_name):
    return os.path.join(get_images_folder(), image_name)

def get_images_folder():
    return os.path.abspath(current_app.config['IMAGE_FOLDER'])
