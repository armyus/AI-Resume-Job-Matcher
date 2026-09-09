"""
Profile Builder
---------------
Creates structured candidate and job profiles from
the outputs of our extraction pipeline.
"""


def build_candidate_profile(
    name: str = "",
    summary: str = "",
    skills: list[str] | None = None,
    experience: list[str] | None = None,
    education: list[str] | None = None,
    projects: list[str] | None = None,
    certifications: list[str] | None = None,
) -> dict:
    """
    Build a standardized candidate profile.
    """

    return {
        "name": name,
        "summary": summary,
        "skills": skills or [],
        "experience": experience or [],
        "education": education or [],
        "projects": projects or [],
        "certifications": certifications or [],
    }


def build_job_profile(
    title: str = "",
    description: str = "",
    responsibilities: str = "",
    required_skills: list[str] | None = None,
    preferred_skills: list[str] | None = None,
    minimum_experience_years: float = 0.0,
    experience_domains: list[str] | None = None,
    required_degree: str | None = None,
    required_degrees: list[str] | None = None,
    required_fields: list[str] | None = None,
) -> dict:
    """
    Build a standardized job profile.
    """

    return {
        "title": title,
        "description": description,
        "responsibilities": responsibilities,
        "required_skills": required_skills or [],
        "preferred_skills": preferred_skills or [],
        "minimum_experience_years": minimum_experience_years,
        "experience_domains": experience_domains or [],
        "required_degree": required_degree,
        "required_degrees": required_degrees or [],
        "required_fields": required_fields or [],
    }