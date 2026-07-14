import { useState } from "react";

// Bu bileşen hiçbir anahtarı sabit kodlamaz. Kullanıcı anahtarını burada
// girer, değer yalnızca App bileşeninin React state'inde (bellekte) tutulur,
// diske veya kaynak koduna kaydedilmez.
export default function ApiKeyGate({ onSubmit }) {
  const [key, setKey] = useState("");
  return (
    <div className="adk-gate">
      <div className="adk-gate-box">
        <div className="adk-gate-title">Anthropic API Anahtarı</div>
        <p className="adk-gate-text">
          Bu uygulama, ara değerlendirme cümlelerini gerçek zamanlı olarak Claude ile üretir. Kullanabilmek
          için kendi Anthropic API anahtarınızı girmeniz gerekir. Anahtarınızı{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
            console.anthropic.com
          </a>{" "}
          üzerinden alabilirsiniz.
        </p>
        <input
          className="adk-gate-input"
          type="password"
          placeholder="sk-ant-..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <div className="adk-gate-warn">
          Anahtar yalnızca bu tarayıcı sekmesinde, oturum boyunca hafızada tutulur; diske veya sunucuya
          kaydedilmez. Anahtarınızı yalnızca güvendiğiniz bir cihazda girin.
        </div>
        <button
          className="adk-btn adk-btn-primary adk-full"
          onClick={() => key.trim() && onSubmit(key.trim())}
          disabled={!key.trim()}
        >
          Devam Et
        </button>
      </div>
    </div>
  );
}
