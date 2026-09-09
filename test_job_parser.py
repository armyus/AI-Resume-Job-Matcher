from src.document_parser import extract_text
from src.text_preprocessor import clean_text
from src.job_parser import extract_jd_sections


file_path = "data/Job Description/sample_jd_2.pdf"

raw_text = extract_text(file_path)
cleaned_text = clean_text(raw_text)

sections = extract_jd_sections(cleaned_text)


print("=" * 70)
print("JOB DESCRIPTION SECTIONS")
print("=" * 70)

for section, content in sections.items():

    print(f"\n[{section.upper()}]")
    print("-" * 70)
    print(content)

print("\n" + "=" * 70)
print("SECTIONS FOUND:")
print(", ".join(sections.keys()))
print("=" * 70)