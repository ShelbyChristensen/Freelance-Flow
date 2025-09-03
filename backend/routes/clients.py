# routes/clients.py
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Client

clients_bp = Blueprint("clients", __name__)

def _owner_filter(query):
    user_id = int(get_jwt_identity())
    return query.filter(Client.user_id == user_id)

@clients_bp.get("/")
@jwt_required()
def list_clients():
    q = request.args.get("q", "").strip().lower()
    stage = request.args.get("stage", "").strip().lower()
    qset = _owner_filter(Client.query)

    if q:
        qlike = f"%{q}%"
        qset = qset.filter(
            db.or_(
                Client.name.ilike(qlike),
                Client.email.ilike(qlike),
                Client.company.ilike(qlike),
            )
        )
    if stage:
        qset = qset.filter(Client.stage == stage)

    items = qset.order_by(
        db.case(
            (Client.next_action_date.is_(None), 1),
            else_=0
        ),
        Client.next_action_date.asc().nulls_last(),
        Client.name.asc()
    ).all()

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "company": c.company,
            "stage": c.stage,
            "next_action_date": c.next_action_date.isoformat() if c.next_action_date else None
        } for c in items
    ]), 200

@clients_bp.get("/<int:client_id>")
@jwt_required()
def get_client(client_id):
    user_id = int(get_jwt_identity())
    c = Client.query.filter_by(id=client_id, user_id=user_id).first()
    if not c:
        return jsonify(error={"message": "client not found"}), 404
    return jsonify({
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "company": c.company,
        "stage": c.stage,
        "next_action_date": c.next_action_date.isoformat() if c.next_action_date else None
    }), 200


@clients_bp.post("/")
@jwt_required()
def create_client():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify(error={"message": "name is required"}), 400

    user_id = int(get_jwt_identity())
    next_action_date = data.get("next_action_date")
    nad = None
    if next_action_date:
        try:
            nad = datetime.fromisoformat(next_action_date).date()
        except ValueError:
            return jsonify(error={"message": "next_action_date must be ISO date"}), 400

    c = Client(
        user_id=user_id,
        name=name,
        email=(data.get("email") or "").strip() or None,
        company=(data.get("company") or "").strip() or None,
        stage=(data.get("stage") or "lead").strip() or "lead",
        next_action_date=nad
    )
    db.session.add(c)
    db.session.commit()
    return jsonify({"id": c.id}), 201

@clients_bp.patch("/<int:client_id>")
@jwt_required()
def update_client(client_id):
    user_id = int(get_jwt_identity())
    c = Client.query.filter_by(id=client_id, user_id=user_id).first()
    if not c:
        return jsonify(error={"message": "client not found"}), 404

    data = request.get_json() or {}
    for field in ["name", "email", "company", "stage"]:
        if field in data:
            setattr(c, field, (data[field] or "").strip() or None)

    if "next_action_date" in data:
        val = data["next_action_date"]
        if val:
            try:
                c.next_action_date = datetime.fromisoformat(val).date()
            except ValueError:
                return jsonify(error={"message": "next_action_date must be ISO date"}), 400
        else:
            c.next_action_date = None

    db.session.commit()
    return jsonify({"ok": True}), 200

@clients_bp.delete("/<int:client_id>")
@jwt_required()
def delete_client(client_id):
    user_id = int(get_jwt_identity())
    c = Client.query.filter_by(id=client_id, user_id=user_id).first()
    if not c:
        return jsonify(error={"message": "client not found"}), 404
    db.session.delete(c)
    db.session.commit()
    return jsonify({"ok": True}), 200
