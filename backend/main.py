from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json

app = FastAPI(title="Nauka Programowania API")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://nauka-progrmowania-os.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/")
def root():
    return {"message": "Backend działa ✅"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/languages")
def languages():
    return load_json(DATA_DIR / "languages.json")

@app.get("/lessons/{language_id}")
def lessons(language_id: str):
    lessons_by_lang = load_json(DATA_DIR / "lessons.json")
    return lessons_by_lang.get(language_id, [])

@app.get("/quiz/{lesson_id}")
def quiz(lesson_id: str):
    quizzes = load_json(DATA_DIR / "quizzes.json")
    # teraz zwracamy LISTĘ pytań (albo pustą listę)
    return quizzes.get(lesson_id, [])
