"""
Job Requirement Extractor
-------------------------
Extracts structured requirements from job descriptions.
"""

import re

from src.skill_extractor import extract_required_skills


# -------------------------------------------------------------------
# NUMBER NORMALIZATION
# -------------------------------------------------------------------

NUMBER_WORDS = {
    "one": 1.0,
    "two": 2.0,
    "three": 3.0,
    "four": 4.0,
    "five": 5.0,
    "six": 6.0,
    "seven": 7.0,
    "eight": 8.0,
    "nine": 9.0,
    "ten": 10.0,
}


# -------------------------------------------------------------------
# EXPERIENCE
# -------------------------------------------------------------------

def extract_required_years(text: str) -> float:
    """
    Extract minimum years of required experience.

    Handles:
        at least 1 year
        at least one year
        minimum of 2 years
        2+ years of experience
        two years of experience

    Explicitly handles:
        no prior experience required
        no experience required
        freshers
    """

    if not text:
        return 0.0

    normalized = text.lower()

    # ---------------------------------------------------------------
    # Explicit zero-experience statements
    # ---------------------------------------------------------------

    zero_experience_patterns = [
        r"no\s+(?:prior\s+)?experience\s+required",
        r"no\s+(?:prior\s+)?experience\s+is\s+required",
        r"without\s+(?:prior\s+)?experience",
        r"no\s+previous\s+experience",
        r"freshers?\s+(?:can|may|are)\s+apply",
    ]

    for pattern in zero_experience_patterns:
        if re.search(pattern, normalized):
            return 0.0

    # ---------------------------------------------------------------
    # Numeric / word-based experience
    # ---------------------------------------------------------------

    patterns = [
        # at least 1 year
        r"at least\s+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)",

        # at least one year
        r"at least\s+("
        + "|".join(NUMBER_WORDS.keys())
        + r")\s*(?:years?|yrs?)",

        # minimum of 2 years
        r"minimum\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:years?|yrs?)",

        # minimum of two years
        r"minimum\s+(?:of\s+)?("
        + "|".join(NUMBER_WORDS.keys())
        + r")\s*(?:years?|yrs?)",

        # 2+ years of experience
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)"
        r"\s+of\s+experience",

        # two years of experience
        r"("
        + "|".join(NUMBER_WORDS.keys())
        + r")\s*(?:years?|yrs?)"
        r"\s+of\s+experience",
    ]

    values = []

    for pattern in patterns:

        matches = re.findall(
            pattern,
            normalized,
            flags=re.IGNORECASE,
        )

        for value in matches:

            try:

                if value in NUMBER_WORDS:
                    values.append(NUMBER_WORDS[value])
                else:
                    values.append(float(value))

            except (ValueError, KeyError):
                continue

    return max(values, default=0.0)


# -------------------------------------------------------------------
# EDUCATION
# -------------------------------------------------------------------

EDUCATION_FIELDS = {
    "computer science": "Computer Science",
    "information technology": "Information Technology",
    "software engineering": "Software Engineering",
    "data science": "Data Science",
    "artificial intelligence": "Artificial Intelligence",
    "machine learning": "Machine Learning",
    "mechanical engineering": "Mechanical Engineering",
    "automotive engineering": "Automotive Engineering",
    "production engineering": "Production Engineering",
    "manufacturing engineering": "Manufacturing Engineering",
    "electrical engineering": "Electrical Engineering",
    "electronics engineering": "Electronics Engineering",
    "civil engineering": "Civil Engineering",
    "physics": "Physics",
    "mathematics": "Mathematics",
    "statistics": "Statistics",
}


# -------------------------------------------------------------------
# SPECIFIC DEGREE TYPES
# -------------------------------------------------------------------

REQUIRED_DEGREE_PATTERNS = {
    "B.Tech": [
        r"\bb\.?\s*tech\.?\b",
        r"\bbachelor\s+of\s+technology\b",
    ],

    "B.E.": [
        r"\bb\.?\s*e\.?\b",
        r"\bbachelor\s+of\s+engineering\b",
    ],

    "B.Sc.": [
        r"\bb\.?\s*sc\.?\b",
        r"\bbachelor\s+of\s+science\b",
    ],

    "BCA": [
        r"\bbca\b",
        r"\bbachelor\s+of\s+computer\s+applications\b",
    ],

    "B.Com.": [
        r"\bb\.?\s*com\.?\b",
        r"\bbachelor\s+of\s+commerce\b",
    ],

    "BBA": [
        r"\bbba\b",
        r"\bbachelor\s+of\s+business\s+administration\b",
    ],

    "M.Tech": [
        r"\bm\.?\s*tech\.?\b",
        r"\bmaster\s+of\s+technology\b",
    ],

    "M.E.": [
        r"\bm\.?\s*e\.?\b",
        r"\bmaster\s+of\s+engineering\b",
    ],

    "M.Sc.": [
        r"\bm\.?\s*sc\.?\b",
        r"\bmaster\s+of\s+science\b",
    ],

    "MCA": [
        r"\bmca\b",
        r"\bmaster\s+of\s+computer\s+applications\b",
    ],

    "MBA": [
        r"\bmba\b",
        r"\bmaster\s+of\s+business\s+administration\b",
    ],

    "PhD": [
        r"\bph\.?\s*d\.?\b",
        r"\bdoctorate\b",
        r"\bdoctor\s+of\s+philosophy\b",
    ],
}


DEGREE_LEVELS = {
    "B.Tech": "Bachelor's",
    "B.E.": "Bachelor's",
    "B.Sc.": "Bachelor's",
    "BCA": "Bachelor's",
    "B.Com.": "Bachelor's",
    "BBA": "Bachelor's",

    "M.Tech": "Master's",
    "M.E.": "Master's",
    "M.Sc.": "Master's",
    "MCA": "Master's",
    "MBA": "Master's",

    "PhD": "PhD",
}


def extract_required_degree_types(text: str) -> list[str]:
    """
    Extract specific degree types required by the JD.

    Examples:
        B.Tech, BE
        B.Tech or B.E.
        Bachelor of Technology
        Bachelor's degree
    """

    if not text:
        return []

    degrees = []

    for degree, patterns in REQUIRED_DEGREE_PATTERNS.items():

        for pattern in patterns:

            if re.search(
                pattern,
                text,
                flags=re.IGNORECASE,
            ):
                degrees.append(degree)
                break

    return degrees


def extract_required_degree(text: str) -> str | None:
    """
    Extract the required education level.

    Examples:
        Bachelor's
        Master's
        PhD
    """

    if not text:
        return None

    normalized = text.lower()

    # ---------------------------------------------------------------
    # Bachelor's
    # ---------------------------------------------------------------

    if re.search(
        r"\bbachelor'?s?\b"
        r"|\bbachelor\s+degree\b"
        r"|\bbachelor\s+of\s+",
        normalized,
    ):
        return "Bachelor's"

    if re.search(
        r"\bb\.?\s*tech\.?\b"
        r"|\bb\.?\s*e\.?\b"
        r"|\bb\.?\s*sc\.?\b"
        r"|\bbca\b"
        r"|\bbba\b"
        r"|\bb\.?\s*com\.?\b",
        normalized,
    ):
        return "Bachelor's"

    # ---------------------------------------------------------------
    # Master's
    # ---------------------------------------------------------------

    if re.search(
        r"\bmaster'?s?\b"
        r"|\bmaster\s+degree\b"
        r"|\bmaster\s+of\s+",
        normalized,
    ):
        return "Master's"

    if re.search(
        r"\bm\.?\s*tech\.?\b"
        r"|\bm\.?\s*e\.?\b"
        r"|\bm\.?\s*sc\.?\b"
        r"|\bmca\b"
        r"|\bmba\b",
        normalized,
    ):
        return "Master's"

    # ---------------------------------------------------------------
    # PhD
    # ---------------------------------------------------------------

    if re.search(
        r"\bph\.?\s*d\.?\b"
        r"|\bdoctorate\b"
        r"|\bdoctor\s+of\s+philosophy\b",
        normalized,
    ):
        return "PhD"

    return None


def extract_required_fields(text: str) -> list[str]:
    """
    Extract fields of study.

    Handles:

        Mechanical/Automotive/Production/Manufacturing engineering
        Computer Science
        Data Science
        etc.
    """

    if not text:
        return []

    normalized = text.lower()

    fields = []

    engineering_fields = {
        "mechanical": "Mechanical Engineering",
        "automotive": "Automotive Engineering",
        "production": "Production Engineering",
        "manufacturing": "Manufacturing Engineering",
    }

    if "engineering" in normalized:

        for keyword, canonical in engineering_fields.items():

            if keyword in normalized:

                if canonical not in fields:
                    fields.append(canonical)

    for field, canonical in EDUCATION_FIELDS.items():

        if field in normalized and canonical not in fields:
            fields.append(canonical)

    return fields


# -------------------------------------------------------------------
# EXPERIENCE DOMAIN
# -------------------------------------------------------------------

EXPERIENCE_DOMAINS = {
    "manufacturing": "Manufacturing",
    "aerospace": "Aerospace",
    "healthcare": "Healthcare",
    "finance": "Finance",
    "banking": "Banking",
    "retail": "Retail",
    "e-commerce": "E-commerce",
    "education": "Education",
    "telecommunications": "Telecommunications",
    "automotive": "Automotive",
}


def extract_experience_domains(text: str) -> list[str]:
    """
    Extract industries associated with experience requirements.
    """

    if not text:
        return []

    normalized = text.lower()

    domains = []

    for domain, canonical in EXPERIENCE_DOMAINS.items():

        patterns = [
            rf"experience\s+in\s+(?:a\s+|the\s+)?{re.escape(domain)}",
            rf"experience\s+within\s+(?:the\s+)?{re.escape(domain)}",
            rf"experience\s+working\s+in\s+(?:the\s+)?{re.escape(domain)}",
            rf"{re.escape(domain)}\s+(?:company|industry|experience)",
        ]

        if any(
            re.search(pattern, normalized)
            for pattern in patterns
        ):

            if canonical not in domains:
                domains.append(canonical)

    return domains


# -------------------------------------------------------------------
# COMPLETE REQUIREMENT EXTRACTION
# -------------------------------------------------------------------

def extract_requirements(
    job_description: str,
    required_section: str = "",
) -> dict:
    """
    Extract structured requirements from job descriptions.

    Returns:

        {
            "required_skills": [...],
            "minimum_experience_years": 1.0,
            "required_degree": "Bachelor's",
            "required_degrees": ["B.Tech", "B.E."],
            "required_fields": [...],
            "experience_domains": [...]
        }
    """

    if not job_description:
        job_description = ""

    # ---------------------------------------------------------------
    # SOURCE TEXT
    # ---------------------------------------------------------------

    # Use the complete JD because requirements can appear under:
    #
    #   Responsibilities
    #   Skills
    #   Eligibility Criteria
    #   Role Overview
    #
    source_text = job_description

    requirement_text = required_section or job_description

    # ---------------------------------------------------------------
    # EDUCATION
    # ---------------------------------------------------------------

    education_text = ""

    education_pattern = re.search(
        r"(?:bachelor'?s?|master'?s?|qualification|degree)"
        r".{0,500}?"
        r"(?=\n[A-Z][A-Za-z ]{2,40}\n|\Z)",
        source_text,
        flags=re.IGNORECASE | re.DOTALL,
    )

    if education_pattern:
        education_text = education_pattern.group(0)

    # If the JD has a simple "Qualification: B.Tech, BE"
    # line, capture it explicitly too.
    qualification_matches = re.findall(
        r"(?:qualification|qualifications)"
        r"\s*[:\-]?\s*([^\n]+)",
        source_text,
        flags=re.IGNORECASE,
    )

    if qualification_matches:
        education_text += "\n" + "\n".join(
            qualification_matches
        )

    # ---------------------------------------------------------------
    # EXPERIENCE
    # ---------------------------------------------------------------

    experience_matches = re.findall(
        r".{0,150}"
        r"(?:experience|years?|freshers?|graduates?)"
        r".{0,250}",
        source_text,
        flags=re.IGNORECASE,
    )

    experience_text = "\n".join(
        experience_matches
    )

    # ---------------------------------------------------------------
    # SKILLS
    # ---------------------------------------------------------------

    required_skills = extract_required_skills(job_description)

    # ---------------------------------------------------------------
    # STRUCTURED REQUIREMENTS
    # ---------------------------------------------------------------

    minimum_experience = extract_required_years(
        experience_text
    )

    required_degree = extract_required_degree(
        education_text
    )

    required_degrees = extract_required_degree_types(
        education_text
    )

    required_fields = extract_required_fields(
        education_text
    )

    experience_domains = extract_experience_domains(
        experience_text
    )

    # ---------------------------------------------------------------
    # FINAL RESULT
    # ---------------------------------------------------------------

    return {
        "required_skills": required_skills,

        "minimum_experience_years": (
            minimum_experience
        ),

        "required_degree": required_degree,

        "required_degrees": required_degrees,

        "required_fields": required_fields,

        "experience_domains": experience_domains,
    }