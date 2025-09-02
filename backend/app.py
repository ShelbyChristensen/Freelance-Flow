from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from models import db, bcrypt

app = Flask(__name__)

# Config
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dev.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"  # 🔑 later use env var

# Init extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.get("/")
def home():
    return jsonify({"message": "Freelance Flow API running"}), 200

# DB create_all
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(port=5555, debug=True)
