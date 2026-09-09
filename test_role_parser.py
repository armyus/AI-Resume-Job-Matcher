from src.document_parser import extract_text
from src.job_parser import extract_jd_roles, is_multi_role_jd


JD_PATH = "data/Job Description/sample_jd_2.pdf"


text = extract_text(JD_PATH)

print("=" * 80)
print("MULTI-ROLE JOB DETECTION")
print("=" * 80)

print(
    f"Multiple roles detected: "
    f"{is_multi_role_jd(text)}"
)

print()

roles = extract_jd_roles(text)

print("=" * 80)
print("DETECTED JOB ROLES")
print("=" * 80)

for role_name, sections in roles.items():

    print()
    print(f"ROLE: {role_name}")
    print("-" * 80)

    print(
        "Sections:",
        ", ".join(sections.keys())
    )

    for section, content in sections.items():

        print()
        print(f"[{section.upper()}]")
        print("-" * 80)
        print(content[:1000])