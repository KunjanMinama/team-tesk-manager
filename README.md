# 📋 TaskFlow — Team Task Manager

A full-stack collaborative task management web application built with **React (Vite)** and **FastAPI**, similar to Trello/Asana.

> Manage projects, assign tasks, track progress — with role-based access control.

---

## 🚀 Features

- **JWT Authentication** — Secure signup & login with bcrypt password hashing
- **Project Management** — Create projects, add/remove team members
- **Task Management** — Create tasks with title, description, due date, priority; assign to team members
- **Kanban Board** — Visual task board with To Do / In Progress / Done columns
- **Dashboard Analytics** — Total tasks, status breakdown, overdue count, tasks per user
- **Role-Based Access**:
  - **Admin** → Create tasks, manage members
  - **Member** → View and update only assigned tasks

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Axios, React Router v7 |
| Backend | FastAPI, Python |
| Database | PostgreSQL + SQLAlchemy ORM |
| Auth | JWT (python-jose) + bcrypt |
| Deployment | Railway |

---

## 📂 Project Structure

```
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── auth/         # Signup, Login, JWT utils
│   │   ├── projects/     # Project CRUD + member management
│   │   ├── tasks/        # Task CRUD + status updates
│   │   ├── dashboard/    # Analytics API
│   │   ├── db.py         # SQLAlchemy engine + session
│   │   ├── models.py     # User, Project, Task, ProjectMember
│   │   ├── schemas.py    # Pydantic request/response schemas
│   │   └── main.py       # FastAPI app + CORS + routers
│   ├── .env
│   ├── requirements.txt
│   ├── Procfile
│   └── railway.toml
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance with interceptors
│   │   ├── context/      # AuthContext (token + user + role)
│   │   ├── components/   # Navbar, ProtectedRoute
│   │   ├── pages/        # Login, Signup, Dashboard, ProjectView
│   │   └── index.css     # Design system (dark theme)
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env with your database URL and secret key:
# DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
# SECRET_KEY=your-secret-key-here

# Run server
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`
API docs at `http://127.0.0.1:8000/docs`

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🌐 Deployment on Railway

### Backend Service
1. Create a new service on Railway → connect GitHub repo
2. Set root directory to `backend`
3. Add environment variables:
   - `DATABASE_URL` — Railway PostgreSQL connection string
   - `SECRET_KEY` — random secret for JWT signing
   - `CORS_ORIGINS` — your frontend Railway URL (e.g., `https://taskflow-frontend.up.railway.app`)

### Frontend Service
1. Create another service on Railway → same repo
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Start command: `npx serve dist`
5. Add environment variable:
   - `VITE_API_URL` — your backend Railway URL (e.g., `https://taskflow-backend.up.railway.app`)

### Database
1. Add a PostgreSQL plugin in Railway
2. Copy the connection string to your backend's `DATABASE_URL`

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, returns JWT |
| POST | `/projects/` | ✅ | Create project |
| GET | `/projects/my-projects` | ✅ | List user's projects |
| GET | `/projects/{id}` | ✅ | Get project details |
| GET | `/projects/members/{id}` | ✅ | List project members |
| POST | `/projects/{id}/add-member?email=` | ✅ Admin | Add member by email |
| DELETE | `/projects/{id}/remove-member/{uid}` | ✅ Admin | Remove member |
| POST | `/tasks/{project_id}/create` | ✅ Admin | Create task |
| GET | `/tasks/project/{project_id}` | ✅ | List project tasks |
| PUT | `/tasks/{task_id}/status?status=` | ✅ | Update task status |
| GET | `/tasks/my-tasks` | ✅ | Get user's assigned tasks |
| GET | `/tasks/overdue/{project_id}` | ✅ | Get overdue tasks |
| GET | `/dashboard/{project_id}` | ✅ | Get project analytics |

---

## 👤 Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Create tasks, add/remove members, update any task status |
| **Member** | View project, update status of assigned tasks only |

The project creator automatically becomes Admin and is added as a member.

---

## 📹 Demo Video

A 2-5 minute walkthrough covering:
1. Signup → Login flow
2. Creating a project
3. Adding members
4. Creating and assigning tasks
5. Updating task status (as admin and as member)
6. Dashboard analytics view

---

## 📝 License

This project was built as part of a full-stack development assignment.
