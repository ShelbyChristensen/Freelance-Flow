# models.py
from datetime import date
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Client(db.Model):
    __tablename__ = "clients"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150))
    company = db.Column(db.String(150))
    stage = db.Column(db.String(30), default="lead")   # lead | prospect | active | archived
    next_action_date = db.Column(db.Date)              # reminders / follow-ups

    user = db.relationship("User", backref=db.backref("clients", lazy=True))

class Project(db.Model):
    __tablename__ = "projects"
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False, index=True)

    name = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(30), default="active")  # active | completed | archived
    due_date = db.Column(db.Date)

    user = db.relationship("User", backref=db.backref("projects", lazy=True))
    client = db.relationship("Client", backref=db.backref("projects", lazy=True))
