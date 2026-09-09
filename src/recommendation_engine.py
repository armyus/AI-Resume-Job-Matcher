"""
Recommendation Engine
---------------------
Generates an explainable AI-style recommendation
from resume-job matching results.
"""


def generate_ai_recommendation(
    overall_score: float,
    skill_result: dict,
    experience_result: dict,
    education_result: dict,
    project_result: dict,
    semantic_score: float,
) -> dict:
    """
    Generate a structured candidate recommendation.

    Returns:
        dict containing recommendation, strengths, gaps,
        and an explanation.
    """

    # ---------------------------------------------------------------
    # EXTRACT MATCHING RESULTS
    # ---------------------------------------------------------------

    # matching_engine.py uses these keys
    matched_skills = skill_result.get(
        "matched_skills",
        skill_result.get("matched", [])
)

    missing_skills = skill_result.get(
        "missing_skills",
        skill_result.get("missing", [])
)

    candidate_experience = experience_result.get(
        "candidate_years",
        0.0
    )

    required_experience = experience_result.get(
        "required_years",
        0.0
    )

    experience_score = experience_result.get(
        "score",
        0.0
    )

    education_score = education_result.get(
        "score",
        0.0
    )

    project_score = project_result.get(
        "score",
        0.0
    )

    # ---------------------------------------------------------------
    # DETERMINE SUITABILITY
    # ---------------------------------------------------------------

    if (
        experience_score == 0.0
        and required_experience > 0
    ):
        recommendation = "Not Suitable"

    elif education_score == 0.0:
        recommendation = "Not Suitable"

    elif overall_score >= 75:
        recommendation = "Highly Suitable"

    elif overall_score >= 60:
        recommendation = "Suitable"

    elif overall_score >= 45:
        recommendation = "Potentially Suitable"

    else:
        recommendation = "Not Suitable"

    # ---------------------------------------------------------------
    # STRENGTHS
    # ---------------------------------------------------------------

    strengths = []

    if matched_skills:
        strengths.append(
            f"Matches {len(matched_skills)} "
            f"required/relevant skills."
        )

    if experience_score >= 1.0:
        strengths.append(
            "Meets the required experience level."
        )

    if education_score >= 1.0:
        strengths.append(
            "Meets the required educational qualification."
        )

    if project_score >= 0.5:
        strengths.append(
            "Has relevant project experience."
        )

    if semantic_score >= 0.50:
        strengths.append(
            "Shows strong semantic alignment "
            "with the job description."
        )

    elif semantic_score >= 0.35:
        strengths.append(
            "Shows moderate semantic alignment "
            "with the job description."
        )

    # ---------------------------------------------------------------
    # GAPS
    # ---------------------------------------------------------------

    gaps = []

    if missing_skills:
        gaps.append(
            "Missing skills: "
            + ", ".join(missing_skills)
            + "."
        )

    if required_experience > candidate_experience:
        gaps.append(
            f"Experience gap: "
            f"{candidate_experience:.1f} years available "
            f"vs {required_experience:.1f} years required."
        )

    if education_score < 1.0:
        gaps.append(
            "Educational qualification does not "
            "fully match the requirement."
        )

    if semantic_score < 0.35:
        gaps.append(
            "Low semantic similarity between the "
            "resume and job description."
        )

    # ---------------------------------------------------------------
    # IF NO GAPS
    # ---------------------------------------------------------------

    if not gaps:
        gaps.append(
            "No major gaps identified."
        )

    # ---------------------------------------------------------------
    # EXPLANATION
    # ---------------------------------------------------------------

    explanation_parts = [
        f"The candidate achieved an overall match "
        f"score of {overall_score:.2f}%."
    ]

    # Skills
    if matched_skills:
        top_skills = matched_skills[:5]

        explanation_parts.append(
            "The candidate matches skills such as "
            + ", ".join(top_skills)
            + "."
        )

    if missing_skills:
        explanation_parts.append(
            f"However, the candidate is missing "
            f"{len(missing_skills)} identified skills."
        )

    # Experience
    if experience_score >= 1.0:
        explanation_parts.append(
            "The experience requirement is satisfied."
        )

    elif required_experience > 0:
        explanation_parts.append(
            "The minimum experience requirement "
            "is not satisfied."
        )

    # Education
    if education_score >= 1.0:
        explanation_parts.append(
            "The educational requirement is satisfied."
        )

    else:
        explanation_parts.append(
            "The educational requirement is not "
            "fully satisfied."
        )

    # Projects
    if project_score >= 0.5:
        explanation_parts.append(
            "The candidate has projects relevant "
            "to the role."
        )

    else:
        explanation_parts.append(
            "The candidate has limited relevant "
            "project experience."
        )

    # Semantic similarity
    if semantic_score >= 0.50:
        explanation_parts.append(
            "The resume demonstrates strong "
            "semantic similarity to the job description."
        )

    elif semantic_score >= 0.35:
        explanation_parts.append(
            "The resume demonstrates moderate "
            "semantic similarity to the job description."
        )

    else:
        explanation_parts.append(
            "The semantic similarity between the "
            "resume and job description is relatively low."
        )

    explanation = " ".join(
        explanation_parts
    )

    # ---------------------------------------------------------------
    # RETURN STRUCTURED RESULT
    # ---------------------------------------------------------------

    return {
        "recommendation": recommendation,

        "overall_score": round(
            overall_score,
            2
        ),

        "strengths": strengths,

        "gaps": gaps,

        "explanation": explanation,
    }