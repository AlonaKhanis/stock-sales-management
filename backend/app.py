import os
import sys
from flask import Flask, render_template
import webbrowser
import threading
from routes.material_routes import material_bp
from routes.print_routes import print_bp
from models import db


if getattr(sys, 'frozen', False):
    
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'static')
else:
   
    base_dir = os.path.abspath(os.path.dirname(__file__)) 
    template_folder = os.path.join(base_dir, '..', 'templates') 
    static_folder = os.path.join(base_dir, '..', 'static')

print(f"Template Folder: {template_folder}")
print(f"Static Folder: {static_folder}")


app = Flask(__name__, static_folder=static_folder, template_folder=template_folder)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)


with app.app_context():
    db.create_all()


app.register_blueprint(material_bp, url_prefix='/api')
app.register_blueprint(print_bp, url_prefix='/api')

@app.route('/add_material')
def add_material():
    return render_template('add_material.html')

@app.route('/sales')
def sales():
    return render_template('sales.html')

@app.route('/')
def print_view():
    return render_template('print.html')


def open_browser():
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    threading.Timer(1, open_browser).start()
    app.run(debug=True, use_reloader=False)
