from datetime import timedelta
import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# local imports
from models import db, bcrypt

load_dotenv()  # loads .env if present

def create_app():
    app = Flask(__name__)

    # Config
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///dev.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=25)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

    # Init
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)

    # Routes
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.get("/")
    def home():
        return jsonify({"message": "Freelance Flow API running"}), 200

    # Blueprints
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from routes.clients import clients_bp
    app.register_blueprint(clients_bp, url_prefix="/api/clients")

    from routes.projects import projects_bp
    app.register_blueprint(projects_bp, url_prefix="/api/projects")

    # Create tables
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(port=5555, debug=True)
