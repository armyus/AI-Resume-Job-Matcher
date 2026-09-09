"""
Text Preprocessor
-----------------
Cleans extracted resume and job-description text
while preserving information useful for NLP analysis.
"""

import re


def normalize_whitespace(text: str) -> str:
    """
    Normalize spaces, tabs, and excessive blank lines.
    """

    text = text.replace("\t", " ")

    # Replace multiple spaces with a single space
    text = re.sub(r"[ ]{2,}", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def normalize_bullets(text: str) -> str:
    """
    Normalize different bullet characters into a standard bullet.
    """

    bullet_chars = ["•", "●", "○", "▪", "◦", "‣", "⁃"]

    for char in bullet_chars:
        text = text.replace(char, "•")

    return text


def normalize_special_characters(text: str) -> str:
    """
    Normalize common Unicode characters found in PDFs.
    """

    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "-",
        "\u00a0": " ",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    return text


def clean_text(text: str) -> str:
    """
    Apply all text-cleaning operations.
    """

    if not text:
        return ""

    text = normalize_special_characters(text)
    text = normalize_bullets(text)
    text = normalize_whitespace(text)

    return text