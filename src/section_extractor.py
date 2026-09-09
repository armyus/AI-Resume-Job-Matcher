"""
Section Extractor
-----------------
Identifies common resume sections from cleaned text.
"""

import re


SECTION_ALIASES = {
    "summary": [
        "objective",
        "summary",
        "professional summary",
        "career objective",
        "profile",
        "about me",
    ],

    "skills": [
        "skills",
        "technical skills",
        "core skills",
        "technical expertise",
        "technologies",
    ],

    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "work history",
        "internship",
        "internships",
    ],

    "education": [
        "education",
        "academic background",
        "educational background",
        "qualifications",
    ],

    "projects": [
        "projects",
        "academic projects",
        "personal projects",
        "key projects",
    ],

    "certifications": [
        "certifications",
        "certificates",
        "licenses & certifications",
    ],

    "achievements": [
        "achievements",
        "accomplishments",
        "awards",
        "honors",
    ],
}


def normalize_heading(text: str) -> str:
    """
    Normalize a potential section heading.
    """

    text = text.strip().lower()

    # Remove common punctuation
    text = re.sub(r"[:\-|]+$", "", text)

    return text.strip()


def identify_section_heading(line: str):
    """
    Determine whether a line represents a known resume section.

    Returns:
        Canonical section name or None.
    """

    normalized = normalize_heading(line)

    for section, aliases in SECTION_ALIASES.items():

        if normalized in aliases:
            return section

    return None


def extract_sections(text: str) -> dict:
    """
    Split resume text into logical sections.

    Returns:
        Dictionary containing extracted sections.
    """

    sections = {}
    current_section = "other"

    sections[current_section] = []

    lines = text.splitlines()

    for line in lines:

        line = line.strip()

        if not line:
            continue

        detected_section = identify_section_heading(line)

        if detected_section:
            current_section = detected_section

            if current_section not in sections:
                sections[current_section] = []

            continue

        sections[current_section].append(line)

    # Convert lists into strings
    for section in sections:
        sections[section] = "\n".join(
            sections[section]
        ).strip()

    # Remove empty sections
    sections = {
        key: value
        for key, value in sections.items()
        if value
    }

    return sections