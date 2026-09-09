from pathlib import Path

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
# PATHS
# ================================================================

RESUME_DIR = Path("data/Resumes")
JD_DIR = Path("data/Job Description")


# ================================================================
# BUILD CANDIDATE PROFILE
# ================================================================

def build_candidate(resume_path):

    text = clean_text(
        extract_text(str(resume_path))
    )

    sections = extract_sections(text)

    skills = extract_skills(
        sections.get("skills", "")
        + "\n"
        + sections.get("projects", "")
        + "\n"
        + sections.get("summary", "")
    )

    experience = extract_experience(
        sections.get("experience", "")
    )

    education = extract_education(
        sections.get("education", "")
    )

    return build_candidate_profile(
        name=resume_path.stem,
        summary=sections.get("summary", ""),
        skills=skills,
        experience=experience,
        education=education,
        projects=[
            sections.get("projects", "")
        ],
        certifications=[
            sections.get("certifications", "")
        ],
    )


# ================================================================
# BUILD JOB PROFILE
# ================================================================

def build_job(jd_path):

    text = clean_text(
        extract_text(str(jd_path))
    )

    sections = extract_jd_sections(text)

    requirements = extract_requirements(
        text,
        sections.get("requirements", ""),
    )

    return build_job_profile(
        title=jd_path.stem,

        description=sections.get(
            "description",
            ""
        ),

        responsibilities=sections.get(
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
# MAIN
# ================================================================

def main():

    resumes = sorted(
        RESUME_DIR.glob("*.pdf")
    )

    job_descriptions = sorted(
        JD_DIR.glob("*.pdf")
    )

    print("=" * 80)
    print("BATCH RESUME → JOB MATCHING")
    print("=" * 80)

    print(
        f"\nResumes found: {len(resumes)}"
    )

    print(
        f"Job descriptions found: "
        f"{len(job_descriptions)}"
    )

    if not resumes:
        print("\nNo resumes found.")
        return

    if not job_descriptions:
        print("\nNo job descriptions found.")
        return

    # ------------------------------------------------------------
    # Build profiles once
    # ------------------------------------------------------------

    print("\nBuilding candidate profiles...")

    candidates = []

    for resume in resumes:

        try:

            profile = build_candidate(
                resume
            )

            candidates.append(
                (
                    resume.stem,
                    profile
                )
            )

            print(
                f"✓ {resume.name}"
            )

        except Exception as e:

            print(
                f"✗ {resume.name}: {e}"
            )

    print("\nBuilding job profiles...")

    jobs = []

    for jd in job_descriptions:

        try:

            profile = build_job(jd)

            jobs.append(
                (
                    jd.stem,
                    profile
                )
            )

            print(
                f"✓ {jd.name}"
            )

        except Exception as e:

            print(
                f"✗ {jd.name}: {e}"
            )

    # ------------------------------------------------------------
    # Match every resume against every JD
    # ------------------------------------------------------------

    print("\n")
    print("=" * 80)
    print("MATCH RESULTS")
    print("=" * 80)

    results = []

    for resume_name, candidate in candidates:

        for jd_name, job in jobs:

            try:

                result = calculate_match(
                    candidate,
                    job,
                )

                results.append({
                    "resume": resume_name,
                    "job": jd_name,
                    "score": result[
                        "overall_score"
                    ],
                    "skill_score": result[
                        "skill_match"
                    ]["score"],
                    "experience_score": result[
                        "experience_match"
                    ]["score"],
                    "education_score": result[
                        "education_match"
                    ]["score"],
                    "project_score": result[
                        "project_match"
                    ]["score"],
                    "semantic_score": result[
                        "semantic_similarity"
                    ],
                    "recommendation": result[
                        "recommendation"
                    ],
                })

                print(
                    f"\n{resume_name}"
                    f"  →  {jd_name}"
                )

                print(
                    f"Overall: "
                    f"{result['overall_score']}%"
                )

                print(
                    f"Skills: "
                    f"{result['skill_match']['score']}%"
                )

                print(
                    f"Experience: "
                    f"{result['experience_match']['score']}%"
                )

                print(
                    f"Education: "
                    f"{result['education_match']['score']}%"
                )

                print(
                    f"Projects: "
                    f"{result['project_match']['score']}%"
                )

                print(
                    f"Semantic: "
                    f"{result['semantic_similarity']}%"
                )

                print(
                    f"Recommendation: "
                    f"{result['recommendation']}"
                )

            except Exception as e:

                print(
                    f"\n✗ Error matching "
                    f"{resume_name} → {jd_name}"
                )

                print(e)

    # ------------------------------------------------------------
    # Ranking
    # ------------------------------------------------------------

    print("\n")
    print("=" * 80)
    print("OVERALL RANKING")
    print("=" * 80)

    results.sort(
        key=lambda x: x["score"],
        reverse=True,
    )

    for index, result in enumerate(
        results,
        start=1
    ):

        print(
            f"{index:02d}. "
            f"{result['resume']} "
            f"→ "
            f"{result['job']} "
            f"| "
            f"{result['score']}%"
        )

    print("\n")
    print("=" * 80)
    print(
        f"Total comparisons: "
        f"{len(results)}"
    )
    print("=" * 80)


if __name__ == "__main__":
    main()