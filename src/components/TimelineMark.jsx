export default function TimelineMark() {
  return (
    <svg width="220" height="28" viewBox="0 0 220 28" fill="none" style={{ display: "block", margin: "0 auto" }}>
      <line x1="4" y1="14" x2="216" y2="14" stroke="#2C3E58" strokeWidth="2" />
      <circle cx="4" cy="14" r="3" fill="#5C6B85" />
      <circle cx="216" cy="14" r="3" fill="#5C6B85" />
      <circle cx="110" cy="14" r="6" fill="#35B8AC" />
      <circle cx="110" cy="14" r="10" fill="none" stroke="#35B8AC" strokeWidth="1.5" opacity="0.5" />
      <text x="4" y="27" fontSize="9" fill="#7C8AA3">OCAK</text>
      <text x="196" y="27" fontSize="9" fill="#7C8AA3">ARALIK</text>
      <text x="93" y="8" fontSize="9" fill="#63D3C7" fontWeight="600">ŞİMDİ</text>
    </svg>
  );
}
