from src.document_parser import extract_text
from src.text_preprocessor import clean_text
from src.section_extractor import extract_sections
from src.job_parser import extract_jd_sections
from src.skill_extractor import extract_skills
from src.experience_extractor import extract_experience
from src.education_extractor import extract_education
from src.requirement_extractor import extract_requirements
from src.profile_builder import (
    build_candidate_profile,
    build_job_profile,
)
from src.matching_engine import calculate_match


# ================================================================
# FILES
# ================================================================

resume_path = "data/Resumes/RESUME - 2.pdf"
jd_path = "data/Job Description/sample_jd_1.pdf"


# ================================================================
# RESUME
# ================================================================

resume_text = clean_text(
    extract_text(resume_path)
)

resume_sections = extract_sections(
    resume_text
)

resume_skills = extract_skills(
    resume_sections.get("skills", "")
    + "\n"
    + resume_sections.get("projects", "")
    + "\n"
    + resume_sections.get("summary", "")
)

experience = extract_experience(
    resume_sections.get("experience", "")
)

education = extract_education(
    resume_sections.get("education", "")
)


candidate = build_candidate_profile(
    name="Pavan Kalyan",
    summary=resume_sections.get(
        "summary",
        ""
    ),
    skills=resume_skills,
    experience=experience,
    education=education,
    projects=[
        resume_sections.get(
            "projects",
            ""
        )
    ],
    certifications=[
        resume_sections.get(
            "certifications",
            ""
        )
    ],
)


# ================================================================
# JOB DESCRIPTION
# ================================================================

jd_text = clean_text(
    extract_text(jd_path)
)

jd_sections = extract_jd_sections(
    jd_text
)

requirements = extract_requirements(
    jd_text,
    jd_sections.get(
        "requirements",
        ""
    ),
)


job = build_job_profile(
    description=jd_sections.get(
        "description",
        ""
    ),
    responsibilities=jd_sections.get(
        "responsibilities",
        ""
    ),
    required_skills=requirements[
        "required_skills"
    ],
    minimum_experience_years=requirements[
        "minimum_experience_years"
    ],
    experience_domains=requirements[
        "experience_domains"
    ],
    required_degree=requirements[
        "required_degree"
    ],
    required_fields=requirements[
        "required_fields"
    ],
)


# ================================================================
# MATCH
# ================================================================

result = calculate_match(
    candidate,
    job,
)


# ================================================================
# DISPLAY
# ================================================================

print("=" * 70)
print("RESUME → JOB MATCH")
print("=" * 70)


# ================================================================
# OVERALL SCORE
# ================================================================

print(
    f"\nOverall Score: "
    f"{result['overall_score']}%"
)


# ================================================================
# SKILL MATCH
# ================================================================

print("\n" + "-" * 70)
print("SKILL MATCH")
print("-" * 70)

print(
    f"Score: "
    f"{result['skill_match']['score']}%"
)

print(
    "Matched:",
    ", ".join(
        result["skill_match"]["matched_skills"]
    )
)

print(
    "Missing:",
    ", ".join(
        result["skill_match"]["missing_skills"]
    )
)


# ================================================================
# EXPERIENCE
# ================================================================

print("\n" + "-" * 70)
print("EXPERIENCE")
print("-" * 70)

print(
    f"Score: "
    f"{result['experience_match']['score']}%"
)

print(
    f"Candidate experience: "
    f"{result['experience_match']['candidate_years']} years"
)

print(
    f"Required experience: "
    f"{result['experience_match']['required_years']} years"
)


# ================================================================
# EDUCATION
# ================================================================

print("\n" + "-" * 70)
print("EDUCATION")
print("-" * 70)

print(
    f"Score: "
    f"{result['education_match']['score']}%"
)

print(
    "Degree match:",
    result["education_match"]["degree_match"]
)

print(
    "Matched fields:",
    ", ".join(
        result["education_match"]["matched_fields"]
    )
)


# ================================================================
# PROJECTS
# ================================================================

print("\n" + "-" * 70)
print("PROJECTS")
print("-" * 70)

print(
    f"Score: "
    f"{result['project_match']['score']}%"
)

print(
    "Relevant projects:",
    len(
        result["project_match"]["relevant_projects"]
    )
)


# ================================================================
# SEMANTIC SIMILARITY
# ================================================================

print(
    f"Semantic Similarity: "
    f"{result['semantic_similarity']}%"
)


# ================================================================
# AI RECOMMENDATION
# ================================================================

print("\n" + "-" * 70)
print("AI RECOMMENDATION")
print("-" * 70)

recommendation = result["recommendation"]

print(
    f"\nRecommendation: "
    f"{recommendation['recommendation']}"
)

print(
    f"Overall Match Score: "
    f"{recommendation['overall_score']}%"
)


# ================================================================
# STRENGTHS
# ================================================================

print("\nStrengths:")

if recommendation["strengths"]:

    for strength in recommendation["strengths"]:
        print(f"✓ {strength}")

else:

    print("None identified.")


# ================================================================
# GAPS
# ================================================================

print("\nGaps:")

if recommendation["gaps"]:

    for gap in recommendation["gaps"]:
        print(f"✗ {gap}")

else:

    print("No major gaps identified.")


# ================================================================
# EXPLANATION
# ================================================================

print("\nExplanation:")
print(
    recommendation["explanation"]
)