import { useEffect, useMemo, useState } from "react";

// WAŻNE: tu ma być Twój backend (ten co działa)
const API_BASE = "https://nauka-progrmowania-api-2.onrender.com";

function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        color: "#111827",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Card({ title, subtitle, right, children }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "white",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {subtitle}
            </div>
          ) : null}
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
      fontWeight: 700,
      border: "1px solid transparent",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "transform 0.02s ease-in-out",
    };
    if (variant === "ghost") {
      return {
        ...base,
        background: "transparent",
        borderColor: "#e5e7eb",
        color: "#111827",
      };
    }
    if (variant === "danger") {
      return {
        ...base,
        background: "#fee2e2",
        borderColor: "#fecaca",
        color: "#991b1b",
      };
    }
    return {
      ...base,
      background: "#111827",
      borderColor: "#111827",
      color: "white",
    };
  }, [variant, disabled]);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={styles}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.99)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 12px",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        outline: "none",
        fontSize: 14,
      }}
    />
  );
}

// normalizacja tekstu do porównywania odpowiedzi
function normalizeText(s, { trim = true, caseSensitive = false } = {}) {
  let out = String(s ?? "");
  if (trim) out = out.trim();
  // ujednolicamy białe znaki
  out = out.replace(/\s+/g, " ");
  if (!caseSensitive) out = out.toLowerCase();
  return out;
}

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // QUIZ: teraz to LISTA pytań
  const [quizItems, setQuizItems] = useState([]); // array
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({}); // {questionId: true}
  const [feedback, setFeedback] = useState(null); // {ok, text}

  const [inputAnswer, setInputAnswer] = useState("");

  const [loading, setLoading] = useState({
    languages: true,
    lessons: false,
    quiz: false,
  });
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

       
        setQuizItems([]);
        setQIndex(0);
        setScore(0);
        setAnswered({});
        setFeedback(null);
        setInputAnswer("");

        const data = await fetchJson(`${API_BASE}/quiz/${selectedLesson.id}`);
        
        const items = Array.isArray(data) ? data : (data ? [data] : []);
        setQuizItems(items);
      } catch (e) {
        setError("Nie udało się pobrać quizu.");
      } finally {
        setLoading((s) => ({ ...s, quiz: false }));
      }
    })();
  }, [selectedLesson]);

  const selectedDone = selectedLesson
    ? localStorage.getItem(doneKey(selectedLesson.id)) === "1"
    : false;

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
    setFeedback({
      ok,
      text: ok ? "✅ Dobrze." : "❌ Źle.",
    });
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
    setFeedback({
      ok,
      text: ok ? "✅ Dobrze." : "❌ Nie do końca.",
    });
  }

  function nextQuestion() {
    if (!currentQ) return;
    if (!answered[currentQ.id]) return;

    setFeedback(null);
    setInputAnswer("");

    if (qIndex + 1 < totalQ) {
      setQIndex((i) => i + 1);
      return;
    }

    
    const passed = score === totalQ && totalQ > 0;
    if (passed) markDone();
  }

  const quizFinished = totalQ > 0 && qIndex === totalQ - 1 && answered[currentQ?.id];
  const allAnswered = totalQ > 0 && Object.keys(answered).length === totalQ;

  
  const showSummary = totalQ > 0 && allAnswered;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* usuwamy szare pół ekranu: pełna szerokość + sensowny maxWidth */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Sidebar */}
          <div style={{ position: "sticky", top: 16 }}>
            <div
              style={{
                borderRadius: 18,
                padding: 16,
                background: "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
                color: "white",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                Nauka Programowania
              </div>
              <div style={{ opacity: 0.85, marginTop: 6, fontSize: 13 }}>
                Języki • Lekcje • Quiz • Postęp
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 12, opacity: 0.9 }}>API:</span>
                <span
                  style={{
                    fontSize: 12,
                    opacity: 0.9,
                    wordBreak: "break-all",
                  }}
                >
                  {API_BASE}
                </span>
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

                <div style={{ display: "grid", gap: 10 }}>
                  {loading.languages ? (
                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                      Pobieram dane…
                    </div>
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
                            border:
                              "1px solid " + (active ? "#111827" : "#e5e7eb"),
                            background: active ? "#111827" : "white",
                            color: active ? "white" : "#111827",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>{lang.name}</div>
                          <div
                            style={{
                              fontSize: 12,
                              opacity: active ? 0.9 : 0.6,
                            }}
                          >
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
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  Ładuję lekcje…
                </div>
              ) : lessons.length === 0 ? (
                <div style={{ color: "#6b7280", fontSize: 13 }}>Brak lekcji.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 12 }}>
                  {/* lista lekcji */}
                  <div style={{ display: "grid", gap: 10 }}>
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
                            border:
                              "1px solid " + (active ? "#111827" : "#e5e7eb"),
                            background: active ? "#f3f4f6" : "white",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ fontWeight: 900, color: "#111827" }}>
                              {l.title}
                            </div>
                            {done ? <Badge>Ukończone ✅</Badge> : <Badge>W trakcie</Badge>}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                            ID: {l.id}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* szczegóły lekcji + quiz */}
                  <div>
                    {selectedLesson ? (
                      <Card
                        title={selectedLesson.title}
                        subtitle={`Lekcja: ${selectedLesson.id}`}
                        right={
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <Badge>{selectedDone ? "Ukończone ✅" : "Nieukończone"}</Badge>
                            <Button variant="ghost" onClick={resetDone}>Reset</Button>
                          </div>
                        }
                      >
                        <div
                          style={{
                            background: "#0b1220",
                            color: "#e5e7eb",
                            borderRadius: 14,
                            padding: 14,
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                            fontSize: 13,
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {selectedLesson.content}
                        </div>

                        <div style={{ marginTop: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 900, color: "#111827" }}>Quiz</div>
                            {loading.quiz ? (
                              <Badge>Ładowanie…</Badge>
                            ) : totalQ > 0 ? (
                              <Badge>{showSummary ? "Zakończony" : `Pytanie ${qIndex + 1}/${totalQ}`}</Badge>
                            ) : (
                              <Badge>Brak</Badge>
                            )}
                          </div>

                          {totalQ === 0 ? (
                            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 8 }}>
                              Brak quizu dla tej lekcji.
                            </div>
                          ) : (
                            <div style={{ marginTop: 10 }}>
                              {/* Podsumowanie */}
                              {showSummary ? (
                                <div
                                  style={{
                                    padding: 12,
                                    borderRadius: 14,
                                    border: "1px solid #e5e7eb",
                                    background: "#f9fafb",
                                  }}
                                >
                                  <div style={{ fontWeight: 900, color: "#111827" }}>
                                    Wynik: {score}/{totalQ}
                                  </div>
                                  <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                                    {score === totalQ
                                      ? "✅ Super! Ukończyłeś lekcję."
                                      : "Spróbuj jeszcze raz (Reset) aby poprawić wynik."}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 800, color: "#111827" }}>
                                    {currentQ?.question}
                                  </div>

                                  {/* MCQ */}
                                  {currentQ?.type === "mcq" ? (
                                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                                      {currentQ.options.map((opt, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => answerMcq(idx)}
                                          style={{
                                            textAlign: "left",
                                            padding: 12,
                                            borderRadius: 14,
                                            border: "1px solid #e5e7eb",
                                            background: "white",
                                            cursor: "pointer",
                                          }}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}

                                  {/* INPUT */}
                                  {currentQ?.type === "input" ? (
                                    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                                      <Input
                                        value={inputAnswer}
                                        onChange={setInputAnswer}
                                        placeholder={currentQ.placeholder || "Wpisz odpowiedź..."}
                                      />
                                      <div style={{ display: "flex", gap: 10 }}>
                                        <Button
                                          onClick={answerInput}
                                          disabled={answered[currentQ.id] || inputAnswer.trim().length === 0}
                                        >
                                          Sprawdź
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          onClick={() => setInputAnswer(currentQ.answer_text)}
                                          disabled={answered[currentQ.id]}
                                        >
                                          Pokaż przykład
                                        </Button>
                                      </div>
                                    </div>
                                  ) : null}

                                  {/* feedback */}
                                  {feedback ? (
                                    <div
                                      style={{
                                        marginTop: 12,
                                        padding: 12,
                                        borderRadius: 14,
                                        border: "1px solid " + (feedback.ok ? "#bbf7d0" : "#fecaca"),
                                        background: feedback.ok ? "#f0fdf4" : "#fef2f2",
                                        color: feedback.ok ? "#166534" : "#991b1b",
                                        fontWeight: 800,
                                      }}
                                    >
                                      {feedback.text}
                                    </div>
                                  ) : null}

                                  {/* next */}
                                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                                      Punkty: <b style={{ color: "#111827" }}>{score}</b> / {totalQ}
                                    </div>
                                    <Button onClick={nextQuestion} disabled={!canGoNext}>
                                      {quizFinished ? "Zakończ" : "Dalej"}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ) : (
                      <div style={{ color: "#6b7280", fontSize: 13 }}>
                        Wybierz lekcję po lewej.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <Card title="Co dalej" subtitle="Małe kroki, duży efekt">
              <ul style={{ margin: 0, paddingLeft: 18, color: "#374151", lineHeight: 1.7 }}>
                <li>Dodamy po 5–10 pytań na lekcję (MCQ + INPUT)</li>
                <li>Wprowadzimy “hinty” (podpowiedzi) i częściowe punkty</li>
                <li>Dodamy nowe lekcje (np. pętle, if, funkcje) i więcej języków</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
