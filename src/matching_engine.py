"""
Matching Engine
---------------
Compares a candidate profile against a job profile.

The engine produces:
- Skill match
- Experience match
- Education match
- Project relevance
- Overall score
- Matched skills
- Missing skills
- Recommendation
"""

from src.recommendation_engine import generate_ai_recommendation
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load the embedding model once.
# All resumes and JDs reuse the same model.
MODEL = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# -------------------------------------------------------------------
# WEIGHTS
# -------------------------------------------------------------------

WEIGHTS = {
    "skills": 0.35,
    "experience": 0.25,
    "education": 0.20,
    "projects": 0.10,
    "semantic": 0.10,
}


# -------------------------------------------------------------------
# SKILL MATCHING
# -------------------------------------------------------------------

def calculate_skill_match(
    candidate_skills: list[str],
    required_skills: list[str],
) -> dict:
    """
    Calculate explicit skill overlap.
    """

    candidate_set = {
        skill.lower()
        for skill in candidate_skills
    }

    required_set = {
        skill.lower()
        for skill in required_skills
    }

    matched = sorted(
        candidate_set.intersection(required_set)
    )

    missing = sorted(
        required_set.difference(candidate_set)
    )

    if required_set:
        score = (
            len(matched) /
            len(required_set)
        ) * 100
    else:
        score = 0.0

    return {
        "score": round(score, 2),
        "matched_skills": matched,
        "missing_skills": missing,
    }


# -------------------------------------------------------------------
# EXPERIENCE MATCHING
# -------------------------------------------------------------------

def calculate_experience_match(
    candidate_experience: dict,
    required_years: float,
    required_domains: list[str],
) -> dict:
    """
    Calculate experience suitability.
    """

    candidate_years = candidate_experience.get(
        "years",
        0.0
    )

    # ---------------------------------------------------------------
    # Years score
    # ---------------------------------------------------------------

    if required_years <= 0:
        years_score = 100.0

    elif candidate_years >= required_years:
        years_score = 100.0

    else:
        years_score = (
            candidate_years /
            required_years
        ) * 100

    # ---------------------------------------------------------------
    # Domain score
    # ---------------------------------------------------------------

    candidate_text = " ".join(
        candidate_experience.get(
            "entries",
            []
        )
    ).lower()

    domains = [
        domain.lower()
        for domain in required_domains
    ]

    matched_domains = [
        domain
        for domain in domains
        if domain in candidate_text
    ]

    if not domains:
        domain_score = 100.0

    elif matched_domains:
        domain_score = (
            len(matched_domains) /
            len(domains)
        ) * 100

    else:
        domain_score = 0.0

    # ---------------------------------------------------------------
    # Combined experience score
    # ---------------------------------------------------------------

    score = (
        years_score * 0.6
        + domain_score * 0.4
    )

    return {
        "score": round(score, 2),
        "candidate_years": candidate_years,
        "required_years": required_years,
        "matched_domains": matched_domains,
        "required_domains": required_domains,
    }


# -------------------------------------------------------------------
# EDUCATION MATCHING
# -------------------------------------------------------------------

def calculate_education_match(
    candidate_education: dict,
    required_degree: str | None,
    required_degrees: list[str],
    required_fields: list[str],
) -> dict:
    """
    Compare candidate education against job requirements.

    Checks:
    1. Degree level
    2. Specific degree type, when explicitly required
    3. Field of study, when explicitly required
    """

    candidate_degrees = {
        degree.lower().strip()
        for degree in candidate_education.get(
            "degrees",
            []
        )
    }

    candidate_fields = {
        field.lower().strip()
        for field in candidate_education.get(
            "fields",
            []
        )
    }

    # ---------------------------------------------------------------
    # DEGREE LEVEL
    # ---------------------------------------------------------------

    if not required_degree:
        degree_level_score = 100.0

    else:

        bachelor_degrees = {
            "b.sc.",
            "b.tech",
            "b.e.",
            "bca",
        }

        master_degrees = {
            "m.sc.",
            "m.tech",
            "m.e.",
            "mca",
        }

        if required_degree.lower() == "bachelor's":

            degree_level_score = (
                100.0
                if candidate_degrees.intersection(
                    bachelor_degrees
                )
                else 0.0
            )

        elif required_degree.lower() == "master's":

            degree_level_score = (
                100.0
                if candidate_degrees.intersection(
                    master_degrees
                )
                else 0.0
            )

        elif required_degree.lower() == "phd":

            degree_level_score = (
                100.0
                if "phd" in candidate_degrees
                else 0.0
            )

        else:
            degree_level_score = 0.0

    # ---------------------------------------------------------------
    # SPECIFIC DEGREE
    # ---------------------------------------------------------------

    if not required_degrees:

        specific_degree_score = 100.0
        specific_degree_match = True

    else:

        normalized_required_degrees = {
            degree.lower().strip()
            for degree in required_degrees
        }

        matched_degrees = sorted(
            candidate_degrees.intersection(
                normalized_required_degrees
            )
        )

        specific_degree_match = bool(
            matched_degrees
        )

        specific_degree_score = (
            100.0
            if specific_degree_match
            else 0.0
        )

    # ---------------------------------------------------------------
    # FIELD
    # ---------------------------------------------------------------

    required_field_set = {
        field.lower().strip()
        for field in required_fields
    }

    matched_fields = sorted(
        candidate_fields.intersection(
            required_field_set
        )
    )

    if not required_field_set:

        field_score = 100.0

    else:

        field_score = (
            len(matched_fields)
            / len(required_field_set)
        ) * 100

    # ---------------------------------------------------------------
    # COMBINED EDUCATION SCORE
    # ---------------------------------------------------------------

    score = (
        degree_level_score * 0.30
        + specific_degree_score * 0.30
        + field_score * 0.40
    )

    # ---------------------------------------------------------------
    # DEGREE MATCH
    # ---------------------------------------------------------------

    degree_match = (
        degree_level_score == 100.0
        and specific_degree_match
    )

    return {
        "score": round(score, 2),

        "degree_match": degree_match,

        "degree_level_match": (
            degree_level_score == 100.0
        ),

        "specific_degree_match": (
            specific_degree_match
        ),

        "matched_degrees": (
            matched_degrees
            if required_degrees
            else []
        ),

        "matched_fields": matched_fields,

        "required_degrees": required_degrees,

        "required_fields": required_fields,
    }


# -------------------------------------------------------------------
# PROJECT MATCHING
# -------------------------------------------------------------------

def calculate_project_match(
    projects: list[str],
    job_text: str,
) -> dict:
    """
    Placeholder project relevance score.

    Semantic project matching will replace this later.
    """

    if not projects:
        return {
            "score": 0.0,
            "relevant_projects": [],
        }

    # Basic keyword overlap for the first version.
    job_words = set(
        job_text.lower().split()
    )

    relevant_projects = []

    for project in projects:

        project_words = set(
            project.lower().split()
        )

        overlap = job_words.intersection(
            project_words
        )

        if len(overlap) >= 3:
            relevant_projects.append(project)

    if relevant_projects:
        score = 100.0
    else:
        score = 0.0

    return {
        "score": score,
        "relevant_projects": relevant_projects,
    }


# -------------------------------------------------------------------
# SEMANTIC MATCHING
# -------------------------------------------------------------------

def calculate_semantic_similarity(
    candidate_text: str,
    job_text: str,
) -> float:
    """
    Calculate semantic similarity between candidate content
    and job description using Sentence Transformers.

    Returns:
        Similarity score from 0 to 100.
    """

    if not candidate_text or not job_text:
        return 0.0

    # Generate embeddings
    candidate_embedding = MODEL.encode(
        [candidate_text],
        normalize_embeddings=True,
    )

    job_embedding = MODEL.encode(
        [job_text],
        normalize_embeddings=True,
    )

    # Cosine similarity
    similarity = cosine_similarity(
        candidate_embedding,
        job_embedding,
    )[0][0]

    # Convert 0-1 similarity to percentage
    score = max(0.0, min(1.0, float(similarity))) * 100

    return round(score, 2)


# -------------------------------------------------------------------
# RECOMMENDATION
# -------------------------------------------------------------------

def generate_recommendation(
    overall_score: float,
    skill_result: dict,
    experience_result: dict,
    education_result: dict,
    project_result: dict,
    semantic_score: float,
) -> str:
    """
    Generate a detailed candidate recommendation
    based on all matching dimensions.
    """

    matched_skills = skill_result.get(
    "matched_skills",
    []
)
    missing_skills = skill_result.get(
    "missing_skills",
    []
)

    experience_score = experience_result.get("score", 0.0)
    education_score = education_result.get("score", 0.0)
    project_score = project_result.get("score", 0.0)

    # ---------------------------------------------------------------
    # HARD REQUIREMENT CHECKS
    # ---------------------------------------------------------------

    if experience_score == 0.0:
        required = experience_result.get("required_years", 0.0)
        candidate = experience_result.get("candidate_years", 0.0)

        return (
            f"Not suitable: candidate has {candidate:.1f} years of "
            f"experience, while the role requires at least "
            f"{required:.1f} years."
        )

    if education_score == 0.0:
        return (
            "Not suitable: the candidate does not meet the "
            "required educational qualifications."
        )

    # ---------------------------------------------------------------
    # SCORE-BASED RECOMMENDATION
    # ---------------------------------------------------------------

    if overall_score >= 75:
        recommendation = "Highly suitable for the position."

    elif overall_score >= 60:
        recommendation = "Suitable for the position."

    elif overall_score >= 45:
        recommendation = (
            "Potentially suitable; further review recommended."
        )

    else:
        recommendation = (
            "Not suitable: significant gaps exist between "
            "the candidate profile and job requirements."
        )

    # ---------------------------------------------------------------
    # BUILD EXPLANATION
    # ---------------------------------------------------------------

    details = []

    if matched_skills:
        skill_text = ", ".join(matched_skills[:6])

        if len(matched_skills) > 6:
            skill_text += ", and others"

        details.append(
            f"Matched skills include {skill_text}."
        )

    if missing_skills:
        missing_text = ", ".join(missing_skills[:6])

        if len(missing_skills) > 6:
            missing_text += ", and others"

        details.append(
            f"Skill gaps include {missing_text}."
        )

    if experience_score >= 1.0:
        details.append(
            "The candidate meets the experience requirement."
        )

    if education_score >= 1.0:
        details.append(
            "The candidate meets the educational requirement."
        )

    if project_score >= 0.5:
        details.append(
            "The candidate has relevant project experience."
        )

    if semantic_score >= 0.5:
        details.append(
            "The resume shows good semantic alignment with the job description."
        )
    elif semantic_score >= 0.3:
        details.append(
            "The resume shows moderate semantic alignment with the job description."
        )
    else:
        details.append(
            "The semantic similarity with the job description is relatively low."
        )

    if details:
        return recommendation + " " + " ".join(details)

    return recommendation


# -------------------------------------------------------------------
# COMPLETE MATCHING
# -------------------------------------------------------------------

def calculate_match(
    candidate_profile: dict,
    job_profile: dict,
) -> dict:
    """
    Calculate complete candidate-job matching score.
    """

    # ---------------------------------------------------------------
    # Skill matching
    # ---------------------------------------------------------------

    skill_result = calculate_skill_match(
        candidate_profile.get("skills", []),
        job_profile.get("required_skills", []),
    )

    # ---------------------------------------------------------------
    # Experience matching
    # ---------------------------------------------------------------

    experience_result = calculate_experience_match(
        candidate_profile.get(
            "experience",
            {}
        ),
        job_profile.get(
            "minimum_experience_years",
            0.0
        ),
        job_profile.get(
            "experience_domains",
            []
        ),
    )

    # ---------------------------------------------------------------
    # Education matching
    # ---------------------------------------------------------------

    education_result = calculate_education_match(
    candidate_profile.get(
        "education",
        {}
    ),
    job_profile.get(
        "required_degree"
    ),
    job_profile.get(
        "required_degrees",
        []
    ),
    job_profile.get(
        "required_fields",
        []
    ),
)

    # ---------------------------------------------------------------
    # Project matching
    # ---------------------------------------------------------------

    project_result = calculate_project_match(
        candidate_profile.get(
            "projects",
            []
        ),
        job_profile.get(
            "description",
            ""
        ),
    )

    # ---------------------------------------------------------------
    # Semantic similarity
    # ---------------------------------------------------------------

    candidate_semantic_text = " ".join([
        candidate_profile.get(
            "summary",
            ""
        ),

        " ".join(
            candidate_profile.get(
                "skills",
                []
            )
        ),

        " ".join(
            candidate_profile.get(
                "projects",
                []
            )
        ),
    ])

    job_semantic_text = " ".join([
        job_profile.get(
            "description",
            ""
        ),

        job_profile.get(
            "responsibilities",
            ""
        ),

        " ".join(
            job_profile.get(
                "required_skills",
                []
            )
        ),
    ])

    semantic_score = calculate_semantic_similarity(
        candidate_semantic_text,
        job_semantic_text,
    )

    # ---------------------------------------------------------------
    # Overall score
    # ---------------------------------------------------------------

    overall_score = (
        skill_result["score"]
        * WEIGHTS["skills"]

        + experience_result["score"]
        * WEIGHTS["experience"]

        + education_result["score"]
        * WEIGHTS["education"]

        + project_result["score"]
        * WEIGHTS["projects"]

        + semantic_score
        * WEIGHTS["semantic"]
    )

    overall_score = round(
        overall_score,
        2
    )

    # ---------------------------------------------------------------
    # Recommendation
    # ---------------------------------------------------------------

    recommendation = generate_ai_recommendation(
    overall_score=overall_score,
    skill_result=skill_result,
    experience_result=experience_result,
    education_result=education_result,
    project_result=project_result,
    semantic_score=semantic_score,
)

    # ---------------------------------------------------------------
    # Final result
    # ---------------------------------------------------------------

    return {
        "overall_score": overall_score,

        "skill_match": skill_result,

        "experience_match": experience_result,

        "education_match": education_result,

        "project_match": project_result,

        "semantic_similarity": semantic_score,

        "recommendation": recommendation,
    }