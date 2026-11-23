# EduAnalytics — Student Performance Analysis System

[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_5-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Django](https://img.shields.io/badge/Backend-Django_5_REST_API-092e20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind_CSS-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Charts](https://img.shields.io/badge/Charts-Chart.js-ff6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

**EduAnalytics** is a modern, high-performance academic performance tracking and cohort analytics platform. Built with a decoupled architecture featuring a **React (Vite) Single Page Application** frontend with an eye-catching **Emerald & Mint Teal** design system and a **Django REST API** backend powered exclusively by **Supabase (Managed PostgreSQL)** over secure SSL pooling.

---

## 🌟 Key Highlights

- **User-Free & Frictionless:** Zero login gates, session tokens, or credential barriers — instant, seamless access to all dashboards, directories, analytics, and reporting tools.
- **Decoupled Architecture:** Clean separation between the React client and the Django REST API.
- **Cloud-Native Database:** Fully migrated to **Supabase PostgreSQL** with SSL pooling (zero file-based SQLite).
- **Interactive Visualizations:** 5 dynamic Chart.js dashboards (Subject performance, Grade distribution, Top student rankings, Historical exam score trends, and Pass/Fail donut).
- **Comprehensive Student Profiles:** Detailed academic drilldown, attendance tracking, exam histories, and performance trajectories.
- **Class Leaderboard:** Class-wise and cohort-wide rankings with trophy badges and performance indicators.
- **Bulk Data Importer:** Flexible CSV and Excel (`.xlsx`, `.xls`) ingestion with automatic schema detection and smart fallback generation for students, subjects, and exam scores.
- **Modern Emerald & Mint Teal Theme:** Refined typography, smooth transitions, pulse sync badges, and responsive sidebar navigation.

---

## 🔄 System Architecture & Workflow Structure

EduAnalytics operates as an end-to-end, reactive data system designed for frictionless ingestion, real-time academic metric computation, and interactive visualization.

### 1. High-Level Architecture Flow

```mermaid
flowchart LR
    subgraph Client["Client Tier (Port 3000)"]
        UI["React 18 SPA<br/>(Vite, Tailwind, Chart.js)"]
        Skeleton["Dynamic Loading Skeletons<br/>(LoadingSkeleton.jsx)"]
    end

    subgraph Gateway["API Gateway Tier"]
        Proxy["Vite Dev Proxy<br/>/api → :8000"]
        CORS["Custom CorsMiddleware<br/>(cors_middleware.py)"]
    end

    subgraph Backend["Django REST API Tier (Port 8000)"]
        Router["URL Router<br/>(api_urls.py)"]
        Controllers["API Views & Aggregations<br/>(api_views.py)"]
        ORM["Django ORM Models<br/>(Student, Subject, ExamResult)"]
        Cache["Django Cache Invalidator<br/>(dashboard_summary)"]
    end

    subgraph Database["Supabase Managed Database (Port 6543)"]
        Pooler["PgBouncer SSL Pooler"]
        Postgres["PostgreSQL Database<br/>(Tables, Indexes, Constraints)"]
    end

    UI --> Skeleton
    UI -->|HTTP Requests| Proxy
    Proxy --> CORS
    CORS --> Router
    Router --> Controllers
    Controllers --> Cache
    Controllers --> ORM
    ORM -->|SSL Connection Pool| Pooler
    Pooler --> Postgres
```

---

### 2. End-to-End Operational Workflows

#### Workflow A: Bulk Data Ingestion & Auto-Resolution Pipeline
The system allows administrators to import entire cohorts, curricula, and exam records in bulk via CSV or Excel (`.xlsx`, `.xls`). It features schema auto-detection and fallback generation so data is never rejected due to minor formatting mismatches.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as User / School Admin
    participant UI as Bulk Upload UI (React)
    participant API as Upload API (/api/upload/)
    participant AutoDetect as Schema Detector & Normalizer
    participant DB as Supabase PostgreSQL

    Admin->>UI: Selects file (.csv, .xlsx, .xls)
    UI->>UI: Auto-detects data type by filename (students / subjects / results)
    Admin->>UI: Clicks 'Upload & Import Data'
    UI->>API: POST /api/upload/ (multipart/form-data)
    API->>AutoDetect: Inspect file headers and column signatures
    Note over AutoDetect: Auto-identifies schema (Students, Subjects, or Results)<br/>even if dropdown was incorrectly selected
    API->>DB: Begin Atomic Database Transaction
    alt Ingesting Students Roster
        API->>DB: Upsert Student records (auto-generates unique fallback email, cleans names)
    else Ingesting Subjects Curriculum
        API->>DB: Upsert Subject records (unique code, max marks, teacher)
    else Ingesting Exam Results
        API->>DB: Auto-create missing student/subject stubs if not existing
        API->>DB: Compute percentage score & assign letter grade (A+ through F)
        API->>DB: Upsert ExamResult record
    end
    API->>DB: Commit Transaction & Invalidate Cache ('dashboard_summary')
    DB-->>API: Confirm Records Committed
    API-->>UI: Return JSON { success: true, count: N, message: "..." }
    UI-->>Admin: Display Emerald Success Banner & refresh active views
```

---

#### Workflow B: Academic Performance & Grading Calculation Workflow
Every exam result ingested or recorded undergoes real-time grade evaluation and cohort-level metric re-calculation.

```mermaid
flowchart TD
    A["Raw Exam Marks Input<br/>(marks_obtained / max_marks)"] --> B["Compute Percentage<br/>round((marks_obtained / max_marks) * 100, 2)"]
    B --> C{"Evaluate Grade Threshold"}
    
    C -->|">= 95%"| G1["A+ (High Distinction)"]
    C -->|">= 90%"| G2["A (Distinction)"]
    C -->|">= 85%"| G3["A-"]
    C -->|">= 80%"| G4["B+"]
    C -->|">= 75%"| G5["B"]
    C -->|">= 70%"| G6["B-"]
    C -->|">= 65%"| G7["C+"]
    C -->|">= 60%"| G8["C"]
    C -->|">= 55%"| G9["C-"]
    C -->|">= 50%"| G10["D (Passing)"]
    C -->|"< 50%"| G11["F (Remedial Required)"]

    B --> Agg["Cohort Aggregation Engine (/api/dashboard/ & /api/analysis/)"]
    Agg --> S1["Subject Average Scores (/api/chart/subject-avg/)"]
    Agg --> S2["Grade Distribution Breakdown (/api/chart/grade-dist/)"]
    Agg --> S3["Class-wise Performance (/api/chart/class-performance/)"]
    Agg --> S4["Chronological Exam Trends (/api/chart/exam-trend/)"]
    Agg --> S5["Top 10 Student Rankings (/api/chart/top-students/)"]
```

---

#### Workflow C: Cohort Rankings & Academic Leaderboard
The leaderboard computes student standings dynamically without requiring pre-computed static rank tables:

1. **Filtering:** Filter rankings cohort-wide or isolate specific classes (e.g., `10A`, `10B`).
2. **Dynamic Ranking Algorithm:** Queries all active students in the selected scope, aggregates all recorded exam results, and sorts by cumulative average in descending order.
3. **Podium Badges:**
   - **Rank 1:** Gold Trophy badge (`#1`).
   - **Rank 2:** Silver Award badge (`#2`).
   - **Rank 3:** Bronze Award badge (`#3`).
   - **Remaining Ranks:** Standard numerical ranking `#N`.
4. **Performance Category Tags:** Classified automatically into `Excellent` (≥85%), `Good` (≥70%), `Pass` (≥50%), or `Needs Improvement` (<50%).

---

#### Workflow D: Student Lifecycle & Profile Drilldown
1. **Directory Search & Filter:** Search by name, student ID, class, or gender with instant debounce filtering.
2. **Record Management:** Add or edit student demographics in real time using modal dialogs.
3. **Deep Profile View:**
   - Visual avatar generated from student initials.
   - Dynamic class rank calculated against active class peers.
   - Attendance percentage summary.
   - Interactive Bar chart showing individual subject score averages vs. pass baselines.
   - Full chronological history of all exam attempts and grades.

---

## 📁 Project Structure

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
│   ├── media/                     ← Uploaded student profile photos
│   ├── staticfiles/               ← Production static assets
│   ├── student_performance/       ← Django project configuration
│   │   ├── settings.py            ← Configured strictly for Supabase PostgreSQL (SSL)
│   │   ├── cors_middleware.py     ← CORS headers middleware for React SPA
│   │   ├── urls.py                ← Root router delegating /api/
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── students/                  ← Academic tracking app
│       ├── models.py              ← Student, Subject, ExamResult, Attendance models
│       ├── api_views.py           ← Clean, modular REST API endpoints
│       ├── api_urls.py            ← REST API URL definitions
│       ├── tests.py               ← Comprehensive automated test suite
│       └── migrations/            ← Django database migrations
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
│       │   ├── Modal.jsx          ← Accessible dialog modal component
│       │   └── LoadingSkeleton.jsx ← Modular skeleton loaders for zero-layout-shift
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
│           └── main.css           ← Modern Emerald & Mint Teal design system
│
├── .gitignore                     ← Git configuration
└── README.md                      ← Project documentation
```

---

## 🗄️ Supabase Database Configuration

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
```

#### Option B: Via Supabase SQL Editor (Direct)
1. Open the **SQL Editor** tab in your Supabase Dashboard.
2. Open [`backend/supabase_schema.sql`](backend/supabase_schema.sql) from this project.
3. Paste the contents into the SQL Editor and click **Run**.
4. All tables (`students_student`, `students_subject`, `students_examresult`, `students_attendance`), constraints, and indexes will be created immediately.

---

## 🚀 Quick Start (Local Development)

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

# Run the Django REST API server
python manage.py runserver 0.0.0.0:8000
```

The REST API will be live at: **`http://127.0.0.1:8000/api/`**

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

*(API calls to `/api/` and requests to `/media/` are automatically proxied by Vite to the backend on `http://127.0.0.1:8000`).*

---

### Step 3: Populate Initial Data

Navigate to **Bulk Data Import** (`http://localhost:3000/upload`) in the app and upload the template files provided in `backend/sample_data/`:
1. Upload [`subjects_sample.csv`](backend/sample_data/subjects_sample.csv) (Subjects Curriculum).
2. Upload [`students_sample.csv`](backend/sample_data/students_sample.csv) (Students Roster).
3. Upload [`results_sample.csv`](backend/sample_data/results_sample.csv) (Exam Marks).

All dashboards and analytics will immediately populate with real live metrics!

---

## 📡 REST API Reference

The backend exposes a clean, unauthenticated REST API under the `/api/` prefix:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/` | Core KPI counters, subject averages, grade counts, top students, and recent marks |
| `GET` | `/api/students/` | Filterable list of students (`q`, `class_name`, `gender`) |
| `POST` | `/api/students/` | Create a new student record |
| `GET` | `/api/students/<id>/` | Detailed student profile with subject marks, class rank, and attendance |
| `PATCH` | `/api/students/<id>/` | Partial update of student details |
| `DELETE` | `/api/students/<id>/` | Delete a student and cascade-remove associated results |
| `GET` | `/api/subjects/` | List all curriculum subjects with teacher and max marks |
| `POST` | `/api/subjects/` | Create a new subject |
| `DELETE` | `/api/subjects/<id>/` | Delete a subject and associated results |
| `GET` | `/api/results/` | Filterable exam results (`class_name`, `exam_type`, `subject`) |
| `POST` | `/api/results/` | Record new exam marks (auto-computes grade and percentage) |
| `DELETE` | `/api/results/<id>/` | Remove an exam result record |
| `GET` | `/api/analysis/` | Detailed subject breakdown, min/max scores, and pass percentages |
| `GET` | `/api/class-rankings/` | Class-wise or cohort-wide student rankings sorted by academic average |
| `POST` | `/api/upload/` | Multipart file upload for CSV or Excel (`.csv`, `.xlsx`, `.xls`) |
| `GET` | `/api/chart/grade-dist/` | Distribution count of grades `A+` through `F` for Doughnut chart |
| `GET` | `/api/chart/subject-avg/` | Subject-wise mean percentage scores for Bar chart |
| `GET` | `/api/chart/class-performance/` | Class-wise mean percentage scores for Bar chart |
| `GET` | `/api/chart/top-students/` | Top 10 students by cumulative average for Bar chart |
| `GET` | `/api/chart/exam-trend/` | Chronological exam type averages for Line chart |
| `GET` | `/api/chart/student/<id>/` | Individual student's subject breakdown for Profile Bar chart |

---

## 📊 Bulk Import Formats

Sample import templates are provided in [`backend/sample_data/`](backend/sample_data/).

### 1. Students (`students_sample.csv`)
```csv
student_id,first_name,last_name,email,gender,class_name,section,roll_number,parent_name,contact
STU001,Alice,Johnson,alice@school.edu,Female,10A,A,1,Mr. Johnson,9812345671
STU002,Bob,Smith,bob@school.edu,Male,10A,A,2,Mrs. Smith,9812345672
```

### 2. Subjects (`subjects_sample.csv`)
```csv
code,name,class_name,max_marks,teacher
MATH10,Mathematics,10A,100,Mr. Sharma
SCI10,Science,10A,100,Ms. Patel
```

### 3. Exam Results (`results_sample.csv`)
```csv
student_id,subject_code,exam_type,exam_date,marks_obtained,max_marks
STU001,MATH10,Final,2024-03-15,85,100
STU001,SCI10,Final,2024-03-16,90,100
```

---

## 🧪 Automated Testing

Run Django's system check and automated tests to verify models, views, and calculation pipelines:

```powershell
cd backend
python manage.py check
```

---

## 📦 Production Build

To compile the React application for production deployment:

```powershell
cd frontend
npm run build
```

The optimized, minified bundle is generated in `frontend/dist/`.
