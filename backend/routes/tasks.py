from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, Project

tasks_bp = Blueprint("tasks", __name__)

def _uid(): return int(get_jwt_identity())

def _project_owned(project_id, user_id):
    return Project.query.filter_by(id=project_id, user_id=user_id).first()

@tasks_bp.get("/")
@jwt_required()
def list_tasks():
    user_id = _uid()
    project_id = request.args.get("project_id", type=int)
    q = Task.query.filter_by(user_id=user_id)
    if project_id:
        q = q.filter_by(project_id=project_id)
    rows = q.order_by(
        db.case((Task.status=="todo", 0), (Task.status=="doing", 1), else_=2),
        Task.due_date.asc().nulls_last(),
        Task.id.desc()
    ).all()
    return jsonify([
        {
            "id": t.id,
            "project_id": t.project_id,
            "title": t.title,
            "status": t.status,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "notes": t.notes
        } for t in rows
    ]), 200

@tasks_bp.post("/")
@jwt_required()
def create_task():
    user_id = _uid()
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    project_id = data.get("project_id")
    if not title or not project_id:
        return jsonify(error={"message": "title and project_id are required"}), 400

    proj = _project_owned(project_id, user_id)
    if not proj:
        return jsonify(error={"message": "project not found"}), 404

    due = data.get("due_date")
    due_date = None
    if due:
        try:
            due_date = datetime.fromisoformat(due).date()
        except ValueError:
            return jsonify(error={"message": "due_date must be ISO date"}), 400

    t = Task(
        user_id=user_id,
        project_id=project_id,
        title=title,
        status=(data.get("status") or "todo").strip() or "todo",
        due_date=due_date,
        notes=(data.get("notes") or "").strip() or None
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({"id": t.id}), 201

@tasks_bp.patch("/<int:task_id>")
@jwt_required()
def update_task(task_id):
    user_id = _uid()
    t = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not t:
        return jsonify(error={"message": "task not found"}), 404

    data = request.get_json() or {}
    for field in ["title", "status", "notes"]:
        if field in data:
            setattr(t, field, (data[field] or "").strip() or None)

    if "due_date" in data:
        val = data["due_date"]
        if val:
            try:
                t.due_date = datetime.fromisoformat(val).date()
            except ValueError:
                return jsonify(error={"message": "due_date must be ISO date"}), 400
        else:
            t.due_date = None

    db.session.commit()
    return jsonify({"ok": True}), 200

@tasks_bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    user_id = _uid()
    t = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not t:
        return jsonify(error={"message": "task not found"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"ok": True}), 200
