import { useState, useRef, useEffect, useCallback } from "react";
import { MessagesSquare, BookOpen, RotateCcw, X, ChevronDown, ChevronUp, AlertTriangle, Send } from "lucide-react";

import ApiKeyGate from "./components/ApiKeyGate.jsx";
import LandingScreen from "./components/LandingScreen.jsx";
import SimulationView from "./components/SimulationView.jsx";
import CopyButton from "./components/CopyButton.jsx";

import { MANAGER_CARDS, EMPLOYEE_CARDS, QUICK_ACTIONS, GUIDE_TOPICS } from "./data/constants.js";
import {
  callClaude,
  parseJsonSafe,
  buildCoachSystemPrompt,
  buildSimSystemPrompt,
  buildEvalSystemPrompt,
} from "./lib/claudeApi.js";

export default function App() {
  const [apiKey, setApiKey] = useState(null);

  const [screen, setScreen] = useState("landing"); // landing | app
  const [role, setRole] = useState(null); // manager | employee
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCards, setShowCards] = useState(true);
  const [notes, setNotes] = useState([]);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);

  const [simActive, setSimActive] = useState(false);
  const [simSetupOpen, setSimSetupOpen] = useState(false);
  const [simTopic, setSimTopic] = useState("");
  const [simMessages, setSimMessages] = useState([]);
  const [simInput, setSimInput] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [simEnded, setSimEnded] = useState(false);
  const [simEvaluation, setSimEvaluation] = useState(null);

  const idRef = useRef(1);
  const nextId = () => idRef.current++;
  const chatEndRef = useRef(null);
  const simEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    simEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simMessages, simLoading, simEvaluation]);

  if (!apiKey) {
    return <ApiKeyGate onSubmit={setApiKey} />;
  }

  const startRole = (r) => {
    setRole(r);
    setScreen("app");
    setMessages([]);
    setTopic("");
    setShowCards(true);
    setNotes([]);
    setSimActive(false);
    setSimMessages([]);
    setSimEnded(false);
    setSimEvaluation(null);
  };

  const resetAll = () => {
    setScreen("landing");
    setRole(null);
  };

  const cards = role === "manager" ? MANAGER_CARDS : EMPLOYEE_CARDS;

  const buildApiMessages = useCallback((history, newUserApiText) => {
    const msgs = history.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.apiText || m.display,
    }));
    msgs.push({ role: "user", content: newUserApiText });
    return msgs;
  }, []);

  const sendMessage = async (displayText, apiTextOverride) => {
    const apiText = apiTextOverride || displayText;
    if (!apiText || !apiText.trim()) return;
    setError(null);
    setShowCards(false);
    if (!topic) setTopic(displayText.slice(0, 80));

    const userMsg = { id: nextId(), sender: "user", display: displayText, apiText };
    const historyForApi = [...messages];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = buildCoachSystemPrompt(role, topic || displayText);
      const apiMessages = buildApiMessages(historyForApi, apiText);
      const raw = await callClaude(apiKey, systemPrompt, apiMessages);
      const parsed = parseJsonSafe(raw);
      const aiMsg = {
        id: nextId(),
        sender: "ai",
        display: parsed.reply || "",
        apiText: parsed.reply || "",
        followUpOptions: Array.isArray(parsed.followUpOptions) ? parsed.followUpOptions : [],
        quickActions: Array.isArray(parsed.quickActions) ? parsed.quickActions : [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setError("Yapay zekâ yanıtı alınamadı: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  const handleCardClick = (card) => setInput(card.text);

  const handleQuickAction = (key) => {
    const action = QUICK_ACTIONS[key];
    if (!action || loading) return;
    sendMessage(action.label, action.instruction);
  };

  const handleFollowUpClick = (option) => {
    if (loading) return;
    sendMessage(option);
  };

  const addNote = (text) => {
    setNotes((prev) => (prev.includes(text) ? prev : [...prev, text]));
  };

  /* ---------------- Görüşme provası ---------------- */

  const openSimSetup = () => {
    setSimTopic(topic || "");
    setSimSetupOpen(true);
  };

  const startSimulation = () => {
    setSimSetupOpen(false);
    setSimActive(true);
    setSimMessages([]);
    setSimEnded(false);
    setSimEvaluation(null);
  };

  const buildSimApiMessages = (history, newUserText) => {
    const msgs = history.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));
    if (newUserText) msgs.push({ role: "user", content: newUserText });
    return msgs;
  };

  const sendSimMessage = async () => {
    if (!simInput.trim() || simLoading) return;
    const text = simInput.trim();
    const userMsg = { id: nextId(), sender: "user", text };
    const historyForApi = [...simMessages];
    setSimMessages((prev) => [...prev, userMsg]);
    setSimInput("");
    setSimLoading(true);
    setError(null);
    try {
      const systemPrompt = buildSimSystemPrompt(role, simTopic);
      const apiMessages = buildSimApiMessages(historyForApi, text);
      const raw = await callClaude(apiKey, systemPrompt, apiMessages);
      const parsed = parseJsonSafe(raw);
      setSimMessages((prev) => [...prev, { id: nextId(), sender: "ai", text: parsed.counterpartReply || "" }]);
    } catch (e) {
      setError("Prova yanıtı alınamadı: " + e.message);
    } finally {
      setSimLoading(false);
    }
  };

  const endSimulation = async () => {
    setSimLoading(true);
    setError(null);
    try {
      const transcript = simMessages
        .map((m) => `${m.sender === "user" ? "Kullanıcı" : "Karşı taraf"}: ${m.text}`)
        .join("\n");
      const systemPrompt = buildEvalSystemPrompt();
      const raw = await callClaude(apiKey, systemPrompt, [
        { role: "user", content: `Konu: ${simTopic}\n\nTranskript:\n${transcript}` },
      ]);
      const parsed = parseJsonSafe(raw);
      setSimEvaluation(parsed.evaluation || null);
      setSimEnded(true);
    } catch (e) {
      setError("Değerlendirme oluşturulamadı: " + e.message);
    } finally {
      setSimLoading(false);
    }
  };

  const closeSimulation = () => {
    setSimActive(false);
    setSimEnded(false);
    setSimEvaluation(null);
    setSimMessages([]);
  };

  /* ------------------------------------------------------------------ */

  const initialQuestion =
    role === "manager"
      ? "Ara değerlendirme görüşmesinde çalışanınızla hangi konuyu konuşmak istiyorsunuz? Yaşadığınız durumu veya söylemekte zorlandığınız cümleyi yazabilirsiniz."
      : "Ara değerlendirme görüşmesinde yöneticinizle hangi konuyu konuşmak istiyorsunuz? Aldığınız geri bildirimi, açıklamak istediğiniz durumu veya söylemekte zorlandığınız cümleyi yazabilirsiniz.";

  return (
    <div className="adk-root">
      {screen === "landing" && <LandingScreen onSelect={startRole} />}

      {screen === "app" && (
        <div className="adk-shell">
          <header className="adk-header">
            <div className="adk-header-left">
              <span className="adk-logo">Ara Değerlendirme Görüşme Koçu</span>
              <span className="adk-role-badge">{role === "manager" ? "Yönetici" : "Çalışan"}</span>
            </div>
            <div className="adk-header-right">
              <button className="adk-btn adk-btn-ghost" onClick={openSimSetup}>
                <MessagesSquare size={15} /> Görüşme Provası
              </button>
              <button className="adk-btn adk-btn-ghost" onClick={() => setGuideOpen(true)}>
                <BookOpen size={15} /> Görüşme Rehberi
              </button>
              <button className="adk-btn adk-btn-ghost mobile-only" onClick={() => setNotesOpen(true)}>
                Notlar {notes.length > 0 && <span className="adk-badge-count">{notes.length}</span>}
              </button>
              <button className="adk-btn adk-btn-ghost" onClick={resetAll} title="Rolü değiştir">
                <RotateCcw size={15} /> Rol değiştir
              </button>
            </div>
          </header>

          <div className="adk-body">
            {/* SOL PANEL */}
            <aside className="adk-sidebar-left desktop-only">
              <div className="adk-side-card">
                <div className="adk-side-label">Rolünüz</div>
                <div className="adk-side-value">{role === "manager" ? "Yönetici" : "Çalışan"}</div>
              </div>
              <div className="adk-side-card">
                <div className="adk-side-label">Görüşme konusu</div>
                <div className="adk-side-value adk-topic-text">{topic ? topic : "Henüz belirlenmedi"}</div>
              </div>
              <button className="adk-btn adk-btn-outline adk-full" onClick={() => setGuideOpen(true)}>
                <BookOpen size={15} /> Görüşme Rehberi
              </button>
              <button className="adk-btn adk-btn-outline adk-full" onClick={openSimSetup}>
                <MessagesSquare size={15} /> Görüşme Provası
              </button>
              <div className="adk-privacy-box">
                Lütfen gerçek isim, sicil numarası veya özel bilgi paylaşmayın. Yazdıklarınız yalnızca bu
                oturumda tutulur, kalıcı olarak saklanmaz.
              </div>
            </aside>

            {/* ORTA - SOHBET */}
            <main className="adk-main">
              {!simActive && (
                <>
                  <div className="adk-chat">
                    <div className="adk-msg adk-msg-ai">
                      <div className="adk-bubble adk-bubble-ai">{initialQuestion}</div>
                    </div>

                    {messages.map((m) => (
                      <div key={m.id} className={`adk-msg ${m.sender === "user" ? "adk-msg-user" : "adk-msg-ai"}`}>
                        <div className={`adk-bubble ${m.sender === "user" ? "adk-bubble-user" : "adk-bubble-ai"}`}>
                          {m.display}
                        </div>
                        {m.sender === "ai" && (
                          <div className="adk-actions-row">
                            <CopyButton text={m.display} onCopied={addNote} />
                            {(m.quickActions || []).map((key) =>
                              QUICK_ACTIONS[key] ? (
                                <button key={key} className="adk-chip" onClick={() => handleQuickAction(key)}>
                                  {QUICK_ACTIONS[key].label}
                                </button>
                              ) : null
                            )}
                          </div>
                        )}
                        {m.sender === "ai" && (m.followUpOptions || []).length > 0 && (
                          <div className="adk-followup-row">
                            {m.followUpOptions.map((opt, i) => (
                              <button key={i} className="adk-followup-chip" onClick={() => handleFollowUpClick(opt)}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="adk-msg adk-msg-ai">
                        <div className="adk-bubble adk-bubble-ai adk-typing">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {error && (
                    <div className="adk-error-banner">
                      <AlertTriangle size={15} /> {error}
                    </div>
                  )}

                  {showCards && (
                    <div className="adk-cards-wrap">
                      {cards.map((c, i) => (
                        <button key={i} className="adk-sample-card" onClick={() => handleCardClick(c)}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="adk-input-row">
                    <textarea
                      className="adk-textarea"
                      placeholder="Yaşadığınız durumu veya söylemek istediğiniz cümleyi yazın..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      rows={2}
                    />
                    <button className="adk-send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
                      <Send size={17} />
                    </button>
                  </div>
                  <div className="adk-privacy-note mobile-only">
                    Gerçek isim veya özel bilgi paylaşmayın. Bilgiler kalıcı olarak saklanmaz.
                  </div>
                </>
              )}

              {simActive && (
                <SimulationView
                  role={role}
                  simTopic={simTopic}
                  simMessages={simMessages}
                  simInput={simInput}
                  setSimInput={setSimInput}
                  simLoading={simLoading}
                  simEnded={simEnded}
                  simEvaluation={simEvaluation}
                  onSend={sendSimMessage}
                  onEnd={endSimulation}
                  onClose={closeSimulation}
                  simEndRef={simEndRef}
                />
              )}
            </main>

            {/* SAĞ PANEL */}
            <aside className="adk-sidebar-right desktop-only">
              <div className="adk-side-label" style={{ marginBottom: 10 }}>
                Görüşme notlarım
              </div>
              {notes.length === 0 ? (
                <div className="adk-notes-empty">Kopyaladığınız cümleler burada birikir.</div>
              ) : (
                <div className="adk-notes-list">
                  {notes.map((n, i) => (
                    <div key={i} className="adk-note-item">
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* NOTLAR - mobil çekmece */}
      {notesOpen && (
        <div className="adk-drawer-overlay" onClick={() => setNotesOpen(false)}>
          <div className="adk-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="adk-drawer-header">
              <span>Görüşme notlarım</span>
              <button className="adk-icon-btn" onClick={() => setNotesOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="adk-drawer-body">
              {notes.length === 0 ? (
                <div className="adk-notes-empty">Kopyaladığınız cümleler burada birikir.</div>
              ) : (
                notes.map((n, i) => (
                  <div key={i} className="adk-note-item">
                    {n}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* REHBER */}
      {guideOpen && (
        <div className="adk-drawer-overlay" onClick={() => setGuideOpen(false)}>
          <div className="adk-drawer adk-drawer-wide" onClick={(e) => e.stopPropagation()}>
            <div className="adk-drawer-header">
              <span>Görüşme Rehberi</span>
              <button className="adk-icon-btn" onClick={() => setGuideOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="adk-drawer-body">
              {GUIDE_TOPICS.map((g, i) => (
                <div key={i} className="adk-guide-item">
                  <button className="adk-guide-title" onClick={() => setGuideExpanded(guideExpanded === i ? null : i)}>
                    <span>{g.title}</span>
                    {guideExpanded === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {guideExpanded === i && <div className="adk-guide-body">{g.body}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROVA KURULUM */}
      {simSetupOpen && (
        <div className="adk-drawer-overlay" onClick={() => setSimSetupOpen(false)}>
          <div className="adk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adk-drawer-header">
              <span>Görüşme Provası</span>
              <button className="adk-icon-btn" onClick={() => setSimSetupOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="adk-modal-body">
              <p className="adk-modal-text">
                {role === "manager"
                  ? "Bu modda yapay zekâ çalışanınızı canlandırır. Siz görüşmeyi yönetici olarak yürütürsünüz."
                  : "Bu modda yapay zekâ yöneticinizi canlandırır. Siz görüşmeyi çalışan olarak yürütürsünüz."}
              </p>
              <label className="adk-side-label">Provada ele alınacak konu</label>
              <textarea
                className="adk-textarea adk-modal-textarea"
                placeholder="Örn. Hedefteki gecikmeyi savunmaya geçmeden anlatmak istiyorum"
                value={simTopic}
                onChange={(e) => setSimTopic(e.target.value)}
                rows={3}
              />
              <button className="adk-btn adk-btn-primary adk-full" onClick={startSimulation} disabled={!simTopic.trim()}>
                Provayı Başlat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
