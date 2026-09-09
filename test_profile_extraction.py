from src.document_parser import extract_text
from src.text_preprocessor import clean_text
from src.section_extractor import extract_sections
from src.experience_extractor import extract_experience
from src.education_extractor import extract_education


resume_path = "data/Resumes/resume - 1.pdf"


# ---------------------------------------------------------
# Extract and clean resume
# ---------------------------------------------------------

raw_text = extract_text(resume_path)
cleaned_text = clean_text(raw_text)

sections = extract_sections(cleaned_text)


# ---------------------------------------------------------
# Experience
# ---------------------------------------------------------

experience_text = sections.get(
    "experience",
    ""
)

experience = extract_experience(
    experience_text
)


# ---------------------------------------------------------
# Education
# ---------------------------------------------------------

education_text = sections.get(
    "education",
    ""
)

education = extract_education(
    education_text
)


# ---------------------------------------------------------
# Display results
# ---------------------------------------------------------

print("=" * 70)
print("EXPERIENCE")
print("=" * 70)

print(f"Years of experience: {experience['years']}")

print("\nExperience entries:")

for entry in experience["entries"]:
    print(f"• {entry}")


print("\n" + "=" * 70)
print("EDUCATION")
print("=" * 70)

print("Degrees:")

for degree in education["degrees"]:
    print(f"• {degree}")

print("\nFields:")

for field in education["fields"]:
    print(f"• {field}")