from src.document_parser import extract_text
from src.text_preprocessor import clean_text
from src.job_parser import extract_jd_sections
from src.requirement_extractor import extract_requirements


jd_path = "data/Job Description/sample_jd_2.pdf"


# Extract JD
raw_text = extract_text(jd_path)
cleaned_text = clean_text(raw_text)

sections = extract_jd_sections(cleaned_text)


# Extract requirements specifically
requirements_text = sections.get(
    "requirements",
    ""
)

requirements = extract_requirements(
    cleaned_text,
    requirements_text
)


print("=" * 70)
print("JOB REQUIREMENTS")
print("=" * 70)

print("\nRequired Skills:")
for skill in requirements["required_skills"]:
    print(f"✓ {skill}")

print(
    f"\nMinimum Experience: "
    f"{requirements['minimum_experience_years']} years"
)

print(
    f"\nRequired Degree: "
    f"{requirements['required_degree']}"
)

print("\nRequired Fields:")
for field in requirements["required_fields"]:
    print(f"✓ {field}")

print("\nExperience Domains:")
for domain in requirements["experience_domains"]:
    print(f"✓ {domain}")