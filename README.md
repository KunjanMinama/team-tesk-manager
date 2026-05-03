# 📋 TaskFlow — Team Task Manager (Full-Stack Assignment)

**TaskFlow** is a full-stack collaborative team task management web application built with **React** and **FastAPI**, designed to mimic core functionalities of tools like Trello or Asana. 

It features secure JWT authentication, a premium dark-themed UI, Kanban-style task boards, and strict role-based access control.

---

## 🔗 Live Links (Submission)

- **🌍 Live Application URL:** `[INSERT YOUR RAILWAY FRONTEND URL HERE]`
- **📹 Demo Video:** `[INSERT YOUR YOUTUBE/LOOM VIDEO LINK HERE]`
- **💻 GitHub Repository:** `[INSERT YOUR GITHUB REPO URL HERE]`

*(Note to Evaluator: The application is deployed on Railway using a live PostgreSQL database. Please feel free to sign up and test the application!)*

---

## ✨ Key Features & Requirements Met

| Requirement | Implementation Details |
|-------------|-------------------------|
| **Authentication** | Secure Signup & Login using **JWT (JSON Web Tokens)** and **bcrypt** password hashing. |
| **Project Management** | Users can create projects (becoming the Admin) and invite registered users to join via email. |
| **Task Management** | Full CRUD for tasks. Includes Title, Description, Due Date, and Priority levels (Low/Medium/High). |
| **Role-Based Access** | **Admins:** Can create tasks, add/remove members, update any task.<br>**Members:** Can view project details but can *only* update the status of tasks assigned to them. |
| **Dashboard Analytics** | Tracks total tasks, status breakdowns (To Do, In Progress, Done), overdue tasks, and task distribution per user. |
| **Kanban UI** | Premium, glassmorphic UI with drag-and-drop style columns for task tracking. |
| **Deployment** | Backend and Frontend deployed independently on **Railway**, connected to a live **PostgreSQL** database. |

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router v7
- **HTTP Client:** Axios (with custom interceptors for auto-attaching JWTs and handling 401s)
- **Styling:** Custom Vanilla CSS (Dark mode, CSS variables, flexbox/grid)

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (Live on Railway)
- **ORM:** SQLAlchemy
- **Authentication:** `python-jose` (JWT), `bcrypt` (Hashing)

---

## 📂 Project Architecture

```text
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── auth/         # Routes & Utils for JWT and Password Hashing
│   │   ├── projects/     # Project creation and Member management APIs
│   │   ├── tasks/        # Task creation and Status update APIs
│   │   ├── dashboard/    # Analytics and metrics generation
│   │   ├── db.py         # SQLAlchemy Engine & Session configuration
│   │   ├── models.py     # Database schema (User, Project, Task, ProjectMember)
│   │   └── schemas.py    # Pydantic models for validation and serialization
│   ├── requirements.txt
│   ├── Procfile          # Railway deployment config
│   └── nixpacks.toml     # Railway build config
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance config
│   │   ├── context/      # AuthContext for global state management
│   │   ├── components/   # Reusable UI (Navbar, Protected Routes)
│   │   ├── pages/        # Dashboard, ProjectView, Login, Signup
│   │   └── index.css     # Global Design System
│   ├── package.json
│   └── vite.config.js
```

---

## ⚙️ How to Run Locally

If you wish to run the project on your local machine, follow these steps:

### 1. Database Setup
Ensure you have PostgreSQL installed and running on your machine. Create a new database named `taskmanager`.

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your credentials
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/taskmanager" > .env
echo "SECRET_KEY=your_super_secret_key" >> .env
echo "CORS_ORIGINS=http://localhost:5173" >> .env

# Run the FastAPI server
uvicorn app.main:app --reload
```
The backend will run at `http://127.0.0.1:8000`. You can view the automatic API documentation at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Run the Vite development server
npm run dev
```
The frontend will run at `http://localhost:5173`.

---

## 🚀 Deployment (Railway)

The application is deployed across three services on Railway:
1. **PostgreSQL Database:** Hosts the live data.
2. **Backend Service:** Runs the FastAPI server. Uses `Procfile` and `requirements.txt`.
   - Environment Variables: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS` (Set to Frontend URL).
3. **Frontend Service:** Runs the built React application.
   - Environment Variables: `VITE_API_URL` (Set to Backend URL).

---

## 📝 License
Created as a Full-Stack Coding Assignment submission.
