from flask import Flask

from .home.controllers import home_blueprint

app = Flask(__name__,
            template_folder='templates')

app.register_blueprint(home_blueprint)
