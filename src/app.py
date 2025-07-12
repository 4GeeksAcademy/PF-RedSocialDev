"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # 👈 IMPORTANTE

# Detect environment
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"

# Configura carpeta de archivos estáticos
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

# Inicializa Flask
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "secret-key"
app.url_map.strict_slashes = False

# Habilita CORS de forma global
CORS(app, supports_credentials=True)  # 👈 Esto permite preflight (OPTIONS) y cookies si fuera necesario

# Inicializa bcrypt y JWT
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Configura la base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Configura admin y comandos
setup_admin(app)
setup_commands(app)

# Registra rutas con prefijo /api
app.register_blueprint(api, url_prefix='/api')

# Maneja errores personalizados
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Muestra sitemap solo en desarrollo
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# Sirve archivos estáticos (SPA)
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

# Ejecuta servidor localmente
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)