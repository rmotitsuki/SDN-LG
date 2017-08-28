
import os

from flask import Flask

from flask_jsondash.charts_builder import charts

from sdnlg.web.sdnlg_website import app


"""
Use of Flask, a lightweight Python web framework.

Install:
    pip install Flask
Run:
    python run_web.py
"""

app.config['SECRET_KEY'] = 'NOTSECURELOL'
app.config.update(
    JSONDASH_FILTERUSERS=False,
    JSONDASH_GLOBALDASH=True,
    JSONDASH_GLOBAL_USER='global',
)
app.debug = True
app.register_blueprint(charts)




def _can_edit_global():
    return True


def _can_delete():
    return True


def _can_clone():
    return True


def _get_username():
    return 'anonymous'


# Config examples.
app.config['JSONDASH'] = dict(
    metadata=dict(
        created_by=_get_username,
        username=_get_username,
    ),
    static=dict(
        js_path='js/vendor/jsondash/vendor/',
        css_path='css/vendor/jsondash/vendor/',
    ),
    auth=dict(
        edit_global=_can_edit_global,
        clone=_can_clone,
        delete=_can_delete,
    )
)


if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
    app.run(debug=True, host=HOST, port=PORT)

