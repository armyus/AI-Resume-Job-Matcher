from src.document_parser import extract_text
from src.text_preprocessor import clean_text
from src.section_extractor import extract_sections


file_path = "data/Job Description/sample_jd_1.pdf"

raw_text = extract_text(file_path)
cleaned_text = clean_text(raw_text)
sections = extract_sections(cleaned_text)


print("=" * 70)
print("EXTRACTED RESUME SECTIONS")
print("=" * 70)

for section, content in sections.items():
    print(f"\n[{section.upper()}]")
    print("-" * 70)
    print(content)

print("\n" + "=" * 70)
print("SECTIONS FOUND:")
print(", ".join(sections.keys()))
print("=" * 70)