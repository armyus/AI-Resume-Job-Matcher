"""
Experience Extractor
--------------------
Extracts experience-related information from resume text.
"""

import re


EXPERIENCE_PATTERNS = [
    r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience",
    r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+in",
]


def extract_years_of_experience(text: str) -> float:
    """
    Extract the highest explicitly stated number of years
    of professional experience.
    """

    if not text:
        return 0.0

    matches = []

    for pattern in EXPERIENCE_PATTERNS:
        found = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        for value in found:
            try:
                matches.append(float(value))
            except ValueError:
                continue

    return max(matches, default=0.0)


def extract_experience_entries(text: str) -> list[str]:
    """
    Extract lines that appear to describe work experience.
    """

    if not text:
        return []

    entries = []

    lines = text.splitlines()

    experience_keywords = [
        "worked",
        "working",
        "intern",
        "internship",
        "analyst",
        "engineer",
        "developer",
        "manager",
        "consultant",
        "experience",
        "employment",
    ]

    for line in lines:

        line = line.strip()

        if not line:
            continue

        lower_line = line.lower()

        if any(
            keyword in lower_line
            for keyword in experience_keywords
        ):
            entries.append(line)

    return entries


def extract_experience(text: str) -> dict:
    """
    Extract structured experience information.

    Returns:
        Dictionary containing years, entries, and whether
        an experience section was found.
    """

    if not text:
        return {
            "years": 0.0,
            "entries": [],
            "section_found": False,
        }

    return {
        "years": extract_years_of_experience(text),
        "entries": extract_experience_entries(text),
        "section_found": True,
    }