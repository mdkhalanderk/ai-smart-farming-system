import os
import json
import httpx

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_community_warning(crop_name: str, disease_name: str, district: str, disease_info: dict) -> dict:
    """
    Uses Groq LLM (via backend GROQ_API_KEY) to convert verified disease knowledge 
    into ONE single, compact, farmer-friendly warning message paragraph.
    Falls back to a verified template if GROQ_API_KEY is missing or API call fails.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    
    symptoms = disease_info.get("symptoms", "visual leaf spots or abnormal discoloration")
    what_to_do_now = disease_info.get("what_to_do_now", "prune infected leaves and isolate affected plants")
    how_to_prevent = disease_info.get("how_to_prevent", "ensure good airflow and avoid overhead watering")
    management = disease_info.get("management_treatment", "apply recommended protective treatments")
    when_expert = disease_info.get("when_to_contact_expert", "contact an agricultural expert if symptoms spread")
    
    # Fallback single-paragraph message template
    fallback_message = (
        f"{disease_name} has recently been detected on {crop_name} crops in your area. "
        f"Watch your plants for {symptoms.lower()}; inspect affected crops, "
        f"{what_to_do_now.lower()}, {how_to_prevent.lower()}, and contact an agricultural expert if symptoms spread."
    )
    
    fallback_warning = {
        "warning_title": f"{disease_name}",
        "warning_message": fallback_message
    }

    if not api_key:
        return fallback_warning

    try:
        prompt = f"""You are an expert agricultural advisory assistant writing a local community warning for farmers in district: {district}.
A valid detection of '{disease_name}' on '{crop_name}' has occurred.

Verified official agricultural knowledge:
- Disease Name: {disease_name}
- Crop: {crop_name}
- Symptoms: {symptoms}
- Immediate Action: {what_to_do_now}
- Prevention: {how_to_prevent}
- Management: {management}
- Expert Contact: {when_expert}

Instructions:
1. Return ONLY a valid JSON object with keys: "warning_title" and "warning_message".
2. "warning_title" should be just the disease name (e.g. "{disease_name}").
3. "warning_message" MUST BE A SINGLE, CONCISE, NATURAL PARAGRAPH containing all relevant information (symptoms, what to watch for, practical action/prevention, and when to seek expert help).
4. Do NOT create separate sections, bullet points, or multiple boxes.
5. DO NOT invent chemical doses, chemical names, diagnoses, or unsupported claims.
6. DO NOT mention farmer identities, uploaded photos, or confidence scores.
"""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You output JSON only."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }

        with httpx.Client(timeout=10.0) as client:
            response = client.post(GROQ_API_URL, headers=headers, json=payload)
            if response.status_code == 200:
                res_json = response.json()
                content = res_json['choices'][0]['message']['content']
                parsed = json.loads(content)
                return {
                    "warning_title": parsed.get("warning_title", fallback_warning["warning_title"]),
                    "warning_message": parsed.get("warning_message", fallback_warning["warning_message"])
                }
            else:
                print(f"[Groq LLM Warning] Groq returned status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[Groq LLM Warning] Exception calling Groq API: {e}. Using verified template fallback.")

    return fallback_warning
