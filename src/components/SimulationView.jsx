import { Send } from "lucide-react";

export default function SimulationView({
  role,
  simTopic,
  simMessages,
  simInput,
  setSimInput,
  simLoading,
  simEnded,
  simEvaluation,
  onSend,
  onEnd,
  onClose,
  simEndRef,
}) {
  const counterpartLabel = role === "manager" ? "Çalışan (canlandırma)" : "Yönetici (canlandırma)";
  return (
    <div className="adk-sim-wrap">
      <div className="adk-sim-header">
        <div>
          <div className="adk-side-label">Görüşme Provası</div>
          <div className="adk-topic-text">{simTopic}</div>
        </div>
        {!simEnded && (
          <button className="adk-btn adk-btn-outline" onClick={onEnd} disabled={simLoading || simMessages.length === 0}>
            Provayı Bitir
          </button>
        )}
        {simEnded && (
          <button className="adk-btn adk-btn-outline" onClick={onClose}>
            Provayı Kapat
          </button>
        )}
      </div>

      <div className="adk-chat">
        <div className="adk-msg adk-msg-ai">
          <div className="adk-bubble adk-bubble-ai adk-sim-tag">
            {counterpartLabel} rolündeyim. Görüşmeyi siz açın, ben karşılık vereceğim.
          </div>
        </div>
        {simMessages.map((m) => (
          <div key={m.id} className={`adk-msg ${m.sender === "user" ? "adk-msg-user" : "adk-msg-ai"}`}>
            <div className={`adk-bubble ${m.sender === "user" ? "adk-bubble-user" : "adk-bubble-ai"}`}>{m.text}</div>
          </div>
        ))}
        {simLoading && !simEnded && (
          <div className="adk-msg adk-msg-ai">
            <div className="adk-bubble adk-bubble-ai adk-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {simEnded && simEvaluation && (
          <div className="adk-eval-card">
            <div className="adk-eval-title">Prova Değerlendirmesi</div>
            <div className="adk-eval-row"><b>Mesajın açıklığı:</b> {simEvaluation.aciklik}</div>
            <div className="adk-eval-row"><b>Somutluk:</b> {simEvaluation.somutluk}</div>
            <div className="adk-eval-row"><b>Dinleme ve soru sorma:</b> {simEvaluation.dinleme}</div>
            <div className="adk-eval-row"><b>Savunma yaratma riski:</b> {simEvaluation.savunmaRiski}</div>
            <div className="adk-eval-row"><b>Beklentinin netliği:</b> {simEvaluation.beklentiNetligi}</div>
            <div className="adk-eval-row"><b>Aksiyonla kapatma:</b> {simEvaluation.aksiyonKapanisi}</div>
          </div>
        )}
        <div ref={simEndRef} />
      </div>

      {!simEnded && (
        <div className="adk-input-row">
          <textarea
            className="adk-textarea"
            placeholder="Görüşmede söyleyeceğiniz cümleyi yazın..."
            value={simInput}
            onChange={(e) => setSimInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={2}
          />
          <button className="adk-send-btn" onClick={onSend} disabled={simLoading || !simInput.trim()}>
            <Send size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
