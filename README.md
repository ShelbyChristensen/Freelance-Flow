# FreelanceFlow — Freelancer CRM (Flask + React with Auth)

FreelanceFlow is a lightweight CRM for freelancers to track **clients**, **projects**, and **tasks** with secure authentication.

## Features
- JWT auth (register/login/logout) and protected routes
- Clients CRUD (search, stage filter, next action date)
- Client detail → Projects CRUD (status, due date)
- Project detail → Tasks CRUD (status toggle, due date, notes)
- Dashboard with client stage counts

## Tech Stack
- **Backend:** Flask, Flask-JWT-Extended, SQLAlchemy, Marshmallow (optional), SQLite (dev)
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios
- **Dev:** Postman/HTTPie/Curl, GitHub

## Getting Started

### 1) Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate         # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env              # or create .env (see below)
python app.py                     # http://localhost:5555

### 2) backend/.env
JWT_SECRET_KEY=change-this
DATABASE_URL=sqlite:///dev.db

### frontend
cd frontend
npm install
npm run dev                       # http://localhost:5173




### Auth Endpoints

POST /api/auth/register → { email, password }

POST /api/auth/login → { email, password } ⇒ { access_token, refresh_token, user }

GET /api/auth/me (Bearer token)




### API Overview
Clients

GET /api/clients/?q=&stage= — list with search/filter

GET /api/clients/:id — get one

POST /api/clients/ — { name, email?, company?, stage?, next_action_date? }

PATCH /api/clients/:id — partial update

DELETE /api/clients/:id

Projects

GET /api/projects/?client_id=

POST /api/projects/ — { client_id, name, status?, due_date? }

PATCH /api/projects/:id

DELETE /api/projects/:id

Tasks

GET /api/tasks/?project_id=

POST /api/tasks/ — { project_id, title, status?, due_date?, notes? }

PATCH /api/tasks/:id

DELETE /api/tasks/:id

All resources are scoped to the logged-in user (ownership enforced in the backend).



### App Navigation

/register, /login

/dashboard — client stage counts

/clients — list/search/filter, create, stage update

/clients/:id — projects (list/create/status/update/delete)

/projects/:id — tasks (list/create/status toggle/delete)


### Known Limitations / Future Work

Minimal validation and toasts

Future: Interactions (activity log), Invoices, file uploads, deployment (Render/Netlify)

