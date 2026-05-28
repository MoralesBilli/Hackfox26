from flask import Flask
from Rutas.Rutas import blueprints
from config import configuracion
import os

app = Flask(__name__)

app.config.from_object(configuracion)


for bp in blueprints:
    app.register_blueprint(bp)


if __name__ == '__main__':
    # Configuración para producción
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('DEBUG', 'False').lower() == 'true'