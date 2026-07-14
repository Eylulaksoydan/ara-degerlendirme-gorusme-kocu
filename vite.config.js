import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages bu proje için şu adreste yayınlanır:
// https://Eylulaksoydan.github.io/ara-degerlendirme-gorusme-kocu/
// Bu yüzden base yolu repository adıyla eşleşmelidir. Böylece derlenen
// dosyalar (JS/CSS) mutlak "/" yerine "/ara-degerlendirme-gorusme-kocu/"
// altında referanslanır ve alt dizinden açılınca beyaz ekran oluşmaz.
export default defineConfig({
  plugins: [react()],
  base: "/ara-degerlendirme-gorusme-kocu/",
});
