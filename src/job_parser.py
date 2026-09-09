"""
Job Description Parser
----------------------
Extracts meaningful sections and detects multiple roles
from job descriptions.
"""

import re


# -------------------------------------------------------------------
# SECTION ALIASES
# -------------------------------------------------------------------

JD_SECTION_ALIASES = {
    "responsibilities": [
        "what you will do",
        "what you'll do",
        "responsibilities",
        "responsibility",
        "job responsibilities",
        "role and responsibilities",
        "key responsibilities",
    ],

    "requirements": [
        "who you are",
        "requirements",
        "qualifications",
        "what we're looking for",
        "what we are looking for",
        "candidate requirements",
        "required qualifications",
        "eligibility criteria",
    ],

    "preferred": [
        "preferred qualifications",
        "preferred skills",
        "nice to have",
        "nice-to-have",
        "preferred",
    ],
}


# -------------------------------------------------------------------
# ROLE DETECTION
# -------------------------------------------------------------------

ROLE_PATTERNS = [
    r"^\d+\.\s*(.+)$",
    r"^\d+\)\s*(.+)$",
    r"^role\s*:\s*(.+)$",
    r"^position\s*:\s*(.+)$",
    r"^job\s*title\s*:\s*(.+)$",
]


def normalize_heading(text: str) -> str:
    """Normalize a potential JD section heading."""

    text = text.strip().lower()

    text = re.sub(r"[:\-|]+$", "", text)

    return text.strip()


def identify_jd_section(line: str):
    """Identify whether a line is a known JD section heading."""

    normalized = normalize_heading(line)

    for section, aliases in JD_SECTION_ALIASES.items():

        if normalized in aliases:
            return section

    return None


# -------------------------------------------------------------------
# ROLE IDENTIFICATION
# -------------------------------------------------------------------

def identify_role(line: str):
    """
    Identify whether a line represents a job role.

    Examples:
        1. Data Science Intern
        2. Data Engineer Intern

        Role: Data Scientist

        Position: Machine Learning Engineer
    """

    stripped = line.strip()

    # ---------------------------------------------------------------
    # Numbered role
    # ---------------------------------------------------------------

    match = re.match(
        r"^\d+\.\s*(.+)$",
        stripped,
    )

    if match:

        title = match.group(1).strip()

        # Don't treat numbered sentences as roles.
        # Job titles generally contain role-related keywords.
        role_keywords = [
            "intern",
            "engineer",
            "developer",
            "scientist",
            "analyst",
            "manager",
            "designer",
            "consultant",
            "architect",
            "specialist",
            "administrator",
            "lead",
            "associate",
            "trainee",
        ]

        lowered = title.lower()

        if any(
            keyword in lowered
            for keyword in role_keywords
        ):
            return title

    # ---------------------------------------------------------------
    # Explicit role / position / job title
    # ---------------------------------------------------------------

    explicit_patterns = [
        r"^role\s*:\s*(.+)$",
        r"^position\s*:\s*(.+)$",
        r"^job\s*title\s*:\s*(.+)$",
    ]

    for pattern in explicit_patterns:

        match = re.match(
            pattern,
            stripped,
            flags=re.IGNORECASE,
        )

        if match:
            return match.group(1).strip()

    return None


# -------------------------------------------------------------------
# SECTION EXTRACTION
# -------------------------------------------------------------------

def extract_jd_sections(text: str) -> dict:
    """
    Split a single job description into logical sections.

    Content before the first recognized heading is stored
    as 'description'.
    """

    sections = {
        "description": []
    }

    current_section = "description"

    for line in text.splitlines():

        line = line.strip()

        if not line:
            continue

        detected_section = identify_jd_section(line)

        if detected_section:

            current_section = detected_section

            if current_section not in sections:
                sections[current_section] = []

            continue

        sections[current_section].append(line)

    # Convert lists to strings
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


# -------------------------------------------------------------------
# MULTI-ROLE EXTRACTION
# -------------------------------------------------------------------

def extract_jd_roles(text: str) -> dict:
    """
    Detect and extract multiple job roles from a JD.

    If no multiple roles are detected, the entire document
    is returned as a single role.

    Returns:

        {
            "Data Science Intern": {
                "description": "...",
                "responsibilities": "...",
                "requirements": "..."
            },

            "Data Engineer Intern": {
                ...
            }
        }
    """

    lines = text.splitlines()

    role_positions = []

    for index, line in enumerate(lines):

        role = identify_role(line)

        if role:
            role_positions.append(
                (index, role)
            )

    # ---------------------------------------------------------------
    # No roles detected
    # ---------------------------------------------------------------

    if not role_positions:

        return {
            "Job Role": extract_jd_sections(text)
        }

    # ---------------------------------------------------------------
    # Extract role blocks
    # ---------------------------------------------------------------

    roles = {}

    for i, (start_index, role_name) in enumerate(
        role_positions
    ):

        if i + 1 < len(role_positions):

            end_index = role_positions[i + 1][0]

        else:

            end_index = len(lines)

        role_lines = lines[
            start_index + 1:end_index
        ]

        role_text = "\n".join(
            role_lines
        )

        roles[role_name] = extract_jd_sections(
            role_text
        )

    return roles


# -------------------------------------------------------------------
# HELPER
# -------------------------------------------------------------------

def is_multi_role_jd(text: str) -> bool:
    """
    Determine whether a JD contains multiple identifiable roles.
    """

    lines = text.splitlines()

    roles = []

    for line in lines:

        role = identify_role(line)

        if role:
            roles.append(role)

    return len(roles) > 1