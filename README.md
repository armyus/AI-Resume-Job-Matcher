# AI Resume Job Matcher

An AI-powered resume and job matching platform that parses resumes, extracts skills and requirements, scores candidates against job descriptions, and provides recruiter-facing analytics and authentication.

## Overview

This project combines a Python Flask backend with a React frontend to help recruiters evaluate applicants quickly. It can:

- parse uploaded resumes in PDF, DOCX, and TXT formats
- extract skills, experience, education, and section data from candidate profiles
- parse job descriptions into structured requirements
- match a candidate against a job using weighted scoring across skill, experience, education, and semantic fit
- support recruiter role creation and analytics dashboards
- authenticate users with email/password sessions

## Tech Stack

- Backend: Python, Flask, Werkzeug, Flask-CORS
- Frontend: React, Vite, Tailwind CSS, Recharts, Framer Motion
- NLP / Parsing: custom extractors and preprocessing utilities
- Matching: rule-based plus semantic similarity scoring

## Project Structure

```text
AI-Resume-Job-Matcher/
├── app.py                       # Flask app entry point and API routes
├── requirements.txt            # Python dependencies
├── package.json                # Root Node metadata (if used for tooling)
├── data/
│   ├── Job Description/
│   └── Resumes/
├── outputs/
│   └── users.json              # Seeded user accounts and password hashes
├── src/
│   ├── document_parser.py
│   ├── education_extractor.py
│   ├── experience_extractor.py
│   ├── job_parser.py
│   ├── matching_engine.py
│   ├── profile_builder.py
│   ├── recommendation_engine.py
│   ├── requirement_extractor.py
│   ├── section_extractor.py
│   ├── skill_extractor.py
│   └── text_preprocessor.py
├── Frontend/
│   ├── package.json
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── tailwind.config.js
├── test_matching.py
├── test_extraction.py
├── test_job_parser.py
├── test_profile_extraction.py
├── test_requirement_extractor.py
├── test_role_parser.py
├── test_role_requirements.py
├── test_skill_extractor.py
├── test_recommendation.py
├── test_batch_matching.py
└── README.md
```

## Features

### Resume Intelligence
- Reads resume content from uploaded files
- Detects sections like summary, skills, education, experience, projects, and certifications
- Extracts structured career information for matching

### Job Profile Parsing
- Splits job descriptions into key sections
- Extracts required skills, degree requirements, field requirements, and minimum experience

### Candidate Matching
- Scores candidate and role alignment across several dimensions
- Produces an overall match percentage and detailed contributor metrics
- Includes missing skill detection and recommendation-style insight output

### Recruiter Dashboard
- Role creation and management
- Candidate queue and analytics
- Match scoring and pipeline summaries

### Authentication
- Register and login endpoints
- Session-based access control for authenticated endpoints
- Role-aware recruiter vs candidate handling

## Prerequisites

Before running the project, install:

- Python 3.10+
- Node.js 18+
- npm

## Setup

### 1) Backend

From the project root:

```bash
python -m venv venv
# Windows PowerShell
.\venv\Scripts\Activate.ps1
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```

The API runs on:

- http://localhost:5000

### 2) Frontend

Open a new terminal and run:

```bash
cd Frontend
npm install
npm run dev
```

The UI runs on:

- http://localhost:5173

## Main API Endpoints

The backend exposes a set of routes under `/api`:

- `POST /api/register` — create a new user account
- `POST /api/login` — sign in with email/password
- `POST /api/logout` — log out the current session
- `GET /api/me` — fetch current authenticated user
- `GET /api/health` — health check
- `GET /api/jobs` — fetch available job profiles
- `POST /api/match` — match a resume to one job
- `POST /api/match-all` — match one resume against all jobs
- `POST /api/roles` — recruiter can create a role
- `GET /api/analytics` — fetch recruiting analytics

## Sample Data and Seeded Accounts

The project includes sample job descriptions in `data/Job Description` and sample resumes in `data/Resumes`.

The seeded login data is stored in `outputs/users.json`, including sample accounts such as:

- `analytics@test.com` — Recruiter
- `kriship711@gmail.com` — Recruiter
- `pkrishi298@gmail.com` — Candidate

If you need to test the app quickly, you can use these seeded users with their corresponding passwords defined in the app or by registering a new account through the app.

## How Matching Works

The matching engine evaluates candidates using a combination of:

- skill overlap
- experience fit
- education requirements
- domain relevance
- semantic similarity between resume text and job description

The result is a score in the range of 0–100, with additional detail for matched and missing skills.

## Running Tests

This repository includes multiple Python tests for parsing and matching logic. Example commands:

```bash
python -m pytest test_matching.py
python -m pytest test_job_parser.py
python -m pytest test_requirement_extractor.py
python -m pytest test_role_parser.py
```

If `pytest` is not installed in your environment, install it with:

```bash
pip install pytest
```

## Notes

- Authentication relies on session cookies, so the frontend and backend must be served from the local origins configured in CORS.
- The app is structured for local demo and development workflows, not a production deployment setup.
- Job and resume parsing logic is custom and designed to work with typical resume and JD patterns.

## License

This project is intended for educational and internal demo use unless a repository-specific license is added later.

## Contributing

To extend the system, the most relevant files are:

- `app.py` for API flow and authentication
- `src/matching_engine.py` for scoring logic
- `src/requirement_extractor.py` for JD parsing
- `src/skill_extractor.py` and related extractors for resume parsing
- `Frontend/src` for the interface and recruiter workflows
