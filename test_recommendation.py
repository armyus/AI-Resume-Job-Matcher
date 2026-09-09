from src.recommendation_engine import generate_ai_recommendation


result = generate_ai_recommendation(
    overall_score=79.91,

    skill_result={
        "matched": [
            "python",
            "pandas",
            "sql",
            "power bi",
        ],
        "missing": [
            "deep learning",
            "computer vision",
            "tableau",
        ],
    },

    experience_result={
        "candidate_years": 0.0,
        "required_years": 0.0,
        "score": 1.0,
    },

    education_result={
        "score": 1.0,
    },

    project_result={
        "score": 1.0,
    },

    semantic_score=0.4912,
)


print("=" * 70)
print("AI RECOMMENDATION")
print("=" * 70)

print(f"\nRecommendation: {result['recommendation']}")
print(f"Overall Score: {result['overall_score']}%")

print("\nStrengths:")
for strength in result["strengths"]:
    print(f"✓ {strength}")

print("\nGaps:")
for gap in result["gaps"]:
    print(f"✗ {gap}")

print("\nExplanation:")
print(result["explanation"])