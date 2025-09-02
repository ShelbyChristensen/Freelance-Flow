from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from models import db, bcrypt, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify(error={"message": "email and password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify(error={"message": "email already registered"}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access = create_access_token(identity=user.id)
    refresh = create_refresh_token(identity=user.id)

    return jsonify(
        user={"id": user.id, "email": user.email},
        access_token=access,
        refresh_token=refresh
    ), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify(error={"message": "invalid credentials"}), 401

    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))


    return jsonify(
        user={"id": user.id, "email": user.email},
        access_token=access,
        refresh_token=refresh
    ), 200

@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()  
    access = create_access_token(identity=user_id)  
    return jsonify(access_token=access), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify(error={"message": "user not found"}), 404
    return jsonify(user={"id": user.id, "email": user.email}), 200

