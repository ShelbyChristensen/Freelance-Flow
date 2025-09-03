from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project, Client

projects_bp = Blueprint("projects", __name__)

def _uid():
    return int(get_jwt_identity())

def _client_owned(client_id, user_id):
    return Client.query.filter_by(id=client_id, user_id=user_id).first()

@projects_bp.get("/")
@jwt_required()
def list_projects():
    user_id = _uid()
    client_id = request.args.get("client_id", type=int)
    q = Project.query.filter_by(user_id=user_id)
    if client_id:
        q = q.filter_by(client_id=client_id)
    rows = q.order_by(Project.due_date.asc().nulls_last(), Project.name.asc()).all()
    return jsonify([
        {
            "id": p.id,
            "client_id": p.client_id,
            "name": p.name,
            "status": p.status,
            "due_date": p.due_date.isoformat() if p.due_date else None
        } for p in rows
    ]), 200

@projects_bp.post("/")
@jwt_required()
def create_project():
    user_id = _uid()
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    client_id = data.get("client_id")
    if not name or not client_id:
        return jsonify(error={"message": "name and client_id are required"}), 400

    client = _client_owned(client_id, user_id)
    if not client:
        return jsonify(error={"message": "client not found"}), 404

    due = data.get("due_date")
    due_date = None
    if due:
        try:
            due_date = datetime.fromisoformat(due).date()
        except ValueError:
            return jsonify(error={"message": "due_date must be ISO date"}), 400

    p = Project(
        user_id=user_id,
        client_id=client_id,
        name=name,
        status=(data.get("status") or "active").strip() or "active",
        due_date=due_date
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({"id": p.id}), 201

@projects_bp.patch("/<int:project_id>")
@jwt_required()
def update_project(project_id):
    user_id = _uid()
    p = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not p:
        return jsonify(error={"message": "project not found"}), 404

    data = request.get_json() or {}
    for field in ["name", "status"]:
        if field in data:
            setattr(p, field, (data[field] or "").strip() or None)

    if "due_date" in data:
        val = data["due_date"]
        if val:
            try:
                p.due_date = datetime.fromisoformat(val).date()
            except ValueError:
                return jsonify(error={"message": "due_date must be ISO date"}), 400
        else:
            p.due_date = None

    db.session.commit()
    return jsonify({"ok": True}), 200

@projects_bp.delete("/<int:project_id>")
@jwt_required()
def delete_project(project_id):
    user_id = _uid()
    p = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not p:
        return jsonify(error={"message": "project not found"}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({"ok": True}), 200
