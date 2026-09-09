"""
Education Extractor
-------------------
Extracts structured educational qualifications from resume text.
"""

import re


# -------------------------------------------------------------------
# DEGREE PATTERNS
# -------------------------------------------------------------------

DEGREE_PATTERNS = {
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

    "BBA": [
        r"\bbba\b",
        r"\bbachelor\s+of\s+business\s+administration\b",
    ],

    "B.Com.": [
        r"\bb\.?\s*com\.?\b",
        r"\bbachelor\s+of\s+commerce\b",
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
        r"\bdoctor\s+of\s+philosophy\b",
    ],
}


# -------------------------------------------------------------------
# DEGREE LEVELS
# -------------------------------------------------------------------

DEGREE_LEVELS = {
    "B.Tech": "Bachelor's",
    "B.E.": "Bachelor's",
    "B.Sc.": "Bachelor's",
    "BCA": "Bachelor's",
    "BBA": "Bachelor's",
    "B.Com.": "Bachelor's",

    "M.Tech": "Master's",
    "M.E.": "Master's",
    "M.Sc.": "Master's",
    "MCA": "Master's",
    "MBA": "Master's",

    "PhD": "PhD",
}


# -------------------------------------------------------------------
# FIELD KEYWORDS
# -------------------------------------------------------------------

FIELD_KEYWORDS = {
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

    "business": "Business",
    "commerce": "Commerce",
}


# -------------------------------------------------------------------
# DEGREE EXTRACTION
# -------------------------------------------------------------------

def extract_degrees(text: str) -> list[str]:
    """
    Extract recognized degree types.

    Examples:
        B.Tech
        B.E.
        B.Sc.
        MCA
        M.Tech
        PhD
    """

    if not text:
        return []

    degrees = []

    for degree, patterns in DEGREE_PATTERNS.items():

        for pattern in patterns:

            if re.search(
                pattern,
                text,
                flags=re.IGNORECASE
            ):
                degrees.append(degree)
                break

    return degrees


# -------------------------------------------------------------------
# DEGREE LEVEL EXTRACTION
# -------------------------------------------------------------------

def extract_degree_levels(text: str) -> list[str]:
    """
    Extract degree levels such as Bachelor's, Master's, and PhD.
    """

    degrees = extract_degrees(text)

    levels = []

    for degree in degrees:

        level = DEGREE_LEVELS.get(degree)

        if level and level not in levels:
            levels.append(level)

    return levels


# -------------------------------------------------------------------
# FIELD EXTRACTION
# -------------------------------------------------------------------

def extract_fields(text: str) -> list[str]:
    """
    Extract recognized fields of study.
    """

    if not text:
        return []

    normalized_text = text.lower()

    fields = []

    for keyword, canonical in FIELD_KEYWORDS.items():

        if keyword in normalized_text:

            if canonical not in fields:
                fields.append(canonical)

    return fields


# -------------------------------------------------------------------
# COMPLETE EDUCATION EXTRACTION
# -------------------------------------------------------------------

def extract_education(text: str) -> dict:
    """
    Extract structured education information.

    Returns:
        {
            "degrees": [...],
            "degree_levels": [...],
            "fields": [...]
        }
    """

    degrees = extract_degrees(text)

    return {
        "degrees": degrees,

        "degree_levels": [
            DEGREE_LEVELS[degree]
            for degree in degrees
            if degree in DEGREE_LEVELS
        ],

        "fields": extract_fields(text),
    }