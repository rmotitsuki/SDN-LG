from flask import Blueprint, current_app, render_template

home_blueprint = Blueprint(name='home', import_name=__name__, template_folder='templates')

@home_blueprint.route('/')
def index():
    return render_template('index.html')


@home_blueprint.route('/topology/')
def topology():
    return render_template('topology.html')
