from flask import Flask
from flask_cors import CORS
from Rutas.Rutas import blueprints
from config import configuracion


app = Flask(__name__)
CORS(app) # Habilitar CORS para todas las rutas

app.config.from_object(configuracion)


for bp in blueprints:
    app.register_blueprint(bp)


if __name__ == '__main__':
 
    app.run(debug=True)

    print(f"🚀 Iniciando servidor en")