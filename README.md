# Ara Değerlendirme Görüşme Koçu

Performans ara değerlendirme görüşmelerine hazırlanan yöneticiler ve çalışanlar için hazırlık uygulaması.
Yaşanan durumu veya söylenmek istenen cümleyi yazınca, görüşmede doğrudan kullanılabilecek doğal ve
profesyonel Türkçe cümle önerileri üretir.

🔗 **Canlı adres:** https://Eylulaksoydan.github.io/ara-degerlendirme-gorusme-kocu/

## Özellikler

- **Yönetici / Çalışan** ayrı deneyimleri
- Soru-cevap akışıyla doğrudan kullanılabilir cümle önerileri
- Belirsiz durumlarda en fazla 2 kısa takip sorusu
- Hızlı aksiyonlar: daha doğal yaz, daha net yap, diplomatik yap, görüşme akışı oluştur vb.
- **Görüşme Provası:** yapay zekânın karşı tarafı (yönetici/çalışan) canlandırdığı, gerçekçi bir simülasyon
- **Görüşme Rehberi:** SBI tekniği, GROW modeli, aktif dinleme gibi kısa referans içerikleri
- Kopyalanan cümlelerin biriktiği "Görüşme notlarım" paneli
- Kalıcı veri kaydı yok; her şey yalnızca tarayıcı oturumunda tutulur

## Yapay zekâ nasıl çalışıyor?

Uygulama, Anthropic'in Claude modelini kullanır. Kod içinde **hiçbir API anahtarı bulunmaz** — uygulama
açıldığında kendi Anthropic API anahtarınızı girmeniz istenir. Anahtar yalnızca o tarayıcı sekmesinin
belleğinde tutulur, hiçbir yere kaydedilmez.

Anahtar almak için: https://console.anthropic.com

> Not: Anahtarınız doğrudan tarayıcıdan Anthropic API'sine gönderilir. Bu nedenle uygulamayı yalnızca
> güvendiğiniz cihazlarda ve kendi anahtarınızla kullanın; anahtarınızı başkalarıyla paylaşmayın.

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

## Derleme

```bash
npm run build
npm run preview
```

## GitHub Pages üzerinde yayınlama

Bu depo, `main` dalına her `push` yapıldığında GitHub Actions ile otomatik olarak derlenip
GitHub Pages'e yayınlanacak şekilde yapılandırılmıştır (`.github/workflows/deploy.yml`).

Depo ayarlarında tek seferlik yapılması gereken adım:

1. GitHub'da depo → **Settings** → **Pages**
2. **Build and deployment** → **Source** alanını **GitHub Actions** olarak seçin
3. `main` dalına bir `push` yapın; Actions sekmesinden dağıtımı izleyebilirsiniz

Yayına alındıktan sonra uygulama şu adreste çalışır:

```
https://Eylulaksoydan.github.io/ara-degerlendirme-gorusme-kocu/
```

## Proje yapısı

```
├── .github/workflows/deploy.yml   # GitHub Pages otomatik dağıtım
├── index.html                     # Vite kök HTML dosyası
├── vite.config.js                 # base: /ara-degerlendirme-gorusme-kocu/
├── package.json
└── src/
    ├── main.jsx                   # React giriş noktası
    ├── App.jsx                    # Ana uygulama mantığı
    ├── index.css                  # Tüm stiller
    ├── components/
    │   ├── ApiKeyGate.jsx
    │   ├── LandingScreen.jsx
    │   ├── SimulationView.jsx
    │   ├── CopyButton.jsx
    │   └── TimelineMark.jsx
    ├── data/
    │   └── constants.js           # Örnek kartlar, hızlı aksiyonlar, rehber içerikleri
    └── lib/
        └── claudeApi.js           # Claude API çağrıları ve sistem promptları
```

## Kapsam

Uygulama yalnızca performans **ara değerlendirme** görüşmelerini kapsar: hedef ilerlemesi, yetkinlik,
teknik uzmanlık, güçlü yönler, gelişim alanları, geri bildirim ve aksiyon planı. İşe alım, ücret, terfi,
disiplin, işten ayrılma veya mobbing soruşturması gibi konular kapsam dışıdır.
