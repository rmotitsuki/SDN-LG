from flask import Blueprint, render_template,  redirect, url_for

home_blueprint = Blueprint(name='home', import_name=__name__, template_folder='templates')

@home_blueprint.route('/')
def index():
    #return render_template('index.html')
    return redirect(url_for('home.topology'))

@home_blueprint.route('/topology/')
def topology():
    return render_template('topology.html')


@home_blueprint.route('/dashboard/')
def dashboard():
    return render_template('base.html')
