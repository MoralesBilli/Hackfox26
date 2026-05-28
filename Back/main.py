from flask import Flask
from Rutas.Rutas import blueprints
from config import configuracion


app = Flask(__name__)

app.config.from_object(configuracion)


for bp in blueprints:
    app.register_blueprint(bp)


if __name__ == '__main__':
 
    app.run(debug=True)

    print(f"🚀 Iniciando servidor en")