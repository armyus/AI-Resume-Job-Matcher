from src.document_parser import extract_text
from src.text_preprocessor import clean_text
from src.section_extractor import extract_sections
from src.skill_extractor import extract_skills


# ---------------------------------------------------------
# Test Resume
# ---------------------------------------------------------

resume_path = "data/Resumes/resume - 1.pdf"

resume_text = extract_text(resume_path)
resume_text = clean_text(resume_text)

resume_sections = extract_sections(resume_text)

resume_skills = extract_skills(
    resume_sections.get("skills", "")
    + "\n"
    + resume_sections.get("projects", "")
    + "\n"
    + resume_sections.get("summary", "")
)


print("=" * 70)
print("RESUME SKILLS")
print("=" * 70)

for skill in resume_skills:
    print(f"✓ {skill}")


# ---------------------------------------------------------
# Test Job Description
# ---------------------------------------------------------

jd_path = "data/Job Description/sample_jd_1.pdf"

jd_text = extract_text(jd_path)
jd_text = clean_text(jd_text)

required_skills = extract_skills(jd_text)


print("\n" + "=" * 70)
print("JOB DESCRIPTION SKILLS")
print("=" * 70)

for skill in required_skills:
    print(f"✓ {skill}")


# ---------------------------------------------------------
# Summary
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

print(f"Resume skills detected: {len(resume_skills)}")
print(f"JD skills detected: {len(required_skills)}")