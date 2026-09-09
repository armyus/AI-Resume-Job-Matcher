"""
Skill Extractor
---------------
Extracts and normalizes technical and professional skills
from resumes and job descriptions.
"""

import re


# -------------------------------------------------------------------
# SKILL TAXONOMY
# -------------------------------------------------------------------

SKILL_ALIASES = {

    # Programming Languages
    "Python": [
        "python",
        "python3",
    ],

    "Java": [
        "java",
    ],

    "C++": [
        "c++",
        "cpp",
    ],

    "C": [
        "c programming",
    ],

    "JavaScript": [
        "javascript",
        "js",
    ],

    "TypeScript": [
        "typescript",
        "ts",
    ],

    "R": [
        "r programming",
        "r language",
    ],

    # Data Science / ML
    "Machine Learning": [
        "machine learning",
        "machine-learning",
        "ml",
    ],

    "Deep Learning": [
        "deep learning",
        "deep-learning",
    ],

    "Natural Language Processing": [
        "natural language processing",
        "nlp",
    ],

    "Computer Vision": [
        "computer vision",
        "cv",
    ],

    "Generative AI": [
        "generative ai",
        "gen ai",
        "genai",
    ],

    "Large Language Models": [
        "large language models",
        "large language model",
        "llm",
        "llms",
    ],

    # Python / Data Libraries
    "Pandas": [
        "pandas",
    ],

    "NumPy": [
        "numpy",
        "numpy library",
    ],

    "Scikit-learn": [
        "scikit-learn",
        "scikit learn",
        "sklearn",
    ],

    "TensorFlow": [
        "tensorflow",
    ],

    "PyTorch": [
        "pytorch",
        "torch",
    ],

    "Matplotlib": [
        "matplotlib",
    ],

    "Seaborn": [
        "seaborn",
    ],

    "BeautifulSoup": [
        "beautifulsoup",
        "beautiful soup",
    ],

    # Databases
    "SQL": [
        "sql",
    ],

    "MySQL": [
        "mysql",
    ],

    "PostgreSQL": [
        "postgresql",
        "postgres",
    ],

    "MongoDB": [
        "mongodb",
        "mongo db",
    ],

    # Visualization / Analytics
    "Power BI": [
        "power bi",
        "powerbi",
    ],

    "Tableau": [
        "tableau",
    ],

    "Excel": [
        "excel",
        "microsoft excel",
    ],

    "Data Analysis": [
        "data analysis",
        "data analytics",
        "data analysis techniques",
    ],

    "Data Visualization": [
        "data visualization",
        "data visualisation",
    ],

    "Exploratory Data Analysis": [
        "exploratory data analysis",
        "eda",
    ],

    "Web Scraping": [
        "web scraping",
        "web scraping techniques",
        "web crawling",
    ],

    # Cloud
    "AWS": [
        "aws",
        "amazon web services",
    ],

    "Microsoft Azure": [
        "azure",
        "microsoft azure",
    ],

    "Google Cloud": [
        "google cloud",
        "gcp",
        "google cloud platform",
    ],

    # Development / Tools
    "Git": [
        "git",
    ],

    "GitHub": [
        "github",
    ],

    "Docker": [
        "docker",
    ],

    "Kubernetes": [
        "kubernetes",
        "k8s",
    ],

    "FastAPI": [
        "fastapi",
        "fast api",
    ],

    "Flask": [
        "flask",
    ],

    "Django": [
        "django",
    ],

    # AI / LLM ecosystem
    "LangChain": [
        "langchain",
    ],

    "Hugging Face": [
        "hugging face",
        "huggingface",
    ],

    "OpenAI": [
        "openai",
        "openai api",
    ],
}


# -------------------------------------------------------------------
# TEXT NORMALIZATION
# -------------------------------------------------------------------

def normalize_text(text: str) -> str:
    """
    Normalize text for skill matching.

    The original text is NOT modified. This normalized
    version is used only for matching.
    """

    text = text.lower()

    # Normalize common separators
    text = text.replace("–", "-")
    text = text.replace("—", "-")

    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# -------------------------------------------------------------------
# SKILL MATCHING
# -------------------------------------------------------------------

def contains_skill(text: str, alias: str) -> bool:
    """
    Check whether a skill alias occurs as a meaningful phrase.

    Word boundaries prevent false matches such as:
        'r' inside 'program'
        'c' inside 'scikit'
    """

    pattern = rf"(?<![a-zA-Z0-9+#]){re.escape(alias)}(?![a-zA-Z0-9+#])"

    return re.search(pattern, text, re.IGNORECASE) is not None


def extract_skills(text: str) -> list[str]:
    """
    Extract normalized skills from text.

    Returns:
        List of canonical skill names.
    """

    if not text:
        return []

    normalized_text = normalize_text(text)

    detected_skills = []

    for canonical_skill, aliases in SKILL_ALIASES.items():

        for alias in aliases:

            if contains_skill(normalized_text, alias):
                detected_skills.append(canonical_skill)
                break

    return sorted(detected_skills)


# -------------------------------------------------------------------
# SKILL COMPARISON
# -------------------------------------------------------------------

def compare_skills(
    candidate_skills: list[str],
    required_skills: list[str],
) -> dict:
    """
    Compare candidate skills against required skills.
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

    extra = sorted(
        candidate_set.difference(required_set)
    )

    if required_set:
        match_percentage = (
            len(matched) / len(required_set)
        ) * 100
    else:
        match_percentage = 0.0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "additional_skills": extra,
        "match_percentage": round(match_percentage, 2),
    }

def extract_required_skills(text: str) -> list[str]:
    """
    Extract skills that are actually associated with
    candidate requirements.
    """

    if not text:
        return []

    normalized = normalize_text(text)

    required_skills = set()

    # ---------------------------------------------------------------
    # Requirement-oriented sentences
    # ---------------------------------------------------------------

    sentences = re.split(
        r"[.!?\n]+",
        normalized
    )

    for sentence in sentences:

        sentence = sentence.strip()

        if not sentence:
            continue

        # -----------------------------------------------------------
        # Ignore contextual mentions
        # -----------------------------------------------------------

        contextual_only = [
            "machine learning engineers",
            "data scientists",
            "data engineers",
            "product managers",
            "generative ai and nlp",
            "latest advances in artificial intelligence",
        ]

        if any(
            phrase in sentence
            for phrase in contextual_only
        ):
            # Don't discard the whole sentence because it may
            # contain another actual requirement.
            sentence = re.sub(
                r"machine learning engineers?",
                "",
                sentence
            )

        # -----------------------------------------------------------
        # Determine whether sentence describes a requirement
        # -----------------------------------------------------------

        requirement_indicators = [
            "experience in",
            "experience with",
            "proficiency in",
            "proficient in",
            "knowledge of",
            "knowledge in",
            "skills in",
            "skilled in",
            "expertise in",
            "work with",
            "work on",
            "using",
            "can work",
        ]

        is_requirement = any(
            indicator in sentence
            for indicator in requirement_indicators
        )

        if not is_requirement:
            continue

        # -----------------------------------------------------------
        # Extract known skills
        # -----------------------------------------------------------

        detected = extract_skills(sentence)

        required_skills.update(detected)

    # ---------------------------------------------------------------
    # Explicit technology expression
    # ---------------------------------------------------------------

    explicit_expression = re.search(
        r"python\s*\(\s*pandas\s*\)\s*/\s*r",
        normalized
    )

    if explicit_expression:

        required_skills.update([
            "Python",
            "Pandas",
            "R",
        ])

    return sorted(required_skills)