import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://nauka-progrmowania-api-2.onrender.com"; 

function Badge({ children }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid #e5e7eb",
      background: "#f9fafb",
      color: "#111827"
    }}>
      {children}
    </span>
  );
}

function Card({ title, subtitle, right, children }) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      background: "white",
      borderRadius: 16,
      padding: 16,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled }) {
  const styles = useMemo(() => {
    const base = {
      padding: "10px 12px",
      borderRadius: 12,
      fontWeight: 600,
      border: "1px solid transparent",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "transform 0.02s ease-in-out"
    };
    if (variant === "ghost") {
      return { ...base, background: "transparent", borderColor: "#e5e7eb", color: "#111827" };
    }
    if (variant === "danger") {
      return { ...base, background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" };
    }
    return { ...base, background: "#111827", borderColor: "#111827", color: "white" };
  }, [variant, disabled]);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={styles}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.99)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [quiz, setQuiz] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
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
        const data = await fetchJson(`${API_BASE}/languages`);
        setLanguages(data);
        setSelectedLang(data?.[0] ?? null);
      } catch (e) {
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
        setQuiz(null);
        setAnswerResult(null);

        const data = await fetchJson(`${API_BASE}/lessons/${selectedLang.id}`);
        setLessons(data);
        setSelectedLesson(data?.[0] ?? null);
      } catch (e) {
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
        setQuiz(null);
        setAnswerResult(null);

        const data = await fetchJson(`${API_BASE}/quiz/${selectedLesson.id}`);
        setQuiz(data); // może być null
      } catch (e) {
        setError("Nie udało się pobrać quizu.");
      } finally {
        setLoading((s) => ({ ...s, quiz: false }));
      }
    })();
  }, [selectedLesson]);

  const selectedDone = selectedLesson ? (localStorage.getItem(doneKey(selectedLesson.id)) === "1") : false;

  function markDone() {
    if (!selectedLesson) return;
    localStorage.setItem(doneKey(selectedLesson.id), "1");
  }

  function resetDone() {
    if (!selectedLesson) return;
    localStorage.removeItem(doneKey(selectedLesson.id));
    setAnswerResult(null);
  }

  function chooseAnswer(idx) {
    if (!quiz) return;
    if (idx === quiz.answer_index) {
      setAnswerResult({ ok: true, text: "✅ Dobrze! Zapisano postęp." });
      markDone();
    } else {
      setAnswerResult({ ok: false, text: "❌ Nie, spróbuj jeszcze raz." });
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 20,
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 16
      }}>
        {/* Sidebar */}
        <div style={{ position: "sticky", top: 16, alignSelf: "start" }}>
          <div style={{
            borderRadius: 18,
            padding: 16,
            background: "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
            color: "white",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Nauka Programowania</div>
            <div style={{ opacity: 0.85, marginTop: 6, fontSize: 13 }}>
              Języki • Lekcje • Quiz • Postęp
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, opacity: 0.9 }}>API:</span>
              <span style={{ fontSize: 12, opacity: 0.9, wordBreak: "break-all" }}>{API_BASE}</span>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Card
              title="Języki"
              subtitle={loading.languages ? "Ładowanie..." : "Wybierz język"}
              right={<Badge>{languages.length}</Badge>}
            >
              {error ? (
                <div style={{ color: "#b91c1c", fontSize: 13 }}>{error}</div>
              ) : null}

              <div style={{ display: "grid", gap: 8 }}>
                {loading.languages ? (
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Pobieram dane…</div>
                ) : (
                  languages.map((lang) => {
                    const active = selectedLang?.id === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLang(lang)}
                        style={{
                          textAlign: "left",
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid " + (active ? "#111827" : "#e5e7eb"),
                          background: active ? "#111827" : "white",
                          color: active ? "white" : "#111827",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{lang.name}</div>
                        <div style={{ fontSize: 12, opacity: active ? 0.9 : 0.6 }}>
                          Poziom: {lang.level}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Main */}
        <div style={{ display: "grid", gap: 16 }}>
          <Card
            title="Lekcje"
            subtitle={selectedLang ? `Dla języka: ${selectedLang.name}` : "—"}
            right={<Badge>{lessons.length}</Badge>}
          >
            {loading.lessons ? (
              <div style={{ color: "#6b7280", fontSize: 13 }}>Ładuję lekcje…</div>
            ) : lessons.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: 13 }}>Brak lekcji.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  {lessons.map((l) => {
                    const active = selectedLesson?.id === l.id;
                    const done = localStorage.getItem(doneKey(l.id)) === "1";
                    return (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLesson(l)}
                        style={{
                          textAlign: "left",
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid " + (active ? "#111827" : "#e5e7eb"),
                          background: active ? "#f3f4f6" : "white",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ fontWeight: 800, color: "#111827" }}>{l.title}</div>
                          {done ? <Badge>Ukończone ✅</Badge> : <Badge>W trakcie</Badge>}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>ID: {l.id}</div>
                      </button>
                    );
                  })}
                </div>

                <div>
                  {selectedLesson ? (
                    <Card
                      title={selectedLesson.title}
                      subtitle={`Lekcja: ${selectedLesson.id}`}
                      right={
                        <div style={{ display: "flex", gap: 8 }}>
                          <Badge>{selectedDone ? "Ukończone ✅" : "Nieukończone"}</Badge>
                          <Button variant="ghost" onClick={resetDone}>Reset</Button>
                        </div>
                      }
                    >
                      <div style={{
                        background: "#0b1220",
                        color: "#e5e7eb",
                        borderRadius: 14,
                        padding: 14,
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        fontSize: 13,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap"
                      }}>
                        {selectedLesson.content}
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 800, color: "#111827" }}>Quiz</div>
                          {loading.quiz ? <Badge>Ładowanie…</Badge> : quiz ? <Badge>Gotowy</Badge> : <Badge>Brak</Badge>}
                        </div>

                        {!quiz ? (
                          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 8 }}>
                            Brak quizu dla tej lekcji.
                          </div>
                        ) : (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontWeight: 700, color: "#111827" }}>{quiz.question}</div>
                            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                              {quiz.options.map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => chooseAnswer(idx)}
                                  style={{
                                    textAlign: "left",
                                    padding: 12,
                                    borderRadius: 14,
                                    border: "1px solid #e5e7eb",
                                    background: "white",
                                    cursor: "pointer"
                                  }}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>

                            {answerResult ? (
                              <div style={{
                                marginTop: 12,
                                padding: 12,
                                borderRadius: 14,
                                border: "1px solid " + (answerResult.ok ? "#bbf7d0" : "#fecaca"),
                                background: answerResult.ok ? "#f0fdf4" : "#fef2f2",
                                color: answerResult.ok ? "#166534" : "#991b1b",
                                fontWeight: 700
                              }}>
                                {answerResult.text}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <div style={{ color: "#6b7280", fontSize: 13 }}>Wybierz lekcję po lewej.</div>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Co dalej"
            subtitle="Rozbudowa aplikacji krok po kroku"
          >
            <ul style={{ margin: 0, paddingLeft: 18, color: "#374151", lineHeight: 1.6 }}>
              <li>Panel “Postęp” (punkty, procent, ukończone lekcje)</li>
              <li>Logowanie użytkownika + zapis postępu w bazie (PostgreSQL)</li>
              <li>Więcej typów quizów (wielokrotny wybór, uzupełnianie kodu)</li>
              <li>Dodawanie treści z panelu admina</li>
              <li>Ładny design system (Tailwind) i routing (React Router)</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
