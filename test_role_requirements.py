from src.document_parser import extract_text
from src.job_parser import extract_jd_roles
from src.requirement_extractor import extract_requirements


JD_PATH = "data/Job Description/sample_jd_2.pdf"


text = extract_text(JD_PATH)

roles = extract_jd_roles(text)


print("=" * 80)
print("ROLE-BASED REQUIREMENT EXTRACTION")
print("=" * 80)


for role_name, sections in roles.items():

    # Combine all sections belonging to this role
    role_text = "\n".join(
        sections.values()
    )

    requirements = extract_requirements(
        role_text
    )

    print()
    print("=" * 80)
    print(f"ROLE: {role_name}")
    print("=" * 80)

    print()
    print("Required Skills:")
    print("-" * 40)

    for skill in requirements["required_skills"]:
        print(f"✓ {skill}")

    print()
    print(
        "Minimum Experience:",
        requirements["minimum_experience_years"],
        "years"
    )

    print()
    print(
        "Required Degree:",
        requirements["required_degree"]
    )

    print()
    print("Required Fields:")
    print("-" * 40)

    for field in requirements["required_fields"]:
        print(f"✓ {field}")

    print()
    print("Experience Domains:")
    print("-" * 40)

    for domain in requirements["experience_domains"]:
        print(f"✓ {domain}")