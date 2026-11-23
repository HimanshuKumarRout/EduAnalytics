# EduAnalytics — Student Performance Analysis System

[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_5-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Django](https://img.shields.io/badge/Backend-Django_5_REST_API-092e20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind_CSS-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Charts](https://img.shields.io/badge/Charts-Chart.js-ff6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

**EduAnalytics** is a modern, high-performance academic performance tracking and cohort analytics platform. Built with a decoupled architecture featuring a **React (Vite) Single Page Application** frontend and a **Django REST API** backend powered exclusively by **Supabase (Managed PostgreSQL)**.

---

## Key Highlights

- **User-Free & Frictionless:** Zero login gates, session tokens, or credential barriers — instant, seamless access to all dashboards, directories, analytics, and reporting tools.
- **Decoupled Architecture:** Clean separation between the React client and the Django REST API.
- **Cloud-Native Database:** Fully migrated to **Supabase PostgreSQL** with SSL pooling (zero file-based SQLite).
- **Interactive Visualizations:** 5 dynamic Chart.js dashboards (Subject performance, Grade distribution, Top student rankings, Historical exam score trends, and Pass/Fail donut).
- **Comprehensive Student Profiles:** Detailed academic drilldown, attendance tracking, exam histories, and performance trajectories.
- **Class Leaderboard:** Class-wise and cohort-wide rankings with trophy badges and performance indicators.
- **Bulk Data Importer:** Flexible CSV and Excel (`.xlsx`, `.xls`) ingestion for students, subjects, and exam scores.
- **Responsive Modern UI:** Clean sidebar navigation with drawer collapses and adaptive mobile layouts.

---

## Project Structure

```
STUDENT PERFORMANCE/
├── backend/                       ← Django REST API Backend
│   ├── manage.py                  ← CLI entry point
│   ├── requirements.txt           ← Python dependencies (Django, psycopg, dj-database-url)
│   ├── .env                       ← Live Supabase connection credentials
│   ├── .env.example               ← Environment configuration template
│   ├── supabase_schema.sql        ← Standalone Supabase SQL Editor schema script
│   ├── sample_data/               ← Sample CSV import templates
│   │   ├── students_sample.csv
│   │   ├── subjects_sample.csv
│   │   └── results_sample.csv
│   ├── media/                     ← Uploaded student profile photos (git-ignored)
│   ├── staticfiles/               ← Collected production static files
│   ├── student_performance/       ← Django project configuration
│   │   ├── settings.py            ← Configured strictly for Supabase PostgreSQL (SSL)
│   │   ├── cors_middleware.py     ← CORS headers middleware for React SPA
│   │   ├── urls.py                ← Root router delegating /api/
│   │   └── wsgi.py
│   └── students/                  ← Academic tracking app
│       ├── models.py              ← Student, Subject, ExamResult, Attendance models
│       ├── api_views.py           ← Clean, modular REST API endpoints
│       ├── api_urls.py            ← REST API URL definitions
│       └── tests.py               ← Comprehensive automated test suite (10 unit tests)
│
├── frontend/                      ← React (Vite) Frontend SPA
│   ├── package.json               ← Dependencies: React 18, React Router 6, Chart.js, Lucide
│   ├── vite.config.js             ← Vite build config & /api proxy to localhost:8000
│   ├── index.html                 ← SPA HTML entry point
│   └── src/
│       ├── main.jsx               ← DOM root mount
│       ├── App.jsx                ← Open client-side router
│       ├── services/
│       │   └── api.js             ← Centralized Axios-like fetch API client
│       ├── components/
│       │   ├── Layout.jsx         ← Shell containing responsive Sidebar and Navbar
│       │   ├── Sidebar.jsx        ← Navigation drawer with active path highlighting
│       │   ├── Navbar.jsx         ← Header bar with system status & sidebar toggle
│       │   ├── StatCard.jsx       ← Reusable KPI metric card
│       │   └── Modal.jsx          ← Accessible dialog modal component
│       ├── pages/
│       │   ├── Dashboard.jsx      ← Overview analytics dashboard with 5 charts
│       │   ├── Students.jsx       ← Student directory with search, filter, and CRUD
│       │   ├── StudentDetail.jsx  ← Student profile, subject chart, and exam records
│       │   ├── Subjects.jsx       ← Curriculum management & subject creation
│       │   ├── Results.jsx        ← Marks log with multi-field filtering & modals
│       │   ├── Analysis.jsx       ← Class & subject performance breakdown
│       │   ├── ClassRankings.jsx  ← Class leaderboard with podium styling
│       │   └── UploadData.jsx     ← Bulk CSV/Excel importer with format guides
│       └── styles/
│           └── main.css           ← Modern UI theme styling & animations
│
├── .gitignore                     ← Git configuration
└── README.md                      ← Project documentation
```

---

## Supabase Database Configuration

This application connects directly to a managed **Supabase PostgreSQL** database over SSL.

### 1. Retrieve your Supabase Connection URI
1. Open your project on [supabase.com](https://supabase.com).
2. Navigate to **Project Settings** (gear icon) → **Database**.
3. Under **Connection parameters** / **Connection string**, select the **URI** tab.
4. Copy the connection string. Supabase provides two formats:
   - **Transaction / Session Pooler (Recommended for port 6543):**
     ```
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - **Direct Connection (Port 5432):**
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
     ```
   > **Note on Special Characters:** If your Supabase database password contains special characters (like `@`, `#`, `%`, or `!`), ensure they are URL-encoded in the connection string (e.g., `#` becomes `%23`).

### 2. Configure `.env`
Open `backend/.env` and paste your connection string:
```env
DATABASE_URL=postgresql://postgres.yourref:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### 3. Initialize the Database Schema

You can initialize the database using either of the following two options:

#### Option A: Via Django Migrations (CLI)
```powershell
cd backend
..\.venv\Scripts\python.exe manage.py migrate
..\.venv\Scripts\python.exe manage.py seed_data
```

#### Option B: Via Supabase SQL Editor (Direct)
1. Open the **SQL Editor** tab in your Supabase Dashboard.
2. Open [`backend/supabase_schema.sql`](backend/supabase_schema.sql) from this project.
3. Paste the contents into the SQL Editor and click **Run**.
4. All tables (`students_student`, `students_subject`, `students_examresult`, `students_attendance`), constraints, indexes, and seed subjects will be created immediately.

---

## Quick Start (Local Development)

### Prerequisites
- **Python 3.10+** (tested up to Python 3.14)
- **Node.js 18+** and **npm**

---

### Step 1: Start the Backend (Django REST API)

Open your first terminal:

```powershell
# Navigate to the backend folder
cd backend

# Activate your virtual environment
..\.venv\Scripts\activate

# Apply migrations to your Supabase database
python manage.py migrate

# Seed sample data (80 students, 9 subjects, 1,900 results)
python manage.py seed_data

# Run the Django REST API server
python manage.py runserver 8000
```

The REST API is live at: **`http://127.0.0.1:8000/api/`**

---

### Step 2: Start the Frontend (React Vite SPA)

Open a second terminal:

```powershell
# Navigate to the frontend folder
cd frontend

# Install node packages (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

The React Single Page Application will open at: **`http://localhost:3000`**

*(API calls to `/api/` and image requests to `/media/` are automatically proxied by Vite to the backend on `http://127.0.0.1:8000`).*

---

## REST API Reference

The backend exposes a clean, unauthenticated REST API under the `/api/` prefix:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/` | KPI stats, grade distribution, subject averages, and recent results |
| `GET` | `/api/students/` | Filterable list of students (`class_name`, `gender`, `search`) |
| `POST` | `/api/students/` | Create a new student record (supports `multipart/form-data` photo upload) |
| `GET` | `/api/students/<id>/` | Detailed student profile with subject marks, rank, and attendance |
| `PUT` | `/api/students/<id>/` | Update an existing student's details or photo |
| `DELETE` | `/api/students/<id>/` | Delete a student and cascade-remove associated results |
| `GET` | `/api/subjects/` | List all curriculum subjects with teacher and max marks |
| `POST` | `/api/subjects/` | Create a new subject |
| `DELETE` | `/api/subjects/<id>/` | Delete a subject |
| `GET` | `/api/results/` | Filterable exam results (`exam_type`, `class_name`, `subject`) |
| `POST` | `/api/results/` | Add a new exam result record (auto-computes grade and percentage) |
| `DELETE` | `/api/results/<id>/` | Remove an exam result |
| `GET` | `/api/analytics/` | Cohort-wide metrics, pass rates, and class averages |
| `GET` | `/api/rankings/` | Class-wise and overall student rankings sorted by academic average |
| `POST` | `/api/upload/` | Ingest CSV or Excel files (`type`: `students`, `subjects`, or `results`) |
| `GET` | `/api/chart-data/` | Structured datasets for Chart.js dashboard widgets |

---

## Bulk Import Formats

Sample CSV templates are provided in [`backend/sample_data/`](backend/sample_data/).

### 1. Students (`students_sample.csv`)
```csv
student_id,first_name,last_name,email,gender,class_name,section,roll_number,parent_name,contact
STU001,Alice,Johnson,alice.johnson@school.edu,Female,10A,A,1,Mr. Johnson,9812345671
```

### 2. Subjects (`subjects_sample.csv`)
```csv
code,name,class_name,max_marks,teacher
MATH10,Mathematics,10A,100,Mr. Sharma
```

### 3. Exam Results (`results_sample.csv`)
```csv
student_id,subject_code,exam_type,exam_date,marks_obtained,max_marks
STU001,MATH10,Final,2024-03-15,92,100
```

---

## Automated Backend Testing

Run the automated test suite to verify models, calculations, and REST API endpoints:

```powershell
cd backend
python manage.py test
```

**Test Coverage:**
- Model creation, string representations, and grade auto-calculation (`A+`, `A`, `B`, `C`, `D`, `F`).
- Dashboard and analytics aggregation integrity.
- Student, subject, and exam results CRUD operations.
- Student ranking algorithms and class filters.
- Bulk file import validation and error handling.

---

## Production Build

To compile the React application for production deployment:

```powershell
cd frontend
npm run build
```

The optimized, minified bundle is generated in `frontend/dist/`.
