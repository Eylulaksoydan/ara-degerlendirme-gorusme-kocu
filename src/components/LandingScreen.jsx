import TimelineMark from "./TimelineMark.jsx";

export default function LandingScreen({ onSelect }) {
  return (
    <div className="adk-landing">
      <div className="adk-landing-inner">
        <div className="adk-landing-eyebrow">PERFORMANS ARA DEĞERLENDİRME</div>
        <h1 className="adk-landing-title">Görüşme Koçu</h1>
        <TimelineMark />
        <p className="adk-landing-sub">
          Görüşmeye girmeden önce ne söyleyeceğinizi netleştirin. Yaşadığınız durumu yazın, kullanabileceğiniz
          cümleyi birlikte hazırlayalım.
        </p>

        <div className="adk-role-grid">
          <div className="adk-role-card">
            <div className="adk-role-mono">Y</div>
            <div className="adk-role-title">Yöneticiyim</div>
            <div className="adk-role-desc">
              Çalışanınızla gerçekleştireceğiniz ara değerlendirme görüşmesine hazırlanmak için başlayın.
            </div>
            <button className="adk-btn adk-btn-primary adk-full" onClick={() => onSelect("manager")}>
              Çalışanımla Görüşmeye Hazırlan
            </button>
          </div>
          <div className="adk-role-card">
            <div className="adk-role-mono">Ç</div>
            <div className="adk-role-title">Çalışanım</div>
            <div className="adk-role-desc">
              Yöneticinizle gerçekleştireceğiniz ara değerlendirme görüşmesine hazırlanmak için başlayın.
            </div>
            <button className="adk-btn adk-btn-primary adk-full" onClick={() => onSelect("employee")}>
              Yöneticimle Görüşmeye Hazırlan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
