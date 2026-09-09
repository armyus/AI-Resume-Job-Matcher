from pathlib import Path
from tempfile import TemporaryDirectory
import os
import json

from flask import Flask, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from werkzeug.utils import secure_filename

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
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
JOB_IDS = {"#402": "sample_jd_1.pdf", "#398": "sample_jd_2.pdf"}
MATCH_HISTORY = []
RECRUITER_ROLES = []

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
			})
	available.extend(RECRUITER_ROLES)
	return jsonify({"jobs": available})


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
        return _json_error("Only PDF, DOCX, and TXT resumes are supported.")
    job = next((item for item in _available_job_profiles() if item["id"] == job_id), None)
    if job is None:
        return _json_error(f"Unknown job_id: {job_id}")

    try:
        with TemporaryDirectory() as directory:
            filename = secure_filename(resume.filename)
            resume_path = Path(directory) / filename
            resume.save(resume_path)
            candidate = _build_candidate(resume_path)
        from src.matching_engine import calculate_match

        result = calculate_match(candidate, job["profile"])
        MATCH_HISTORY.append({
            "score": result["overall_score"],
            "job_id": job_id,
            "department": job.get("department", "Unknown"),
            "missing_skills": result.get("skill_match", {}).get("missing_skills", []),
        })
        return jsonify({
            "job_id": job_id,
            "candidate": candidate,
            "job": job["profile"],
            "match": result,
        })
    except (OSError, RuntimeError, ValueError) as error:
        return _json_error(str(error), 422)
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
    jobs.extend(RECRUITER_ROLES)
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
	role_id = f"#{400 + len(RECRUITER_ROLES) + 1}"
	description = data.get("description", title).strip()
	profile = _build_job_profile_from_text(title, description)
	role = {
		"id": role_id,
		"title": title,
		"company": data.get("company", "RMI AI").strip() or "RMI AI",
		"department": data.get("department", "Engineering").strip() or "Engineering",
		"location": data.get("location", "Remote").strip() or "Remote",
		"profile": profile,
	}
	RECRUITER_ROLES.append(role)
	return jsonify({key: value for key, value in role.items() if key != "profile"}), 201


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


@app.get("/api/analytics")
def analytics():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    total_matches = len(MATCH_HISTORY)
    screened_matches = sum(item["score"] >= 60 for item in MATCH_HISTORY)
    missing_skill_counts = {}
    for item in MATCH_HISTORY:
        for skill in item.get("missing_skills", []):
            missing_skill_counts[skill] = missing_skill_counts.get(skill, 0) + 1
    top_skill_gaps = [
        {
            "skill": skill,
            "count": count,
            "percentage": round(count / total_matches * 100, 1) if total_matches else 0,
        }
        for skill, count in sorted(
            missing_skill_counts.items(), key=lambda entry: entry[1], reverse=True
        )[:10]
    ]
    pipeline_conversion = [
        {"stage": "Applications", "count": total_matches, "percentage": 100},
        {"stage": "Screened", "count": screened_matches, "percentage": round(screened_matches / total_matches * 100, 1) if total_matches else 0},
    ]
    score_distribution = []
    for lower, upper in ((0, 40), (41, 55), (56, 70), (71, 85), (86, 100)):
        score_distribution.append({
            "range": f"{lower}-{upper}",
            "count": sum(lower <= item["score"] <= upper for item in MATCH_HISTORY),
        })
    department_totals = {}
    for item in MATCH_HISTORY:
        department = item.get("department", "Unknown")
        department_totals.setdefault(department, []).append(item["score"])
    department_breakdown = [
        {
            "department": department,
            "matches": len(scores),
            "average_score": round(sum(scores) / len(scores), 1),
        }
        for department, scores in department_totals.items()
    ]
    average_score = round(
        sum(item["score"] for item in MATCH_HISTORY) / total_matches,
        1,
    ) if total_matches else 0
    return jsonify({
        "total_applications": total_matches,
        "average_match_score": average_score,
        "screening_pass_rate": round(
            sum(item["score"] >= 60 for item in MATCH_HISTORY) / total_matches * 100,
            1,
        ) if total_matches else 0,
        "roles": len(_available_job_profiles()),
        "pipeline_conversion": pipeline_conversion,
        "top_skill_gaps": top_skill_gaps,
        "score_distribution": score_distribution,
        "department_breakdown": department_breakdown,
        "status": "ready",
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)