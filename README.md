# Nauka Programowania – platforma do nauki (Python + JS + SQL)

Aplikacja webowa do nauki podstaw programowania w popularnych językach (na ten moment: **Python, JavaScript, SQL**).
Użytkownik wybiera język → lekcję → rozwiązuje quiz (pytania jednokrotnego wyboru i wpisywanie odpowiedzi/kodu).
Postęp ukończenia lekcji jest zapisywany lokalnie w przeglądarce.

**Autor:** Oskar Staszewski 76614 ININ_4

---

## Demo (chmura)

- Frontend (React): https://nauka-progrmowania-os.onrender.com/
- Backend (FastAPI): https://nauka-progrmowania-api-2.onrender.com/

Przykładowe endpointy:
- `/languages`
- `/lessons/{language_id}`
- `/quiz/{lesson_id}`

---

## Technologie

- Frontend: React (Vite)
- Backend: Python (FastAPI + Uvicorn)
- Dane: pliki JSON (`/data`)
- Chmura: Render
- Repo: GitHub

---

## Struktura projektu

nauka-progrmowania/
backend/
main.py
frontend-react/
src/
App.jsx
index.css
data/
languages.json
lessons.json
quizzes.json


---

## Uruchomienie lokalnie (Windows PowerShell)

### 1) Backend (FastAPI)

Przejdź do katalogu projektu:
```powershell
cd C:\Users\OskarStaszewski\Documents\nauka-progrmowania

Utwórz i aktywuj środowisko:

python -m venv .venv
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\.venv\Scripts\Activate.ps1

Zainstaluj zależności:

python -m pip install -r requirements.txt

Uruchom backend:
python -m uvicorn backend.main:app --reload

Backend działa domyślnie pod:

http://127.0.0.1:8000

Test:
iwr -UseBasicParsing http://127.0.0.1:8000/languages

2) Frontend (React)

Przejdź do folderu frontendu:

cd C:\Users\OskarStaszewski\Documents\nauka-progrmowania\frontend-react


Zainstaluj paczki:

npm install


Uruchom:

npm run dev


Frontend działa domyślnie pod:

http://127.0.0.1:5173

Jeśli uruchamiasz lokalnie, ustaw w frontend-react/src/App.jsx:
API_BASE = "http://127.0.0.1:8000"

Jak to działa?

Frontend pobiera listę języków z GET /languages

Po wyborze języka pobiera lekcje z GET /lessons/{language_id}

Po wyborze lekcji pobiera quiz z GET /quiz/{lesson_id}

Użytkownik odpowiada na pytania:

mcq – wybór jednej odpowiedzi

input – wpisanie odpowiedzi/kodu

Postęp ukończenia lekcji jest zapisywany w localStorage przeglądarki.