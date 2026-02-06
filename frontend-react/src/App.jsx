import { useEffect, useState } from "react";
import "./index.css";

const API_BASE = "https://nauka-progrmowania-api-2.onrender.com";

function normalizeText(s, { trim = true, caseSensitive = false } = {}) {
  let out = String(s ?? "");
  if (trim) out = out.trim();
  out = out.replace(/\s+/g, " ");
  if (!caseSensitive) out = out.toLowerCase();
  return out;
}

function normalizeQuiz(raw) {
  let items = [];
  if (Array.isArray(raw)) items = raw;
  else if (raw && typeof raw === "object") items = [raw];
  return items.map((q, i) => {
    const type = q.type ?? (Array.isArray(q.options) ? "mcq" : "input");
    const id = q.id ?? `auto-${i}`;
    return { ...q, id, type };
  });
}

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [quizItems, setQuizItems] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [inputAnswer, setInputAnswer] = useState("");

  const [loading, setLoading] = useState({ languages: true, lessons: false, quiz: false });
  const [error, setError] = useState(null);

  const doneKey = (lessonId) => `done:${lessonId}`;

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading((s) => ({ ...s, languages: true }));
        setError(null);
        const data = await fetchJson(`${API_BASE}/languages`);
        setLanguages(data);
        setSelectedLang(data?.[0] ?? null);
      } catch {
        setError("Nie udało się pobrać języków z API.");
      } finally {
        setLoading((s) => ({ ...s, languages: false }));
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedLang) return;
    (async () => {
      try {
        setError(null);
        setLoading((s) => ({ ...s, lessons: true }));

        setSelectedLesson(null);
        setLessons([]);

        setQuizItems([]);
        setQIndex(0);
        setScore(0);
        setAnswered({});
        setFeedback(null);
        setInputAnswer("");

        const data = await fetchJson(`${API_BASE}/lessons/${selectedLang.id}`);
        setLessons(data);
        setSelectedLesson(data?.[0] ?? null);
      } catch {
        setError("Nie udało się pobrać lekcji.");
      } finally {
        setLoading((s) => ({ ...s, lessons: false }));
      }
    })();
  }, [selectedLang]);

  useEffect(() => {
    if (!selectedLesson) return;
    (async () => {
      try {
        setError(null);
        setLoading((s) => ({ ...s, quiz: true }));

        setQuizItems([]);
        setQIndex(0);
        setScore(0);
        setAnswered({});
        setFeedback(null);
        setInputAnswer("");

        const raw = await fetchJson(`${API_BASE}/quiz/${selectedLesson.id}`);
        setQuizItems(normalizeQuiz(raw));
      } catch {
        setError("Nie udało się pobrać quizu.");
      } finally {
        setLoading((s) => ({ ...s, quiz: false }));
      }
    })();
  }, [selectedLesson]);

  const selectedDone = selectedLesson ? localStorage.getItem(doneKey(selectedLesson.id)) === "1" : false;

  function markDone() {
    if (!selectedLesson) return;
    localStorage.setItem(doneKey(selectedLesson.id), "1");
  }

  function resetDone() {
    if (!selectedLesson) return;
    localStorage.removeItem(doneKey(selectedLesson.id));
    setFeedback(null);
    setScore(0);
    setAnswered({});
    setQIndex(0);
    setInputAnswer("");
  }

  const currentQ = quizItems[qIndex] ?? null;
  const totalQ = quizItems.length;
  const canGoNext = currentQ ? !!answered[currentQ.id] : false;

  function answerMcq(idx) {
    if (!currentQ || answered[currentQ.id]) return;
    const ok = idx === currentQ.answer_index;
    setAnswered((m) => ({ ...m, [currentQ.id]: true }));
    if (ok) setScore((s) => s + 1);
    setFeedback({ ok, text: ok ? "✅ Dobrze." : "❌ Źle." });
  }

  function answerInput() {
    if (!currentQ || answered[currentQ.id]) return;

    const user = normalizeText(inputAnswer, {
      trim: currentQ.trim ?? true,
      caseSensitive: currentQ.case_sensitive ?? false,
    });
    const expected = normalizeText(currentQ.answer_text, {
      trim: currentQ.trim ?? true,
      caseSensitive: currentQ.case_sensitive ?? false,
    });

    const ok = user === expected;
    setAnswered((m) => ({ ...m, [currentQ.id]: true }));
    if (ok) setScore((s) => s + 1);
    setFeedback({ ok, text: ok ? "✅ Dobrze." : "❌ Nie do końca." });
  }

  function nextQuestion() {
    if (!currentQ || !answered[currentQ.id]) return;

    setFeedback(null);
    setInputAnswer("");

    if (qIndex + 1 < totalQ) {
      setQIndex((i) => i + 1);
      return;
    }

    if (score === totalQ && totalQ > 0) markDone();
  }

  const allAnswered = totalQ > 0 && Object.keys(answered).length === totalQ;
  const showSummary = totalQ > 0 && allAnswered;

  return (
    <div className="app">
      <div className="container">
        <div className="grid">
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="hero">
              <div className="hero-title">Nauka Programowania</div>
              <div className="hero-sub">Języki • Lekcje • Quiz • Postęp</div>

            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Języki</div>
                  <div className="card-sub">{loading.languages ? "Ładowanie..." : "Wybierz język"}</div>
                </div>
                <span className="badge">{languages.length}</span>
              </div>

              {error ? <div style={{ color: "#b91c1c", marginTop: 10 }}>{error}</div> : null}

              <div className="list" style={{ marginTop: 12 }}>
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    className={"itembtn " + (selectedLang?.id === lang.id ? "active" : "")}
                    onClick={() => setSelectedLang(lang)}
                  >
                    <div style={{ fontWeight: 900 }}>{lang.name}</div>
                    <div className="small">Poziom: {lang.level}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="main">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Lekcje</div>
                  <div className="card-sub">{selectedLang ? `Dla języka: ${selectedLang.name}` : "—"}</div>
                </div>
                <span className="badge">{lessons.length}</span>
              </div>

              {loading.lessons ? (
                <div style={{ marginTop: 12, color: "#6b7280" }}>Ładuję lekcje…</div>
              ) : lessons.length === 0 ? (
                <div style={{ marginTop: 12, color: "#6b7280" }}>Brak lekcji.</div>
              ) : (
                <div className="two" style={{ marginTop: 12 }}>
                  
                  <div className="card lessonPanel">
                    {selectedLesson ? (
                      <>
                        <div className="row">
                          <div>
                            <div className="card-title">{selectedLesson.title}</div>
                            <div className="card-sub">Lekcja: {selectedLesson.id}</div>
                          </div>
                          <div className="row">
                            <span className="badge">{selectedDone ? "Ukończone ✅" : "Nieukończone"}</span>
                            <button className="btn ghost" onClick={resetDone}>Reset</button>
                          </div>
                        </div>

                        <div className="codebox" style={{ marginTop: 12 }}>
                          {selectedLesson.content}
                        </div>

                        <div className="quiz">
                          <div className="row">
                            <div style={{ fontWeight: 900 }}>Quiz</div>
                            {loading.quiz ? (
                              <span className="badge">Ładowanie…</span>
                            ) : totalQ > 0 ? (
                              <span className="badge">{showSummary ? "Zakończony" : `Pytanie ${qIndex + 1}/${totalQ}`}</span>
                            ) : (
                              <span className="badge">Brak</span>
                            )}
                          </div>

                          {totalQ === 0 ? (
                            <div style={{ color: "#6b7280" }}>Brak quizu dla tej lekcji.</div>
                          ) : showSummary ? (
                            <div className="feedback ok">
                              Wynik: {score}/{totalQ} {score === totalQ ? "— ukończono ✅" : "— spróbuj ponownie (Reset)"}
                            </div>
                          ) : (
                            <>
                              <div style={{ fontWeight: 900 }}>{currentQ?.question}</div>

                              {currentQ?.type === "mcq" ? (
                                <div className="mcq">
                                  {(currentQ.options ?? []).map((opt, idx) => (
                                    <button key={idx} className="option" onClick={() => answerMcq(idx)}>
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              ) : null}

                              {currentQ?.type === "input" ? (
                                <div style={{ display: "grid", gap: 10 }}>
                                  <input
                                    className="input"
                                    value={inputAnswer}
                                    onChange={(e) => setInputAnswer(e.target.value)}
                                    placeholder={currentQ.placeholder || "Wpisz odpowiedź..."}
                                  />
                                  <div className="row">
                                    <button className="btn primary" onClick={answerInput} disabled={answered[currentQ.id] || inputAnswer.trim().length === 0}>
                                      Sprawdź
                                    </button>
                                    <button className="btn ghost" onClick={() => setInputAnswer(currentQ.answer_text ?? "")} disabled={answered[currentQ.id]}>
                                      Pokaż przykład
                                    </button>
                                  </div>
                                </div>
                              ) : null}

                              {feedback ? (
                                <div className={"feedback " + (feedback.ok ? "ok" : "bad")}>{feedback.text}</div>
                              ) : null}

                              <div className="row">
                                <div style={{ color: "#6b7280" }}>
                                  Punkty: <b>{score}</b> / {totalQ}
                                </div>
                                <button className="btn primary" onClick={nextQuestion} disabled={!canGoNext}>
                                  Dalej
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <div style={{ color: "#6b7280" }}>Wybierz lekcję po lewej.</div>
                    )}
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, textAlign: "center", color: "#64748b", fontSize: 13 }}>
  Aplikacja została stworzona przez Oskar Staszewski 76614 ININ_4
</div>

    </div>
  );
}
