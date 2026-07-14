import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, onCopied }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="adk-chip adk-chip-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          /* pano erişimi yoksa sessizce geç */
        }
        setCopied(true);
        onCopied && onCopied(text);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}
