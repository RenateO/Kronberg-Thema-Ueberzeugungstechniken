import { useState, useRef, useEffect } from "react";
import { SCENARIOS, DIFFICULTY_COLORS, DEFAULT_GLOBAL_INSTRUCTIONS } from "./personas.js";
import { COURSE_CONTEXT, TECHNIQUES } from "./courseContent.js";
import { PROVIDERS, loadConfig, saveConfig, clearConfig, callLLM, getFixedConfig } from "./providers.js";
import { ADMIN_PIN, APP_TEXTE, STANDARD_ANBIETER, STANDARD_MODELL } from "./EINSTELLUNGEN.js";

// Alias — alle Aufrufe gehen über den konfigurierten Anbieter
const callClaude = callLLM;

// Auswertung: analysiert das ganze Gespräch und gibt strukturiertes JSON zurück
async function evaluateConversation(messages, scenario) {
  const transcript = messages
    .map(m => (m.role === "user" ? "STUDIERENDE/R" : scenario.name) + ": " + m.content)
    .join("\n\n");

  const evalSystem = `Du bist ein/e Tutor/in für den Hochschulkurs Personal- & Organisationsentwicklung (PE/OE).
Du bewertest, wie gut ein/e Studierende/r im Rollenspiel die Person "${scenario.name}" (${scenario.role}) überzeugt hat,
bei "Projekt Fokus26" mitzuwirken. Bewertungsgrundlage sind AUSSCHLIESSLICH die Kursinhalte.

${COURSE_CONTEXT}

BEWERTUNGSSCHLÜSSEL FÜR DIESE PERSON:
${scenario.evaluatorKey}

Analysiere das Transkript und gib AUSSCHLIESSLICH gültiges JSON zurück (keine Markdown-Backticks, kein Text davor/danach):
{
  "score": <Zahl 0-100>,
  "summary": "<2-3 Sätze Gesamteinschätzung>",
  "techniquesUsed": [
    {"name":"<Technik aus den 10>","quality":"gut|teils|schwach","comment":"<1 Satz: passend für diese Person? warum?>"}
  ],
  "communication": [
    {"criterion":"Bezugsrahmen verstanden","met":true|false,"comment":"<1 Satz>"},
    {"criterion":"Aktiv zugehört / Wertschätzung","met":true|false,"comment":"<1 Satz>"},
    {"criterion":"Pull vor Push begonnen","met":true|false,"comment":"<1 Satz>"},
    {"criterion":"Lösungsorientiert / Gemeinsamkeiten","met":true|false,"comment":"<1 Satz>"}
  ],
  "goalReached": true|false,
  "improvements": ["<konkreter Verbesserungsvorschlag>", "<noch einer>"]
}

Bewerte DIFFERENZIERT: Wer unpassende Techniken (z.B. Druck bei einer Machtträgerin) einsetzt, bekommt einen niedrigen Score.
Wer die für diese Person passenden Techniken geschickt UND mit guter Kommunikation (Pull zuerst, Wertschätzung, Bezugsrahmen)
einsetzt, bekommt einen hohen Score. Sei fair, aber anspruchsvoll und kursnah.`;

  const raw = await callClaude(
    [{ role: "user", content: "Hier das Transkript des Überzeugungsgesprächs:\n\n" + transcript }],
    evalSystem,
    1500
  );
  try {
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    return JSON.parse(clean.slice(start, end + 1));
  } catch (e) {
    return { error: true, raw };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// FEEDBACK PANEL
// ─────────────────────────────────────────────────────────────────────────
function FeedbackPanel({ data, scenario, onClose }) {
  if (data?.error) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ padding: 28, color: "#E8E8F0" }}>
          <h2 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Auswertung</h2>
          <p style={{ color: "#999" }}>Die Auswertung konnte nicht strukturiert geladen werden. Rohtext:</p>
          <pre style={{ whiteSpace: "pre-wrap", color: "#CCC", fontSize: 13 }}>{data.raw}</pre>
        </div>
      </Overlay>
    );
  }
  const score = data.score ?? 0;
  const scoreColor = score >= 75 ? "#00A878" : score >= 50 ? "#FF6B35" : "#E63946";
  const qColor = q => (q === "gut" ? "#00A878" : q === "teils" ? "#FF6B35" : "#E63946");

  return (
    <Overlay onClose={onClose}>
      <div style={{ padding: 28, color: "#E8E8F0", overflowY: "auto", maxHeight: "82vh" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Georgia, serif", margin: 0, fontSize: 24 }}>Auswertung deines Gesprächs</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Score ring */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
          <div style={{
            width: 110, height: 110, borderRadius: "50%", flexShrink: 0,
            background: `conic-gradient(${scoreColor} ${score * 3.6}deg, #1E1E2E 0deg)`,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              width: 86, height: 86, borderRadius: "50%", background: "#0F0F1A",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: scoreColor }}>{score}</span>
              <span style={{ fontSize: 11, color: "#666" }}>/ 100</span>
            </div>
          </div>
          <div>
            <div style={{
              display: "inline-block", fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
              background: data.goalReached ? "#00A87822" : "#E6394622",
              color: data.goalReached ? "#00A878" : "#E63946", marginBottom: 8
            }}>
              {data.goalReached ? "✓ Ziel erreicht" : "✗ Ziel nicht erreicht"}
            </div>
            <p style={{ margin: 0, color: "#BBB", lineHeight: 1.6 }}>{data.summary}</p>
          </div>
        </div>

        {/* Techniques */}
        <Section title="Eingesetzte Überzeugungstechniken">
          {(data.techniquesUsed || []).length === 0 && (
            <p style={{ color: "#777" }}>Keine klar erkennbaren Techniken identifiziert.</p>
          )}
          {(data.techniquesUsed || []).map((t, i) => (
            <div key={i} style={rowStyle}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: qColor(t.quality), flexShrink: 0, marginTop: 6 }} />
              <div>
                <strong style={{ color: "#E8E8F0" }}>{t.name}</strong>
                <span style={{ color: qColor(t.quality), fontSize: 12, marginLeft: 8, fontWeight: 600 }}>{t.quality}</span>
                <div style={{ color: "#999", fontSize: 13, marginTop: 2 }}>{t.comment}</div>
              </div>
            </div>
          ))}
        </Section>

        {/* Communication */}
        <Section title="Kommunikationsgrundlagen (Session 2 & 6)">
          {(data.communication || []).map((c, i) => (
            <div key={i} style={rowStyle}>
              <span style={{ flexShrink: 0, marginTop: 1, color: c.met ? "#00A878" : "#E63946" }}>
                {c.met ? "✓" : "✗"}
              </span>
              <div>
                <strong style={{ color: "#E8E8F0" }}>{c.criterion}</strong>
                <div style={{ color: "#999", fontSize: 13, marginTop: 2 }}>{c.comment}</div>
              </div>
            </div>
          ))}
        </Section>

        {/* Improvements */}
        <Section title="Verbesserungsvorschläge">
          {(data.improvements || []).map((imp, i) => (
            <div key={i} style={{ ...rowStyle, color: "#CCC" }}>
              <span style={{ color: scenario.color, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{imp}</span>
            </div>
          ))}
        </Section>

        <button onClick={onClose} style={{
          marginTop: 12, padding: "12px 28px", background: scenario.color, border: "none",
          borderRadius: 10, color: "white", fontWeight: 600, cursor: "pointer", fontSize: 14
        }}>Zurück zum Gespräch</button>
      </div>
    </Overlay>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#666", marginBottom: 10, textTransform: "uppercase" }}>
        {title}
      </div>
      {children}
    </div>
  );
}
const rowStyle = { display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #15151F" };
const closeBtn = { background: "#1E1E2E", border: "none", color: "#888", cursor: "pointer", borderRadius: 8, padding: "8px 14px", fontSize: 14 };

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(8,8,20,0.92)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0F0F1A", border: "1px solid #2A2A3E", borderRadius: 20,
        width: "min(720px, 96vw)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)"
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CHAT VIEW
// ─────────────────────────────────────────────────────────────────────────
function ChatView({ scenario, globalInstructions, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const bottomRef = useRef();

  // Persona-Prompt + globale Zusatz-Anweisungen kombiniert
  const fullSystemPrompt = scenario.systemPrompt + (globalInstructions ? "\n\n" + globalInstructions : "");

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function startChat() {
    setStarted(true);
    setLoading(true);
    const opening = await callClaude(
      [{ role: "user", content: "Wir treffen uns zum Gespräch. Begrüße mich kurz in deiner Rolle und frage, worum es geht." }],
      fullSystemPrompt
    );
    setMessages([{ role: "assistant", content: opening }]);
    setLoading(false);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    const reply = await callClaude(
      newMsgs.map(m => ({ role: m.role, content: m.content })),
      fullSystemPrompt
    );
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  async function runEvaluation() {
    if (messages.filter(m => m.role === "user").length === 0) return;
    setEvaluating(true);
    const result = await evaluateConversation(messages, scenario);
    setFeedback(result);
    setEvaluating(false);
  }

  function reset() { setMessages([]); setStarted(false); setFeedback(null); }

  const userTurns = messages.filter(m => m.role === "user").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#08080F" }}>
      {feedback && <FeedbackPanel data={feedback} scenario={scenario} onClose={() => setFeedback(null)} />}

      {/* Top bar */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid #1A1A28", display: "flex", alignItems: "center", gap: 16, background: "#0A0A16" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18 }}>←</button>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: scenario.color, boxShadow: `0 0 8px ${scenario.color}` }} />
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 17, color: "#E8E8F0" }}>{scenario.name}</div>
          <div style={{ fontSize: 12, color: "#555" }}>{scenario.role}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {started && userTurns > 0 && (
            <button onClick={runEvaluation} disabled={evaluating} style={{
              background: evaluating ? "#333" : `linear-gradient(135deg, ${scenario.color}, ${scenario.color}AA)`,
              border: "none", color: "white", cursor: evaluating ? "default" : "pointer",
              borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600
            }}>{evaluating ? "Werte aus…" : "📊 Gespräch auswerten"}</button>
          )}
          <button onClick={reset} style={{ background: "#1A1A28", border: "none", color: "#666", cursor: "pointer", borderRadius: 8, padding: "9px 14px", fontSize: 13 }}>↺ Neu</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {!started && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", maxWidth: 520 }}>
              <div style={{ fontSize: 44, marginBottom: 16, color: scenario.color }}>◈</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#E8E8F0", marginBottom: 4 }}>{scenario.name}</div>
              <div style={{ color: scenario.color, fontSize: 14, marginBottom: 14 }}>{scenario.role}</div>
              <div style={{ color: "#888", lineHeight: 1.7, marginBottom: 18, fontSize: 15 }}>{scenario.description}</div>
              <div style={{ background: `${scenario.color}15`, border: `1px solid ${scenario.color}33`, borderRadius: 12, padding: "14px 20px", color: "#CCC", fontSize: 14, marginBottom: 28, textAlign: "left", lineHeight: 1.6 }}>
                <strong style={{ color: scenario.color }}>🎯 Deine Aufgabe:</strong> {scenario.goal}
              </div>
              <button onClick={startChat} style={{ padding: "14px 36px", background: scenario.color, border: "none", borderRadius: 12, color: "white", cursor: "pointer", fontSize: 16, fontWeight: 700, boxShadow: `0 8px 24px ${scenario.color}44` }}>
                Gespräch starten
              </button>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "72%", padding: "14px 18px", borderRadius: 16,
              background: m.role === "user" ? `linear-gradient(135deg, ${scenario.color}CC, ${scenario.color}88)` : "#14141E",
              border: m.role === "assistant" ? "1px solid #222230" : "none",
              color: "#E8E8F0", fontSize: 15, lineHeight: 1.65, whiteSpace: "pre-wrap",
              borderBottomRightRadius: m.role === "user" ? 4 : 16, borderBottomLeftRadius: m.role === "assistant" ? 4 : 16
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "14px 18px", borderRadius: 16, background: "#14141E", border: "1px solid #222230", display: "flex", gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: scenario.color, animation: `bounce 1s ${i * 0.15}s infinite`, opacity: 0.7 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {started && (
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1A1A28", background: "#0A0A16" }}>
          <div style={{ display: "flex", gap: 12, maxWidth: 900, margin: "0 auto" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Dein Argument…" style={{ flex: 1, padding: "14px 18px", background: "#12121E", border: "1px solid #2A2A3E", borderRadius: 12, color: "#E8E8F0", fontSize: 15, outline: "none" }} />
            <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "14px 24px", background: loading ? "#333" : scenario.color, border: "none", borderRadius: 12, color: "white", cursor: loading ? "default" : "pointer", fontSize: 20, boxShadow: loading ? "none" : `0 4px 16px ${scenario.color}44` }}>↑</button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce {0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────────────────────────────────
// (ADMIN_PIN wird zentral aus EINSTELLUNGEN.js importiert)

const iStyle = {
  width: "100%", padding: "10px 14px", background: "#0A0A14",
  border: "1px solid #2A2A3E", borderRadius: 10, color: "#E8E8F0",
  fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
};
const lStyle = { display: "block", fontSize: 11, color: "#666", fontWeight: 700, letterSpacing: 0.8, marginBottom: 5, textTransform: "uppercase" };

function AdminPanel({ scenarios, setScenarios, globalInstructions, setGlobalInstructions, onClose }) {
  const [view, setView] = useState("persona"); // "persona" | "global"
  const [sel, setSel] = useState(scenarios[0]);
  const [ed, setEd] = useState({ ...scenarios[0] });
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("persona"); // persona | evaluator
  const [globalDraft, setGlobalDraft] = useState(globalInstructions);
  const [globalSaved, setGlobalSaved] = useState(false);

  function select(s) { setView("persona"); setSel(s); setEd({ ...s }); setSaved(false); setTab("persona"); }

  function save() {
    setScenarios(prev => prev.map(s => s.id === ed.id ? { ...ed } : s));
    setSel({ ...ed });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveGlobal() {
    setGlobalInstructions(globalDraft);
    setGlobalSaved(true);
    setTimeout(() => setGlobalSaved(false), 2000);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,20,0.93)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0F0F1A", border: "1px solid #2A2A3E", borderRadius: 20, width: "min(980px,96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1A2E", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#E8E8F0" }}>⚙️ Admin Panel</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Personas & System Prompts konfigurieren</div>
          </div>
          <button onClick={onClose} style={{ background: "#1E1E2E", border: "none", color: "#888", cursor: "pointer", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>✕ Schließen</button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Sidebar */}
          <div style={{ width: 200, borderRight: "1px solid #1A1A2E", padding: 14, display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PERSONAS</div>
            {scenarios.map(s => (
              <div key={s.id} onClick={() => select(s)} style={{
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                background: view === "persona" && sel?.id === s.id ? "#1A1A2E" : "transparent",
                border: `1px solid ${view === "persona" && sel?.id === s.id ? s.color + "44" : "transparent"}`,
                transition: "all 0.15s"
              }}>
                <div style={{ fontSize: 13, color: "#DDD" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: DIFFICULTY_COLORS[s.difficulty] || "#888", fontWeight: 600, marginTop: 2 }}>{s.difficulty}</div>
              </div>
            ))}

            <div style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, margin: "14px 0 4px" }}>GLOBAL</div>
            <div onClick={() => { setView("global"); setGlobalDraft(globalInstructions); setGlobalSaved(false); }} style={{
              padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: view === "global" ? "#1A1A2E" : "transparent",
              border: `1px solid ${view === "global" ? "#4361EE44" : "transparent"}`,
              transition: "all 0.15s"
            }}>
              <div style={{ fontSize: 13, color: "#DDD" }}>🌐 Zusatz-Anweisungen</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>für alle Personas</div>
            </div>
          </div>

          {/* Editor: GLOBAL */}
          {view === "global" && (
            <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#E8E8F0", marginBottom: 4 }}>Globale Zusatz-Anweisungen</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.6 }}>
                  Dieser Text wird bei <strong style={{ color: "#999" }}>jeder Persona</strong> zusätzlich zum jeweiligen System Prompt mitgeschickt.
                  Ideal z.B. um festzulegen, dass der Bot seinen Charakter und seine Anforderungen nicht zu offensichtlich preisgibt.
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={lStyle}>Anweisungen (gelten für alle 3 Personas)</label>
                  <span style={{ fontSize: 11, color: "#444" }}>{globalDraft?.length || 0} Zeichen</span>
                </div>
                <textarea value={globalDraft} onChange={e => setGlobalDraft(e.target.value)}
                  rows={16} style={{ ...iStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.65 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveGlobal} style={{
                  padding: "12px 28px", background: globalSaved ? "#00A878" : "#4361EE",
                  border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "background 0.3s"
                }}>{globalSaved ? "✓ Gespeichert!" : "Anweisungen speichern"}</button>
                <button onClick={() => setGlobalDraft(globalInstructions)} style={{ padding: "12px 20px", background: "transparent", border: "1px solid #2A2A3E", borderRadius: 10, color: "#666", cursor: "pointer", fontSize: 14 }}>Zurücksetzen</button>
              </div>
            </div>
          )}

          {/* Editor: PERSONA */}
          {view === "persona" && ed && (
            <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Basic fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lStyle}>Name der Person</label>
                  <input value={ed.name} onChange={e => setEd(x => ({ ...x, name: e.target.value }))} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Rolle / Position</label>
                  <input value={ed.role} onChange={e => setEd(x => ({ ...x, role: e.target.value }))} style={iStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lStyle}>Kurzbeschreibung (Karte)</label>
                  <input value={ed.description} onChange={e => setEd(x => ({ ...x, description: e.target.value }))} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Schwierigkeit</label>
                  <select value={ed.difficulty} onChange={e => setEd(x => ({ ...x, difficulty: e.target.value }))} style={{ ...iStyle, cursor: "pointer" }}>
                    <option>Leicht</option><option>Mittel</option><option>Schwer</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Akzentfarbe</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={ed.color} onChange={e => setEd(x => ({ ...x, color: e.target.value }))} style={{ width: 44, height: 36, borderRadius: 8, border: "none", cursor: "pointer", background: "none" }} />
                    <span style={{ color: "#555", fontSize: 12 }}>{ed.color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={lStyle}>Aufgabe / Ziel für die Studierenden</label>
                <input value={ed.goal} onChange={e => setEd(x => ({ ...x, goal: e.target.value }))} style={iStyle} />
              </div>

              {/* Tab switcher */}
              <div style={{ display: "flex", gap: 4, background: "#0A0A14", borderRadius: 10, padding: 4, border: "1px solid #2A2A3E" }}>
                {[["persona", "🎭 System Prompt (Charakter)"], ["evaluator", "📊 Bewertungsschlüssel"]].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: tab === id ? ed.color : "transparent", color: tab === id ? "white" : "#666", transition: "all 0.2s"
                  }}>{label}</button>
                ))}
              </div>

              {tab === "persona" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={lStyle}>System Prompt — definiert Charakter, Reaktionen, Verhalten der KI-Persona</label>
                    <span style={{ fontSize: 11, color: "#444" }}>{ed.systemPrompt?.length || 0} Zeichen</span>
                  </div>
                  <textarea value={ed.systemPrompt} onChange={e => setEd(x => ({ ...x, systemPrompt: e.target.value }))}
                    rows={14} style={{ ...iStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.65 }} />
                  <div style={{ marginTop: 8, padding: "10px 14px", background: "#0D0D1A", borderRadius: 8, border: "1px solid #1A1A2E", fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                    💡 Tipp: Beschreibe Persönlichkeit, Ängste/Ziele (Eisberg-Modell), und wie die Person auf jede der 10 Überzeugungstechniken reagiert. Lass Studierende die Person nicht zu leicht überzeugen.
                  </div>
                </div>
              )}

              {tab === "evaluator" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={lStyle}>Bewertungsschlüssel — gibt der KI vor, wie das Gespräch benotet wird</label>
                    <span style={{ fontSize: 11, color: "#444" }}>{ed.evaluatorKey?.length || 0} Zeichen</span>
                  </div>
                  <textarea value={ed.evaluatorKey} onChange={e => setEd(x => ({ ...x, evaluatorKey: e.target.value }))}
                    rows={14} style={{ ...iStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.65 }} />
                  <div style={{ marginTop: 8, padding: "10px 14px", background: "#0D0D1A", borderRadius: 8, border: "1px solid #1A1A2E", fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                    💡 Tipp: Liste passende & unpassende Techniken auf, Kommunikationsfallen, und was "Erfolg" bei dieser Person bedeutet. Dieser Text ist nur für die Auswertungs-KI sichtbar — nicht für Studierende.
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={save} style={{
                  padding: "12px 28px", background: saved ? "#00A878" : "#4361EE",
                  border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "background 0.3s"
                }}>{saved ? "✓ Gespeichert!" : "Änderungen speichern"}</button>
                <button onClick={() => { setEd({ ...sel }); setSaved(false); }} style={{ padding: "12px 20px", background: "transparent", border: "1px solid #2A2A3E", borderRadius: 10, color: "#666", cursor: "pointer", fontSize: 14 }}>Zurücksetzen</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────
function ScenarioCard({ scenario, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: "#0D0D1A", border: `1px solid ${hover ? scenario.color + "66" : "#1E1E2E"}`,
      borderRadius: 18, padding: 28, cursor: "pointer", transform: hover ? "translateY(-4px)" : "none",
      boxShadow: hover ? `0 16px 40px ${scenario.color}22` : "none", transition: "all 0.25s ease"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${scenario.color}22`, border: `1px solid ${scenario.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>◈</div>
        <span style={{ fontSize: 12, fontWeight: 700, color: DIFFICULTY_COLORS[scenario.difficulty], background: `${DIFFICULTY_COLORS[scenario.difficulty]}18`, padding: "4px 10px", borderRadius: 20 }}>{scenario.difficulty}</span>
      </div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#E8E8F0", marginBottom: 2 }}>{scenario.name}</div>
      <div style={{ fontSize: 13, color: scenario.color, marginBottom: 10 }}>{scenario.role}</div>
      <div style={{ color: "#777", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{scenario.description}</div>
      <div style={{ fontSize: 13, color: "#999", borderTop: "1px solid #1E1E2E", paddingTop: 14, lineHeight: 1.5 }}>🎯 {scenario.goal}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SETUP SCREEN — Anbieter & API-Key wählen (beim ersten Start)
// ─────────────────────────────────────────────────────────────────────────
function SetupScreen({ initial, onSave, onCancel }) {
  const startProvider = initial?.provider || STANDARD_ANBIETER;
  const [provider, setProvider] = useState(startProvider);
  const [apiKey, setApiKey] = useState(initial?.apiKey || "");
  const [model, setModel] = useState(initial?.model || STANDARD_MODELL || PROVIDERS[startProvider].defaultModel);

  function pickProvider(p) {
    setProvider(p);
    setModel(PROVIDERS[p].defaultModel);
  }

  const prov = PROVIDERS[provider];
  const canSave = apiKey.trim().length > 5;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,20,0.95)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", padding: 20 }}>
      <div style={{ background: "#0F0F1A", border: "1px solid #2A2A3E", borderRadius: 20, width: "min(560px,96vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 80px rgba(0,0,0,0.8)", padding: 32 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#E8E8F0", marginBottom: 6 }}>Willkommen 👋</div>
        <p style={{ color: "#888", fontSize: 15, lineHeight: 1.6, marginTop: 0, marginBottom: 24 }}>
          Wähle einen KI-Anbieter und gib deinen eigenen API-Key ein. Der Key wird <strong style={{ color: "#BBB" }}>nur in deinem Browser</strong> gespeichert und direkt an den Anbieter geschickt — niemals an uns oder einen Server.
        </p>

        <label style={lStyle}>1. KI-Anbieter</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {Object.entries(PROVIDERS).map(([id, p]) => (
            <div key={id} onClick={() => pickProvider(id)} style={{
              padding: "12px 14px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: provider === id ? "#1A1A2E" : "#0A0A14",
              border: `1px solid ${provider === id ? "#4361EE" : "#2A2A3E"}`,
              color: provider === id ? "#E8E8F0" : "#888", transition: "all 0.15s"
            }}>{p.label}</div>
          ))}
        </div>

        <label style={lStyle}>2. Modell</label>
        <input list="model-list" value={model} onChange={e => setModel(e.target.value)} style={{ ...iStyle, marginBottom: 6 }} />
        <datalist id="model-list">
          {prov.models.map(m => <option key={m} value={m} />)}
        </datalist>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>Vorschläge erscheinen beim Klick. Eigenes Modell eintippen ist auch möglich.</div>

        <label style={lStyle}>3. API-Key</label>
        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={prov.keyPlaceholder} style={{ ...iStyle, marginBottom: 6 }} />
        <div style={{ fontSize: 12, color: "#555", marginBottom: 24 }}>
          Key bekommst du hier: <a href={prov.keyUrl} target="_blank" rel="noreferrer" style={{ color: "#4361EE" }}>{prov.keyUrl.replace("https://", "")}</a>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button disabled={!canSave} onClick={() => onSave({ provider, apiKey: apiKey.trim(), model: model.trim() || prov.defaultModel })} style={{
            flex: 1, padding: "14px", background: canSave ? "linear-gradient(135deg,#4361EE,#7B2FBE)" : "#222230",
            border: "none", borderRadius: 10, color: canSave ? "white" : "#555", cursor: canSave ? "pointer" : "default", fontSize: 15, fontWeight: 700
          }}>Loslegen</button>
          {onCancel && (
            <button onClick={onCancel} style={{ padding: "14px 20px", background: "transparent", border: "1px solid #2A2A3E", borderRadius: 10, color: "#888", cursor: "pointer", fontSize: 15 }}>Abbrechen</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState(null);
  const [scenarios, setScenarios] = useState(SCENARIOS);
  const [globalInstructions, setGlobalInstructions] = useState(DEFAULT_GLOBAL_INSTRUCTIONS);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [config, setConfig] = useState(() => loadConfig());
  const [showSetup, setShowSetup] = useState(false);
  const hasFixedKey = !!getFixedConfig();

  // Beim ersten Start ohne Konfiguration (und ohne festen Backend-Key): Setup zeigen
  useEffect(() => { if (!config) setShowSetup(true); }, [config]);

  function handleSaveConfig(c) {
    saveConfig(c);
    setConfig(c);
    setShowSetup(false);
  }

  function tryUnlock() {
    if (pin === ADMIN_PIN) { setAdminUnlocked(true); setShowAdmin(true); setPin(""); }
    else { setPinError(true); setTimeout(() => setPinError(false), 900); }
  }

  // Setup-Screen blockiert alles bis konfiguriert
  if (showSetup || !config) {
    return <SetupScreen initial={config} onSave={handleSaveConfig} onCancel={config ? () => setShowSetup(false) : null} />;
  }

  if (active) return <ChatView scenario={active} globalInstructions={globalInstructions} onBack={() => setActive(null)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#08080F", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#E8E8F0" }}>
      {showAdmin && <AdminPanel scenarios={scenarios} setScenarios={setScenarios} globalInstructions={globalInstructions} setGlobalInstructions={setGlobalInstructions} onClose={() => setShowAdmin(false)} />}

      <div style={{ padding: "60px 40px 40px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Hero row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#FF6B35", background: "#FF6B3518", border: "1px solid #FF6B3533", borderRadius: 20, padding: "6px 14px", marginBottom: 20 }}>
              {APP_TEXTE.banner}
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 400, lineHeight: 1.15, margin: 0, letterSpacing: "-1px" }}>
              {APP_TEXTE.titel}<span style={{ background: "linear-gradient(90deg,#FF6B35,#7B2FBE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{APP_TEXTE.titelFarbig}</span>
            </h1>
            <p style={{ color: "#777", marginTop: 16, fontSize: 17, lineHeight: 1.6, maxWidth: 560 }}>
              {APP_TEXTE.beschreibung}
            </p>
          </div>

          {/* Admin access */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {!adminUnlocked ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && tryUnlock()}
                  placeholder="Admin-PIN" style={{
                    padding: "10px 14px", background: "#12121E", border: `1px solid ${pinError ? "#E63946" : "#2A2A3E"}`,
                    borderRadius: 10, color: "#E8E8F0", fontSize: 14, width: 140, outline: "none", transition: "border-color 0.2s"
                  }} />
                <button onClick={tryUnlock} style={{ padding: "10px 16px", background: "#1A1A28", border: "1px solid #2A2A3E", borderRadius: 10, color: "#888", cursor: "pointer", fontSize: 16 }}>🔒</button>
              </div>
            ) : (
              <button onClick={() => setShowAdmin(true)} style={{ padding: "10px 20px", background: "linear-gradient(135deg,#4361EE,#7B2FBE)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                ⚙️ Admin Panel
              </button>
            )}
            <div style={{ fontSize: 11, color: "#444" }}>{adminUnlocked ? "Admin-Zugang aktiv" : `PIN: ${ADMIN_PIN} (änderbar in EINSTELLUNGEN.js)`}</div>
            {!hasFixedKey && (
              <button onClick={() => setShowSetup(true)} style={{ marginTop: 4, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
                KI-Anbieter wechseln ({PROVIDERS[config.provider].label})
              </button>
            )}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
          {scenarios.map(s => <ScenarioCard key={s.id} scenario={s} onClick={() => setActive(s)} />)}
        </div>

        <div style={{ marginTop: 40, padding: 22, background: "#0D0D1A", border: "1px solid #1E1E2E", borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#555", marginBottom: 10, textTransform: "uppercase" }}>So funktioniert's</div>
          <div style={{ color: "#888", fontSize: 14, lineHeight: 1.8 }}>
            {APP_TEXTE.anleitung}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 36, color: "#2A2A3E", fontSize: 13 }}>
          {APP_TEXTE.fusszeile}
        </div>
      </div>
    </div>
  );
}
