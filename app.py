from pathlib import Path
from tempfile import TemporaryDirectory
from io import BytesIO
import os
import json
import sqlite3
from gmail_service import send_email

from flask import Flask, jsonify, request, session, send_file
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from werkzeug.utils import secure_filename
from firebase_db import db
from firebase_admin import firestore
from gemini_ai import analyze_resume_with_ai, generate_job_description
from datetime import datetime
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from xml.sax.saxutils import escape


from src.document_parser import extract_text
from src.education_extractor import extract_education
from src.experience_extractor import extract_experience
from src.job_parser import extract_jd_sections
from src.profile_builder import build_candidate_profile, build_job_profile
from src.requirement_extractor import extract_requirements
from src.section_extractor import extract_sections
from src.skill_extractor import extract_skills
from src.text_preprocessor import clean_text


ROOT = Path(__file__).resolve().parent
JOB_DIR = ROOT / "data" / "Job Description"
USER_STORE = ROOT / "outputs" / "users.json"
ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}
JOB_IDS = {"#402": "sample_jd_1.pdf", "#398": "sample_jd_2.pdf"}
MATCH_HISTORY = []
RECRUITER_ROLES = []

DB_PATH = ROOT / "data" / "rmi_database.db"

def _firestore_roles():
    roles = []

    try:
        docs = db.collection("jobs").stream()

        for doc in docs:
            role = doc.to_dict()

            if role.get("id"):
                roles.append(role)

    except Exception as error:
        app.logger.exception("Failed to load recruiter roles from Firestore")

    return roles

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                candidate_name TEXT,
                candidate_email TEXT,
                job_id TEXT,
                job_title TEXT,
                score INTEGER DEFAULT 0,
                stage TEXT DEFAULT 'Applied',
                verdict TEXT,
                matched_skills TEXT,
                missing_skills TEXT,
                strengths TEXT,
                risks TEXT,
                questions TEXT,
                experience TEXT,
                education TEXT,
                projects TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Auto-migration: guarantees missing columns are added to existing database files
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(applications)")
        existing_cols = [row[1] for row in cursor.fetchall()]
        needed_cols = ["verdict", "strengths", "risks", "questions", "experience", "education", "projects", "job_title", "score", "stage"]
        for col in needed_cols:
            if col not in existing_cols:
                conn.execute(f"ALTER TABLE applications ADD COLUMN {col} TEXT DEFAULT '[]'")
        conn.commit()

init_db()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get(
    "RMI_SECRET_KEY",
    "rmi-ai-dev-secret-key",
)

try:
    USERS = json.loads(USER_STORE.read_text(encoding="utf-8")) if USER_STORE.exists() else {}
except (OSError, json.JSONDecodeError):
    USERS = {}
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }
    },
    supports_credentials=True,
)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


def _allowed_file(filename):
	return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _build_candidate(file_path):
	text = clean_text(extract_text(str(file_path)))
	sections = extract_sections(text)
	skills = extract_skills(
		sections.get("skills", "")
		+ "\n"
		+ sections.get("projects", "")
		+ "\n"
		+ sections.get("summary", "")
	)
	return build_candidate_profile(
		name=file_path.stem,
		summary=sections.get("summary", ""),
		skills=skills,
		experience=extract_experience(sections.get("experience", "")),
		education=extract_education(sections.get("education", "")),
		projects=[sections.get("projects", "")],
		certifications=[sections.get("certifications", "")],
	)


def _build_job(job_path):
	text = clean_text(extract_text(str(job_path)))
	sections = extract_jd_sections(text)
	requirements = extract_requirements(text, sections.get("requirements", ""))
	return build_job_profile(
		title=job_path.stem,
		description=sections.get("description", ""),
		responsibilities=sections.get("responsibilities", ""),
		required_skills=requirements["required_skills"],
		minimum_experience_years=requirements["minimum_experience_years"],
		experience_domains=requirements["experience_domains"],
		required_degree=requirements["required_degree"],
		required_fields=requirements["required_fields"],
	)


def _json_error(message, status=400):
	return jsonify({"error": message}), status


def _save_users():
    USER_STORE.parent.mkdir(parents=True, exist_ok=True)
    USER_STORE.write_text(json.dumps(USERS, indent=2), encoding="utf-8")


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "Recruiter")

    if not name or not email or not password:
        return _json_error("Name, email and password are required.")

    if len(password) < 6:
        return _json_error("Password must be at least 6 characters.")

    if role not in {"Recruiter", "Candidate"}:
        return _json_error("Role must be Recruiter or Candidate.")

    if email in USERS:
        return _json_error("An account with this email already exists.", 409)

    USERS[email] = {
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "role": role,
    }
    _save_users()

    session["user_email"] = email

    return jsonify({
        "message": "Account created successfully.",
        "user": {
            "name": name,
            "email": email,
            "role": role,
        },
    }), 201


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return _json_error("Email and password are required.", 400)

    user = USERS.get(email)

    if not user:
        return _json_error("Invalid email or password.", 401)

    stored_password = user.get("password", "")

    if not stored_password or not check_password_hash(stored_password, password):
        return _json_error("Invalid email or password.", 401)

    # Authentication is based ONLY on email + password.
    # The user's role comes from the account stored in users.json.
    session.clear()
    session["user_email"] = email

    return jsonify({
        "message": "Login successful.",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "Candidate"),
        },
    }), 200


@app.get("/api/me")
def current_user():
    email = session.get("user_email")

    if not email or email not in USERS:
        return _json_error("Not authenticated.", 401)

    user = USERS[email]

    return jsonify({
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }
    })


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully."})

@app.get("/api/health")
def health():
	return jsonify({"status": "ok", "service": "resume-job-matcher"})


@app.get("/api/jobs")
def jobs():
	available = []
	for job_id, filename in JOB_IDS.items():
		path = JOB_DIR / filename
		if path.exists():
			available.append({
				"id": job_id,
				"title": path.stem,
				"company": "RMI AI",
				"department": "Engineering" if job_id == "#402" else "AI/ML",
				"location": "Remote (US)",
				"filename": filename,
                "profile": _build_job(path),
			})
	available.extend(_firestore_roles())
	return jsonify({"jobs": available})


@app.get("/api/jobs/<job_id>/pdf")
def job_pdf(job_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error

    recruiter = USERS[session["user_email"]]
    if recruiter.get("role", "Recruiter") != "Recruiter":
        return _json_error("Only recruiters can export job PDFs.", 403)

    job = next((item for item in _available_job_profiles() if item.get("id") == job_id), None)
    if job is None:
        return _json_error("Job not found.", 404)

    try:
        applications = [
            document.to_dict()
            for document in db.collection("applications").where("job_id", "==", job_id).stream()
        ]
    except Exception as error:
        app.logger.exception("Failed to load applications for job PDF")
        return _json_error(f"Failed to load applications: {error}", 500)

    profile = job.get("profile") or {}
    description = profile.get("description") or job.get("description") or "No job description available."
    required_skills = (
        profile.get("required_skills")
        or profile.get("requiredSkills")
        or job.get("required_skills")
        or []
    )
    minimum_experience = profile.get("minimum_experience_years") or job.get("experience")
    experience_domains = profile.get("experience_domains") or []

    def pdf_value(value, fallback="Not specified"):
        if isinstance(value, (list, tuple)):
            return ", ".join(str(item) for item in value if item) or fallback
        return str(value) if value not in (None, "") else fallback

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="DocumentTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=18,
    ))

    story = [
        Paragraph("RMI AI", styles["DocumentTitle"]),
        Paragraph("JOB DESCRIPTION", styles["DocumentTitle"]),
    ]

    def add_section(heading, value):
        story.append(Paragraph(escape(heading), styles["Heading2"]))
        story.append(Paragraph(escape(pdf_value(value)), styles["BodyText"]))
        story.append(Spacer(1, 0.12 * inch))

    add_section("Job Title", job.get("title"))
    add_section("Req ID", job.get("id"))
    add_section("Department", job.get("department"))
    add_section("Location", job.get("location"))
    add_section("JOB DESCRIPTION", description)
    add_section("REQUIRED SKILLS", required_skills or "Not specified")

    experience = []
    if minimum_experience not in (None, "", 0, 0.0):
        experience.append(f"Minimum experience: {minimum_experience} years")
    if experience_domains:
        experience.append(f"Experience domains: {pdf_value(experience_domains)}")
    add_section("EXPERIENCE", experience or "Not specified")

    story.append(Paragraph("ANALYZED CANDIDATES", styles["Heading2"]))
    if not applications:
        story.append(Paragraph(
            "No candidates have been analyzed for this role yet.",
            styles["BodyText"],
        ))
    else:
        for application in applications:
            candidate_lines = [
                f"Name: {pdf_value(application.get('candidate_name'), 'Candidate')}",
                f"Email: {pdf_value(application.get('candidate_email'))}",
                f"Match Score: {pdf_value(application.get('score'), '0')}%",
                f"Stage: {pdf_value(application.get('stage'), 'Analyzed')}",
                f"Matched Skills: {pdf_value(application.get('matched_skills'), 'None')}",
                f"Missing Skills: {pdf_value(application.get('missing_skills'), 'None')}",
            ]
            story.append(Paragraph("<br/>".join(escape(line) for line in candidate_lines), styles["BodyText"]))
            story.append(Spacer(1, 0.14 * inch))

    pdf_buffer = BytesIO()
    document = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
    )
    document.build(story)
    pdf_buffer.seek(0)

    filename = secure_filename(f"RMI_AI_{job.get('title', 'Job')}_{job_id}.pdf")
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


@app.post("/api/match")
def match():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    resume = request.files.get("resume")
    return _match_resume(resume, request.form.get("job_id", "#402"))


def require_auth():
    email = session.get("user_email")

    if not email or email not in USERS:
        return _json_error("Authentication required.", 401)

    return None

def _match_resume(resume, job_id):
    if resume is None or not resume.filename:
        return _json_error("A resume file is required.")
    if not _allowed_file(resume.filename):
        return _json_error("Supported formats: PDF, DOCX, DOC, and TXT.")

    job = next((item for item in _available_job_profiles() if item["id"] == job_id), None)
    if job is None:
        job = _available_job_profiles()[0]

    try:
        RESUME_DIR = ROOT / "data" / "resumes"
        RESUME_DIR.mkdir(parents=True, exist_ok=True)
        
        # Safe filename handling for desktop files with spaces or special characters
        clean_fname = secure_filename(resume.filename)
        if not clean_fname:
            clean_fname = f"resume_{int(datetime.utcnow().timestamp())}.pdf"
            
        resume_path = RESUME_DIR / clean_fname
        resume.save(str(resume_path))

        # Extract text safely
        resume_text = clean_text(extract_text(str(resume_path)))
        job_desc = job["profile"].get("description", "") or job["profile"].get("title", "")

        # 1. Run Gemini AI with real project & education extraction
        ai_eval = analyze_resume_with_ai(
            resume_text=resume_text,
            job_title=job["title"],
            job_description=job_desc
        )

        cand_name = ai_eval.get("candidate_name") or clean_fname.replace(".pdf", "").replace("_", " ")
        cand_email = ai_eval.get("email")
        if not cand_email or "@" not in cand_email or cand_email == "Not provided":
            cand_email = f"{cand_name.lower().replace(' ', '.')}@applicant.com"

        score = int(ai_eval.get("overall_match_score") or 60)
        verdict = ai_eval.get("verdict") or "Review Fit"
        exp_years = float(ai_eval.get("experience_years") or 1.0)
        
        real_education = ai_eval.get("education") or ["Education verified from resume"]
        real_projects = ai_eval.get("projects") or ["Technical Project Experience"]
        real_experience = ai_eval.get("experience_summary") or [f"{exp_years} yrs Technical Experience"]

        # 2. Save directly to Firebase Firestore
        import uuid
        app_id = f"app-{uuid.uuid4().hex[:8]}"
        doc_data = {
            "id": app_id,
            "candidate_name": cand_name,
            "candidate_email": cand_email,
            "job_id": job["id"],
            "job_title": job["title"],
            "score": score,
            "stage": "Screening" if score >= 70 else "Analyzed",
            "verdict": verdict,
            "matched_skills": ai_eval.get("matched_skills", []),
            "missing_skills": ai_eval.get("missing_skills", []),
            "adjacent_skills": ai_eval.get("adjacent_skills", []),
            "strengths": ai_eval.get("strengths", []),
            "risks": ai_eval.get("risks", []),
            "questions": ai_eval.get("interview_questions", []),
            "experience": real_experience,
            "education": real_education,
            "projects": real_projects,
            "experience_years": exp_years,
            "resume_path": str(resume_path.relative_to(ROOT)),
            "resume_filename": resume.filename,
            "applied_at": datetime.utcnow().strftime("%Y-%m-%d")
        }
        
        db.collection("applications").document(app_id).set(doc_data)
        print(f">>> Successfully saved application {app_id} for {cand_name} to Cloud Firestore!")

        formatted_match = {
            "overall_score": score,
            "semantic_similarity": score,
            "skill_match": {
                "score": score,
                "matched_skills": ai_eval.get("matched_skills", []),
                "missing_skills": ai_eval.get("missing_skills", [])
            },
            "experience_match": {"score": max(40, score - 10)},
            "education_match": {"score": 85},
            "recommendation": {
                "recommendation": verdict,
                "strengths": ai_eval.get("strengths", []),
                "gaps": ai_eval.get("risks", []),
                "questions": ai_eval.get("interview_questions", [])
            }
        }

        return jsonify({
            "job_id": job["id"],
            "candidate": {
                "id": app_id,
                "name": cand_name,
                "email": cand_email,
                "experience": real_experience,
                "education": real_education,
                "projects": real_projects,
                "experience_years": exp_years
            },
            "job": job["profile"],
            "match": formatted_match,
        })
    except Exception as error:
        app.logger.exception("Resume matching failed")
        return _json_error(f"Matching failed: {error}", 500)

@app.post("/api/match-all")
def match_all():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    resume = request.files.get("resume")
    if resume is None or not resume.filename:
        return _json_error("A resume file is required.")
    if not _allowed_file(resume.filename):
        return _json_error("Only PDF, DOCX, and TXT resumes are supported.")

    try:
        with TemporaryDirectory() as directory:
            resume_path = Path(directory) / secure_filename(resume.filename)
            resume.save(resume_path)
            candidate = _build_candidate(resume_path)

        from src.matching_engine import calculate_match

        results = []
        for job in _available_job_profiles():
            result = calculate_match(candidate, job["profile"])
            MATCH_HISTORY.append({
                "score": result["overall_score"],
                "job_id": job["id"],
                "department": job.get("department", "Unknown"),
                "missing_skills": result.get("skill_match", {}).get("missing_skills", []),
            })
            results.append({
                "id": job["id"],
                "title": job["title"],
                "company": job.get("company", "RMI AI"),
                "department": job.get("department", "Engineering"),
                "location": job.get("location", "Remote"),
                "match": result,
            })
        results.sort(key=lambda item: item["match"]["overall_score"], reverse=True)
        return jsonify({"candidate": candidate, "matches": results})
    except (OSError, RuntimeError, ValueError) as error:
        return _json_error(str(error), 422)
    except Exception as error:
        app.logger.exception("Resume matching failed")
        return _json_error(f"Matching failed: {error}", 500)


def _available_job_profiles():
    jobs = []
    for job_id, filename in JOB_IDS.items():
        path = JOB_DIR / filename
        if path.exists():
            jobs.append({
                "id": job_id,
                "title": path.stem,
                "company": "RMI AI",
                "department": "Engineering" if job_id == "#402" else "AI/ML",
                "location": "Remote (US)",
                "profile": _build_job(path),
            })
    jobs.extend(_firestore_roles())
    return jobs


@app.post("/api/roles")
def create_role():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    user = USERS[session["user_email"]]

    if user.get("role", "Recruiter") != "Recruiter":
        return _json_error("Only recruiters can create roles.", 403)

    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip()

    if not title:
        return _json_error("A role title is required.")

    role_id = f"#{400 + len(_firestore_roles()) + 1}"

    description = data.get("description", title).strip()
    experience = data.get("experience", "").strip()
    required_skills = data.get("required_skills", [])
    additional_information = data.get("additional_information", "").strip()
    if isinstance(required_skills, str):
        required_skills = [skill.strip() for skill in required_skills.split(",") if skill.strip()]

    profile = _build_job_profile_from_text(
        title,
        description
    )
    profile["required_skills"] = list(dict.fromkeys(
        profile.get("required_skills", []) + required_skills
    ))

    role = {
        "id": role_id,
        "title": title,
        "company": data.get("company", "RMI AI").strip() or "RMI AI",
        "department": data.get("department", "Engineering").strip() or "Engineering",
        "location": data.get("location", "Remote").strip() or "Remote",
        "description": description,
        "experience": experience,
        "required_skills": required_skills,
        "additional_information": additional_information,
        "created_at": datetime.utcnow().isoformat(),
        "recruiter": {
            "email": session["user_email"],
            "name": user.get("name", "Recruiter"),
        },
        "profile": profile,
    }

    db.collection("jobs").document(
        role_id.replace("#", "job-")
    ).set(role)

    return jsonify({
        key: value
        for key, value in role.items()
        if key != "profile"
    }), 201


def _build_job_profile_from_text(title, description):
	sections = extract_jd_sections(description)
	requirements = extract_requirements(description, sections.get("requirements", description))
	return build_job_profile(
		title=title,
		description=description,
		responsibilities=sections.get("responsibilities", ""),
		required_skills=requirements["required_skills"],
		minimum_experience_years=requirements["minimum_experience_years"],
		experience_domains=requirements["experience_domains"],
		required_degree=requirements["required_degree"],
		required_fields=requirements["required_fields"],
	)


@app.post("/api/roles/generate-description")
def generate_role_description():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    user = USERS[session["user_email"]]
    if user.get("role", "Recruiter") != "Recruiter":
        return _json_error("Only recruiters can generate job descriptions.", 403)

    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    if not title:
        return _json_error("A job title is required.")

    try:
        description = generate_job_description(
            title=title,
            experience=data.get("experience", "").strip(),
            key_skills=data.get("key_skills", "").strip(),
            additional_information=data.get("additional_information", "").strip(),
        )
        return jsonify({"description": description})
    except Exception as error:
        app.logger.exception("Job description generation failed")
        return _json_error(f"Unable to generate job description: {error}", 502)


@app.get("/api/analytics")
def analytics():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    try:
        # Real source of truth: Firestore
        docs = db.collection("applications").stream()
        apps = [doc.to_dict() for doc in docs]

        total_applications = len(apps)

        # -----------------------------
        # MATCH SCORES
        # -----------------------------
        scores = [
            int(app.get("score") or 0)
            for app in apps
        ]

        average_score = (
            round(sum(scores) / total_applications, 1)
            if total_applications
            else 0
        )

        screened = sum(
            1 for app in apps
            if int(app.get("score") or 0) >= 60
        )

        screening_pass_rate = (
            round(screened / total_applications * 100, 1)
            if total_applications
            else 0
        )

        # -----------------------------
        # PIPELINE
        # -----------------------------
        stage_counts = {
            "Applied": 0,
            "Screening": 0,
            "Interview": 0,
            "Selected": 0,
            "Rejected": 0,
        }

        for app in apps:
            stage = app.get("stage", "Applied")

            if stage in {"Analyzed", "Screening"}:
                stage_counts["Screening"] += 1
            elif stage == "Interview":
                stage_counts["Interview"] += 1
            elif stage == "Selected":
                stage_counts["Selected"] += 1
            elif stage == "Rejected":
                stage_counts["Rejected"] += 1
            else:
                stage_counts["Applied"] += 1

        pipeline_conversion = [
            {
                "stage": "Applications",
                "count": total_applications,
                "percentage": 100,
            },
            {
                "stage": "Screened",
                "count": stage_counts["Screening"],
                "percentage": round(
                    stage_counts["Screening"] / total_applications * 100, 1
                ) if total_applications else 0,
            },
            {
                "stage": "Interview",
                "count": stage_counts["Interview"],
                "percentage": round(
                    stage_counts["Interview"] / total_applications * 100, 1
                ) if total_applications else 0,
            },
            {
                "stage": "Selected",
                "count": stage_counts["Selected"],
                "percentage": round(
                    stage_counts["Selected"] / total_applications * 100, 1
                ) if total_applications else 0,
            },
            {
                "stage": "Rejected",
                "count": stage_counts["Rejected"],
                "percentage": round(
                    stage_counts["Rejected"] / total_applications * 100, 1
                ) if total_applications else 0,
            },
        ]

        # -----------------------------
        # TOP SKILL GAPS
        # -----------------------------
        missing_skill_counts = {}

        for app in apps:
            missing_skills = app.get("missing_skills") or []

            if isinstance(missing_skills, str):
                try:
                    missing_skills = json.loads(missing_skills)
                except Exception:
                    missing_skills = []

            for skill in missing_skills:
                if not skill:
                    continue

                skill = str(skill).strip()

                if skill:
                    missing_skill_counts[skill] = (
                        missing_skill_counts.get(skill, 0) + 1
                    )

        top_skill_gaps = [
            {
                "skill": skill,
                "count": count,
                "percentage": round(
                    count / total_applications * 100, 1
                ) if total_applications else 0,
            }
            for skill, count in sorted(
                missing_skill_counts.items(),
                key=lambda item: item[1],
                reverse=True
            )[:10]
        ]

        # -----------------------------
        # SCORE DISTRIBUTION
        # -----------------------------
        score_ranges = [
            (0, 40),
            (41, 55),
            (56, 70),
            (71, 85),
            (86, 100),
        ]

        score_distribution = []

        for lower, upper in score_ranges:
            score_distribution.append({
                "range": f"{lower}-{upper}",
                "count": sum(
                    1 for score in scores
                    if lower <= score <= upper
                ),
            })

        # -----------------------------
        # DEPARTMENT / ROLE BREAKDOWN
        # -----------------------------
        department_counts = {}

        for app in apps:
            job_id = app.get("job_id")

            if job_id == "#402":
                department = "Engineering"
            elif job_id == "#398":
                department = "AI/ML"
            else:
                department = "Other"

            department_counts[department] = (
                department_counts.get(department, 0) + 1
            )

        department_breakdown = [
            {
                "department": department,
                "count": count,
            }
            for department, count in department_counts.items()
        ]

        # -----------------------------
        # INTERVIEWS
        # -----------------------------
        try:
            interview_docs = db.collection("interviews").stream()
            total_interviews = sum(
                1 for _ in interview_docs
            )
        except Exception:
            total_interviews = 0

        # -----------------------------
        # ROLES
        # -----------------------------
        total_roles = len(_available_job_profiles())

        return jsonify({
            "total_applications": total_applications,
            "average_match_score": average_score,
            "screening_pass_rate": screening_pass_rate,
            "roles": total_roles,

            "pipeline_conversion": pipeline_conversion,

            "top_skill_gaps": top_skill_gaps,

            "score_distribution": score_distribution,

            "department_breakdown": department_breakdown,

            "total_interviews": total_interviews,
            "selected_candidates": stage_counts["Selected"],
            "rejected_candidates": stage_counts["Rejected"],

            "status": "ready",
        })

    except Exception as error:
        app.logger.exception("Analytics calculation failed")
        return _json_error(
            f"Failed to load analytics: {error}",
            500
        )


@app.get("/api/analytics/export")
def export_analytics():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    user = USERS[session["user_email"]]
    if user.get("role", "Recruiter") != "Recruiter":
        return _json_error("Only recruiters can export analytics.", 403)

    analytics_response = analytics()
    if isinstance(analytics_response, tuple):
        return analytics_response
    analytics_data = analytics_response.get_json()

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="AnalyticsTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=18,
    ))
    story = [
        Paragraph("RMI AI", styles["AnalyticsTitle"]),
        Paragraph("RECRUITMENT ANALYTICS REPORT", styles["AnalyticsTitle"]),
    ]

    def add_report_section(heading, value):
        story.append(Paragraph(escape(heading), styles["Heading2"]))
        text = "<br/>".join(escape(line) for line in str(value).splitlines()) or "Not available"
        story.append(Paragraph(text, styles["BodyText"]))
        story.append(Spacer(1, 0.12 * inch))

    add_report_section("Total Applications", analytics_data.get("total_applications", 0))
    add_report_section("Average Match Score", f"{analytics_data.get('average_match_score', 0)}%")
    add_report_section("Screening Pass Rate", f"{analytics_data.get('screening_pass_rate', 0)}%")
    add_report_section("Interview Count", analytics_data.get("total_interviews", 0))
    add_report_section("Selected Count", analytics_data.get("selected_candidates", 0))
    add_report_section("Rejected Count", analytics_data.get("rejected_candidates", 0))
    add_report_section("Pipeline Stage Counts", "\n".join(
        f"{item['stage']}: {item['count']}"
        for item in analytics_data.get("pipeline_conversion", [])
    ) or "No pipeline data")
    add_report_section("Top Skill Gaps", "\n".join(
        f"{item['skill']}: {item['count']} ({item['percentage']}% lacking)"
        for item in analytics_data.get("top_skill_gaps", [])
    ) or "No skill gap data")
    add_report_section("Score Distribution", "\n".join(
        f"{item['range']}: {item['count']}"
        for item in analytics_data.get("score_distribution", [])
    ) or "No score data")
    add_report_section("Department Breakdown", "\n".join(
        f"{item['department']}: {item['count']}"
        for item in analytics_data.get("department_breakdown", [])
    ) or "No department data")

    pdf_buffer = BytesIO()
    SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
    ).build(story)
    pdf_buffer.seek(0)
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="RMI_AI_Analytics_Report.pdf",
    )

@app.post("/api/apply")
def apply():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    data = request.get_json(silent=True) or {}
    job_id = data.get("job_id") or "#402"
    job_title = data.get("job_title", "Software Engineer")
    score = int(data.get("score", 70))
    candidate_name = data.get("name", "Applicant")
    candidate_email = session.get("user_email") or data.get("email") or "applicant@example.com"

    import uuid
    app_id = f"app-{uuid.uuid4().hex[:8]}"

    doc_data = {
        "id": app_id,
        "candidate_name": candidate_name,
        "candidate_email": candidate_email,
        "job_id": job_id,
        "job_title": job_title,
        "score": score,
        "stage": "Applied",
        "verdict": "Candidate Applied",
        "matched_skills": data.get("matched_skills", []),
        "missing_skills": data.get("missing_skills", []),
        "adjacent_skills": [],
        "strengths": ["Direct applicant via candidate portal"],
        "risks": [],
        "questions": [],
        "applied_at": datetime.utcnow().strftime("%Y-%m-%d")
    }

    db.collection("applications").document(app_id).set(doc_data)
    return jsonify({"message": "Application submitted successfully!", "status": "Applied"}), 201

# In-memory cache to prevent burning Firestore quota
APPLICATIONS_CACHE = []
CACHE_TIMESTAMP = 0

@app.get("/api/my-applications")
def my_applications():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    candidate_email = session["user_email"]

    try:
        docs = (
            db.collection("applications")
            .where("candidate_email", "==", candidate_email)
            .stream()
        )

        applications = []

        for doc in docs:
            data = doc.to_dict()

            applications.append({
                "id": data.get("id"),
                "job_id": data.get("job_id"),
                "job_title": data.get("job_title"),
                "stage": data.get("stage", "Applied"),
                "score": data.get("score", 0),
                "applied_at": data.get("applied_at"),
                "interview_date": data.get("interview_date"),
            })

        return jsonify({"applications": applications}), 200

    except Exception as error:
        app.logger.exception("Failed to load candidate applications")
        return _json_error(
            f"Failed to load applications: {error}",
            500
        )

@app.get("/api/applications")
def get_applications():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    candidates = []

    # Helper function for safe JSON loads
    def safe_json(val, default):
        if not val:
            return default
        try:
            return json.loads(val) if isinstance(val, str) else val
        except:
            return default

    # 1. Try Firestore First
    try:
        docs = db.collection("applications").order_by("applied_at", direction=firestore.Query.DESCENDING).limit(50).stream()
        for doc in docs:
            r = doc.to_dict()
            score = int(r.get("score") or 0)
            name = r.get("candidate_name") or "Candidate"
            matched = r.get("matched_skills") or []
            missing = r.get("missing_skills") or []

            candidates.append({
                "id": r.get("id"),
                "name": name,
                "role": r.get("job_title") or "Full Stack Engineer",
                "job_id": r.get("job_id"),
                "reqId": r.get("job_id") or "#402",
                "score": f"{score}%",
                "stage": r.get("stage") or "Analyzed",
                "stageColor": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
                "verdict": r.get("verdict") or "Review Match",
                "verdictColor": "text-emerald-600 dark:text-emerald-400" if score >= 70 else "text-amber-600 dark:text-amber-400",
                "starred": False,
                "avatarColor": "bg-indigo-600",
                "topSkills": matched[:3],
                "baseScore": score,
                "statusText": r.get("verdict") or "AI Match Complete",
                "matchedSkills": matched,
                "missingSkills": missing,
                "adjacentSkills": r.get("adjacent_skills") or [],
                "experience": r.get("experience") or [f"{r.get('experience_years', 1)} yrs experience"],
                "education": r.get("education") or ["University Degree"],
                "projects": r.get("projects") or ["Technical Projects"],
                "expYrs": f"{r.get('experience_years', 1.0)} yrs",
                "reqExpYrs": "5+ yrs",
                "location": "Location unavailable",
                "email": r.get("candidate_email") or f"{name.lower().replace(' ', '.')}@applicant.com",
                "initials": name[:2].upper() if name else "AM",
                "date": r.get("applied_at") or "Recently",
                "scores": {"tech": score, "exp": max(20, score - 10), "edu": 85, "cultural": max(20, score - 15)},
                "verdictTitle": r.get("verdict") or "Review Match",
                "strengths": r.get("strengths") or [],
                "risks": r.get("risks") or [],
                "questions": r.get("questions") or []
            })
    except Exception as e:
        print(f">>> Firestore fetch failed ({e}). Loading from SQLite database directly!")
        with get_db() as conn:
            rows = conn.execute("SELECT * FROM applications ORDER BY applied_at DESC").fetchall()
            for r in rows:
                row = dict(r)
                score = int(row.get("score") or 0)
                name = row.get("candidate_name") or "Candidate"
                matched = safe_json(row.get("matched_skills"), ["Python", "SQL"])
                missing = safe_json(row.get("missing_skills"), [])
                
                candidates.append({
                    "id": str(row.get("id")),
                    "name": name,
                    "role": row.get("job_title") or "Role",
                    "job_id": row.get("job_id"),
                    "reqId": row.get("job_id") or "#402",
                    "score": f"{score}%",
                    "stage": row.get("stage") or "Analyzed",
                    "stageColor": "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20",
                    "verdict": row.get("verdict") or "Review Match",
                    "verdictColor": "text-emerald-600" if score >= 70 else "text-amber-600",
                    "starred": False,
                    "avatarColor": "bg-indigo-600",
                    "topSkills": matched[:3],
                    "baseScore": score,
                    "statusText": row.get("verdict") or "AI Match Complete",
                    "matchedSkills": matched,
                    "missingSkills": missing,
                    "adjacentSkills": safe_json(row.get("adjacent_skills"), []),
                    "experience": safe_json(row.get("experience"), ["Extracted work experience"]),
                    "education": safe_json(row.get("education"), ["Degree verified"]),
                    "projects": safe_json(row.get("projects"), ["Project portfolio"]),
                    "expYrs": "2+ yrs",
                    "reqExpYrs": "5+ yrs",
                    "location": "Location unavailable",
                    "email": row.get("candidate_email") or "applicant@example.com",
                    "initials": name[:2].upper() if name else "AM",
                    "date": str(row.get("applied_at") or "")[:10] or "Recently",
                    "scores": {"tech": score, "exp": score, "edu": 80, "cultural": 70},
                    "verdictTitle": row.get("verdict") or "Review Match",
                    "strengths": safe_json(row.get("strengths"), ["Core alignment on key skills"]),
                    "risks": safe_json(row.get("risks"), ["Missing adjacent requirements"]),
                    "questions": safe_json(row.get("questions"), [])
                })

    return jsonify({"candidates": candidates})


@app.get("/api/applications/<candidate_id>/resume")
def download_candidate_resume(candidate_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error

    user = USERS[session["user_email"]]
    if user.get("role", "Recruiter") != "Recruiter":
        return _json_error("Only recruiters can download candidate resumes.", 403)

    document = db.collection("applications").document(candidate_id).get()
    if not document.exists:
        matches = db.collection("applications").where("id", "==", candidate_id).limit(1).stream()
        document = next(matches, None)
    if document is None or not document.exists:
        return _json_error("Candidate application not found.", 404)

    application = document.to_dict()
    stored_path = application.get("resume_path")
    if not stored_path:
        return _json_error("No stored resume is available for this candidate.", 404)

    resume_path = (ROOT / stored_path).resolve()
    try:
        resume_path.relative_to(ROOT.resolve())
    except ValueError:
        return _json_error("Stored resume path is invalid.", 400)
    if not resume_path.is_file():
        return _json_error("The stored resume file no longer exists.", 404)

    return send_file(
        resume_path,
        as_attachment=True,
        download_name=application.get("resume_filename") or resume_path.name,
    )

    # Cache results
    APPLICATIONS_CACHE = candidates
    CACHE_TIMESTAMP = current_time

    return jsonify({"candidates": candidates})

def send_interview_email(candidate_name, candidate_email, job_title, interview_date):
    html_body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Interview Scheduled</h2>
        <p>Hi {candidate_name},</p>
        <p>Your interview for <strong>{job_title}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> {interview_date}</p>
        <p>Please be available at the scheduled time.
        Further interview details will be shared by the recruiter.</p>
        <p>Best regards,<br>RMI AI Recruitment Team</p>
    </div>
    """
    return send_email(
        to_email=candidate_email,
        subject=f"Interview Scheduled — {job_title}",
        html_body=html_body,
    )


def send_rejection_email(candidate_name, candidate_email, job_title):
    html_body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Application Update</h2>
        <p>Hi {candidate_name},</p>
        <p>Thank you for your interest in the <strong>{job_title}</strong> position at RMI AI.</p>
        <p>After careful consideration, we have decided not to move forward
        with your application at this time.</p>
        <p>We appreciate the time and effort you invested in the process
        and wish you all the best in your future opportunities.</p>
        <p>Best regards,<br>RMI AI Recruitment Team</p>
    </div>
    """
    return send_email(
        to_email=candidate_email,
        subject=f"Application Update — {job_title}",
        html_body=html_body,
    )

def send_selection_email(candidate_name, candidate_email, job_title):
    html_body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Congratulations! 🎉</h2>

        <p>Hi {candidate_name},</p>

        <p>
            We are pleased to inform you that you have been
            <strong>selected</strong> for the <strong>{job_title}</strong>
            position at RMI AI.
        </p>

        <p>
            Our recruitment team will contact you shortly with the
            next steps.
        </p>

        <p>
            Congratulations once again!
        </p>

        <p>
            Best regards,<br>
            RMI AI Recruitment Team
        </p>
    </div>
    """

    return send_email(
        to_email=candidate_email,
        subject=f"Congratulations! You have been selected — {job_title}",
        html_body=html_body,
    )

@app.post("/api/interviews/schedule")
def schedule_interview():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    user = USERS[session["user_email"]]

    if user.get("role", "Candidate") != "Recruiter":
        return _json_error("Only recruiters can schedule interviews.", 403)

    data = request.get_json(silent=True) or {}

    candidate_id = data.get("candidate_id")
    candidate_name = data.get("candidate_name", "Candidate")
    candidate_email = data.get("candidate_email")
    job_id = data.get("job_id")
    job_title = data.get("job_title", "Interview")
    interview_date = data.get("interview_date")

    if not candidate_id:
        return _json_error("Candidate ID is required.")

    if not interview_date:
        return _json_error("Interview date is required.")

    try:
        candidate_ref = db.collection("applications").document(candidate_id)
        candidate_doc = candidate_ref.get()

        if not candidate_doc.exists:
            return _json_error("Candidate application not found.", 404)

        interview_id = f"interview-{candidate_id}"

        interview_data = {
            "id": interview_id,
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "job_id": job_id,
            "job_title": job_title,
            "interview_date": interview_date,
            "scheduled_by": session["user_email"],
            "scheduled_at": datetime.utcnow().isoformat(),
            "status": "Scheduled",
        }

        db.collection("interviews").document(interview_id).set(interview_data)

        candidate_ref.update({
            "stage": "Interview",
            "interview_id": interview_id,
            "interview_date": interview_date,
        })

        email_status = "sent"

        try:
            send_interview_email(
                candidate_name=candidate_name,
                candidate_email=candidate_email,
                job_title=job_title,
                interview_date=interview_date,
            )
        except Exception:
            app.logger.exception("Interview email failed")
            email_status = "failed"

        return jsonify({
            "message": "Interview scheduled successfully.",
            "email_status": email_status,
            "interview": interview_data,
            "candidate": {
                "id": candidate_id,
                "stage": "Interview",
            },
        }), 201

    except Exception as error:
        app.logger.exception("Interview scheduling failed")
        return _json_error(f"Failed to schedule interview: {error}", 500)
    
@app.post("/api/applications/reject")
def reject_candidate():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    user = USERS[session["user_email"]]

    if user.get("role", "Candidate") != "Recruiter":
        return _json_error("Only recruiters can reject candidates.", 403)

    data = request.get_json(silent=True) or {}

    candidate_id = data.get("candidate_id")
    candidate_name = data.get("candidate_name", "Candidate")
    candidate_email = data.get("candidate_email")
    job_title = data.get("job_title", "Position")

    if not candidate_id:
        return _json_error("Candidate ID is required.")

    try:
        candidate_ref = db.collection("applications").document(candidate_id)
        candidate_doc = candidate_ref.get()

        if not candidate_doc.exists:
            return _json_error("Candidate application not found.", 404)

        candidate_ref.update({
            "stage": "Rejected",
            "rejected_at": datetime.utcnow().isoformat(),
            "rejected_by": session["user_email"],
        })

        email_status = "sent"

        try:
            send_rejection_email(
                candidate_name=candidate_name,
                candidate_email=candidate_email,
                job_title=job_title,
            )
        except Exception:
            app.logger.exception("Rejection email failed")
            email_status = "failed"

        return jsonify({
            "message": "Candidate rejected successfully.",
            "email_status": email_status,
            "candidate": {
                "id": candidate_id,
                "stage": "Rejected",
            },
        }), 200

    except Exception as error:
        app.logger.exception("Candidate rejection failed")
        return _json_error(
            f"Failed to reject candidate: {error}",
            500
        )

@app.post("/api/applications/select")
def select_candidate():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    user = USERS[session["user_email"]]

    if user.get("role", "Candidate") != "Recruiter":
        return _json_error("Only recruiters can select candidates.", 403)

    data = request.get_json(silent=True) or {}

    candidate_id = data.get("candidate_id")
    candidate_name = data.get("candidate_name", "Candidate")
    candidate_email = data.get("candidate_email")
    job_title = data.get("job_title", "Position")

    if not candidate_id:
        return _json_error("Candidate ID is required.")

    try:
        candidate_ref = db.collection("applications").document(candidate_id)
        candidate_doc = candidate_ref.get()

        if not candidate_doc.exists:
            return _json_error("Candidate application not found.", 404)

        candidate_ref.update({
            "stage": "Selected",
            "selected_at": datetime.utcnow().isoformat(),
            "selected_by": session["user_email"],
        })

        email_status = "sent"

        try:
            send_selection_email(
                candidate_name=candidate_name,
                candidate_email=candidate_email,
                job_title=job_title,
            )
        except Exception:
            app.logger.exception("Selection email failed")
            email_status = "failed"

        return jsonify({
            "message": "Candidate selected successfully.",
            "email_status": email_status,
            "candidate": {
                "id": candidate_id,
                "stage": "Selected",
            },
        }), 200

    except Exception as error:
        app.logger.exception("Candidate selection failed")
        return _json_error(
            f"Failed to select candidate: {error}",
            500
        )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)