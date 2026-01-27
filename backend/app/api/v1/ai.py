from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models import User

router = APIRouter(prefix="/ai", tags=["AI"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = []


class QuestionGenerationRequest(BaseModel):
    subject: str
    topic: str
    class_level: str
    question_type: str  # mcq, short, long, fill_blank
    count: int = 5
    difficulty: str = "medium"  # easy, medium, hard


class GeneratedQuestion(BaseModel):
    question: str
    options: Optional[List[str]] = None
    answer: str
    explanation: Optional[str] = None


# FAQ responses for the chatbot
FAQ_RESPONSES = {
    "admission": "For admissions, please visit our Admissions page or contact our admissions office at admissions@slnsvm.edu. Applications are open for the academic year 2025-26.",
    "fees": "Fee structure varies by class. You can find detailed fee information in the parent portal after login, or contact our accounts office for more details.",
    "timing": "School timings are 8:00 AM to 2:30 PM (Monday to Friday) and 8:00 AM to 12:30 PM (Saturday). Office hours are 8:00 AM to 4:00 PM.",
    "uniform": "School uniforms are available at our designated vendors. Details are provided in the student handbook.",
    "transport": "We provide transport facilities covering major routes. For route and fare details, please contact the transport department.",
    "calendar": "The academic calendar is available on our website and in the student/parent portal. Key dates include summer vacation, exam schedules, and holidays.",
    "contact": "You can reach us at info@slnsvm.edu or call +91-XXXXXXXXXX. Our address is [School Address].",
    "curriculum": "We follow the CBSE curriculum from Nursery to Class 12. We offer Science, Commerce, and Humanities streams in senior secondary.",
}


def get_faq_response(message: str) -> Optional[str]:
    """Simple keyword-based FAQ matching"""
    message_lower = message.lower()

    keywords = {
        "admission": ["admission", "apply", "enroll", "registration", "join"],
        "fees": ["fee", "payment", "cost", "charge", "tuition"],
        "timing": ["timing", "time", "schedule", "hours", "when"],
        "uniform": ["uniform", "dress", "clothes"],
        "transport": ["transport", "bus", "van", "pick", "drop"],
        "calendar": ["calendar", "holiday", "vacation", "exam date"],
        "contact": ["contact", "phone", "email", "address", "reach"],
        "curriculum": ["curriculum", "syllabus", "cbse", "subjects", "stream"],
    }

    for category, words in keywords.items():
        if any(word in message_lower for word in words):
            return FAQ_RESPONSES.get(category)

    return None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """AI-powered chatbot for school FAQs"""

    # First try FAQ matching
    faq_response = get_faq_response(request.message)
    if faq_response:
        return ChatResponse(
            response=faq_response,
            suggestions=["Admission process", "Fee structure", "School timings", "Contact us"]
        )

    # If OpenAI API key is available, use AI
    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            system_prompt = """You are a helpful assistant for SLNSVM School.
            You help students, parents, and visitors with information about the school.
            Be friendly, professional, and concise in your responses.
            If you don't know something specific, suggest contacting the school office."""

            messages = [{"role": "system", "content": system_prompt}]

            # Add history
            for msg in request.history or []:
                messages.append({"role": msg.role, "content": msg.content})

            messages.append({"role": "user", "content": request.message})

            response = client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )

            return ChatResponse(
                response=response.choices[0].message.content,
                suggestions=["Tell me more", "Contact school", "Visit admissions"]
            )

        except Exception as e:
            # Fallback to default response
            pass

    # Default response
    return ChatResponse(
        response="Thank you for your message. For detailed information, please contact our school office at info@slnsvm.edu or visit during office hours (8 AM - 4 PM).",
        suggestions=["Admission inquiry", "Fee details", "School timing", "Contact information"]
    )


@router.post("/generate-questions", response_model=List[GeneratedQuestion])
async def generate_questions(
    request: QuestionGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate questions using AI (for teachers)"""

    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service not available. Please configure OpenAI API key."
        )

    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        question_type_map = {
            "mcq": "multiple choice questions with 4 options",
            "short": "short answer questions (2-3 lines answer)",
            "long": "long answer questions (detailed explanation required)",
            "fill_blank": "fill in the blank questions"
        }

        prompt = f"""Generate {request.count} {question_type_map.get(request.question_type, 'questions')}
        for {request.subject} on the topic "{request.topic}" for Class {request.class_level} students.
        Difficulty level: {request.difficulty}

        For each question, provide:
        1. The question
        2. Options (for MCQ) or leave empty
        3. The correct answer
        4. A brief explanation

        Return in JSON format with array of objects having keys: question, options (array or null), answer, explanation"""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert teacher creating exam questions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )

        import json
        content = response.choices[0].message.content

        # Try to parse JSON from response
        try:
            # Find JSON array in response
            start = content.find('[')
            end = content.rfind(']') + 1
            if start != -1 and end > start:
                questions_data = json.loads(content[start:end])
                return [GeneratedQuestion(**q) for q in questions_data]
        except:
            pass

        # Fallback: return sample questions
        return [
            GeneratedQuestion(
                question=f"Sample {request.question_type} question about {request.topic}",
                options=["Option A", "Option B", "Option C", "Option D"] if request.question_type == "mcq" else None,
                answer="Sample answer",
                explanation="This is a sample explanation."
            )
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")
