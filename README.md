# AI-Powered Resume Analysis & Job Matching System

> **Developed by [Ankitha Ramesh](https://github.com/AnkithaRameshGowda)**

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-powered-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](LICENSE)

---

📄 **Published Research:** [International Journal of Recent Scientific Engineering Research and Innovation (IJRSERI)](https://www.doi.org/10.59256/ijsreat.20250506017)
`DOI: 10.59256/ijsreat.20250506017`

📸 **Visual Showcase:** [PROJECT_SHOWCASE.md](./PROJECT_SHOWCASE.md)

---

## Overview

A full-stack, AI-driven recruitment platform that bridges the gap between recruiters and job seekers. The system uses **Google Gemini AI** to perform intelligent ATS (Applicant Tracking System) resume analysis, skill-gap identification, and job-candidate compatibility scoring — all within a real-time, role-based web application.

This was developed as a final-year engineering project and has been accepted for publication in a peer-reviewed international journal.

### What makes it different?

- Recruiters get **AI-generated match scores** with weighted skill analysis — not just keyword counts.
- Applicants get **personalized, actionable feedback** and course recommendations to close skill gaps.
- The entire workflow — apply, review, communicate, decide — happens in one platform.

---

## Key Features

### For Recruiters
- Post and manage job listings with custom skill weights
- View AI-scored applications ranked by compatibility
- Accept or reject with one-click automated feedback delivery
- Real-time notifications for new applications
- Direct messaging with applicants

### For Applicants
- Browse and apply to jobs with resume upload (PDF/DOCX)
- Instant ATS score and skill-matching report
- Personalized improvement suggestions and course recommendations
- Track application status in real time
- Message recruiters directly

### Platform
- JWT-based secure authentication with role separation (recruiter / applicant)
- Microservices backend architecture (3 independent Flask services)
- Fully responsive UI with dark/light mode support
- User-scoped data isolation — no data leakage between accounts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Python, Flask, Flask-CORS |
| AI Engine | Google Gemini AI (resume analysis, scoring, recommendations) |
| Database | MongoDB (PyMongo) |
| Auth | JWT (JSON Web Tokens), bcrypt |
| File Parsing | PyPDF2, python-docx |
| Dev Tools | ESLint, Prettier, PostCSS |

---

## Architecture

The backend is split into three independent microservices:

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                    │
│              (localhost:3000 — TypeScript)               │
└────────────┬───────────────────┬───────────────────┬────┘
             │                   │                   │
     ┌───────▼──────┐   ┌────────▼──────┐  ┌────────▼──────┐
     │  Auth Service │   │  ATS Service  │  │  Job Match AI │
     │  Port 5001    │   │  Port 5000    │  │  Port 5002    │
     │               │   │               │  │               │
     │ • Auth/JWT    │   │ • Resume NLP  │  │ • Skill Match │
     │ • Jobs CRUD   │   │ • ATS Scoring │  │ • Compat Score│
     │ • Applications│   │ • Skill Extract│  │ • Gemini AI   │
     │ • Messaging   │   │ • Suggestions │  │               │
     │ • Notifications│  └───────────────┘  └───────────────┘
     └───────┬───────┘
             │
     ┌───────▼───────┐
     │    MongoDB    │
     │               │
     │ users         │
     │ jobs          │
     │ applications  │
     │ notifications │
     │ messages      │
     └───────────────┘
```

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key ([get one here](https://ai.google.dev/))

### 1. Clone the Repository

```bash
git clone https://github.com/AnkithaRameshGowda/AI-Powered-Resume-Analysis-System.git
cd AI-Powered-Resume-Analysis-System
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/ai_resume_system
JWT_SECRET_KEY=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Install Dependencies

**Backend:**
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### 4. Run the Application

**Quick start (recommended) — launches all 4 services:**
```bash
python run.py
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Auth Service | http://localhost:5001 |
| ATS Service | http://localhost:5000 |
| Job Matching AI | http://localhost:5002 |

**Manual start (advanced):**
```bash
# Four separate terminals:
python auth.py
python ats.py
python job_matching_ai.py
npm run dev        # from root directory
```

---

## API Reference

<details>
<summary><strong>Authentication</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/user` | Get authenticated user info |

</details>

<details>
<summary><strong>Jobs</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List all active jobs |
| POST | `/api/jobs` | Create job (recruiter only) |
| GET | `/api/jobs/<id>` | Get job details |
| PUT | `/api/jobs/<id>` | Update job (recruiter only) |
| DELETE | `/api/jobs/<id>` | Delete job (recruiter only) |

</details>

<details>
<summary><strong>Applications</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/<job_id>/apply` | Submit application with resume |
| GET | `/api/applications` | Get current user's applications |
| PUT | `/api/applications/<id>/status` | Update status (recruiter only) |
| GET | `/api/applications/<id>/feedback` | Retrieve AI feedback |

</details>

<details>
<summary><strong>ATS Analysis</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analyze-resume` | Analyze resume vs job description |
| POST | `/api/skill-recommendations` | Get skill gap recommendations |

</details>

<details>
<summary><strong>Notifications & Messaging</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/read/<id>` | Mark notification as read |
| GET | `/api/messages/conversations` | List conversations |
| POST | `/api/messages/send` | Send a message |
| GET | `/api/messages/<conversation_id>` | Get conversation thread |

</details>

---

## How It Works

```
Applicant uploads resume
        │
        ▼
ATS Service extracts text (PDF/DOCX)
        │
        ▼
Gemini AI scores resume: ATS optimization, keyword density,
formatting quality → score out of 100
        │
        ▼
Job Matching AI computes compatibility score using
weighted skill matching between resume and job requirements
        │
        ▼
Recruiter sees ranked candidates with scores + full AI analysis
        │
        ▼
Recruiter accepts/rejects → automated feedback sent to applicant
        │
        ▼
Applicant receives personalized suggestions + course recommendations
```

---

## Database Schema

<details>
<summary>View schema definitions</summary>

```javascript
// Users
{ _id, name, email, password (bcrypt), role: 'recruiter'|'applicant', createdAt, updatedAt }

// Jobs
{ _id, title, company, description, location,
  skills: [{ name, weight }], recruiterId, recruiterEmail,
  active, applications: [id], createdAt, updatedAt }

// Applications
{ _id, jobId, jobTitle, companyName, applicantId, applicantName,
  applicantEmail, resumeData, matchScore, 
  status: 'pending'|'accepted'|'rejected', feedback, notes, createdAt, updatedAt }

// Notifications
{ _id, userId, type: 'application'|'status'|'message',
  title, message, jobId, applicantName, jobTitle, read, createdAt }

// Messages
{ _id, senderId, senderEmail, receiverId, receiverEmail,
  jobId, message, read, createdAt }
```

</details>

---

## Security

- Passwords hashed with **bcrypt**
- All routes protected via **JWT token verification**
- Strict **user-scoped data access** — users only see their own records
- **CORS** configured per service
- Comprehensive **input validation** on all API endpoints

---

## Research Publication

This project is the implementation behind a peer-reviewed research paper:

> **"AI-Powered Resume Screening System"**
> Ankitha R
> *International Journal of Recent Scientific Engineering Research and Innovation (IJRSERI)*
> DOI: [10.59256/ijsreat.20250506017](https://www.doi.org/10.59256/ijsreat.20250506017)

The full project report is available in [`Ankitha_Final.pdf`](./Ankitha_Final.pdf).

---

## Project Showcase

Screenshots, dashboard previews, and ATS report samples are organized in **[PROJECT_SHOWCASE.md](./PROJECT_SHOWCASE.md)**.

---

## Repository Structure

```
AI-Powered-Resume-Analysis-System/
│
├── app/                        # Next.js App Router pages
├── components/                 # Reusable React components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
│
├── auth.py                     # Auth microservice (Port 5001)
├── ats.py                      # ATS analysis service (Port 5000)
├── job_matching_ai.py          # Job matching AI service (Port 5002)
├── run.py                      # Single-command launcher
├── init_db.py                  # Database initialization
├── requirements.txt            # Python dependencies
│
├── package.json                # Node.js dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
│
├── screenshots/                # UI screenshots (see PROJECT_SHOWCASE.md)
├── reports/                    # ATS sample reports
│
├── Ankitha_Final.pdf           # Full project report
├── README.md                   # This file
├── PROJECT_SHOWCASE.md         # Visual showcase
├── SETUP.md                    # Extended setup guide
└── .gitignore
```

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Author

**Ankitha Ramesh
**
Final Year Engineering Project — Published Research
[GitHub](https://github.com/AnkithaRameshGowda) · [Research Paper](https://www.doi.org/10.59256/ijsreat.20250506017)
