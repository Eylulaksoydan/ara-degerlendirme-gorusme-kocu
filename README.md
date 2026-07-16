# Ara Değerlendirme Görüşme Koçu — Ücretsiz Sürüm

Bu proje, performans ara değerlendirme görüşmeleri öncesinde yöneticilerin ve çalışanların kullanabileceği, API anahtarı ve kullanıcı girişi gerektirmeyen statik bir web uygulamasıdır.

## Temel özellikler

- Yönetici ve çalışan için ayrı kullanıcı akışı
- Kurumsal ve profesyonel Türkçe ifade önerileri
- Hedef gecikmesi, geri bildirime katılmama, inisiyatif, görünürlük, iş yükü, destek ihtiyacı ve gelişim gibi temel senaryolar
- Cümle dönüştürme
- Daha kısa, daha net ve daha diplomatik ifade seçenekleri
- Görüşme rehberi
- Mobil uyumlu tasarım
- Kullanıcı verilerini sunucuya göndermez
- API anahtarı, ücretli servis veya hesap girişi gerektirmez

## Önemli sınırlama

Bu sürüm gerçek bir yapay zekâ modeline bağlı değildir. Yanıtlar, rol ve senaryo sınıflandırmasına dayalı kurumsal bir kural motoruyla oluşturulur. Bu nedenle sınırsız serbest metin anlama veya her olası vakaya özgün yanıt üretme kabiliyeti yoktur.

## GitHub Pages ile yayınlama

1. GitHub'da yeni bir repository oluşturun.
2. Bu klasördeki dosyaların tamamını repository ana dizinine yükleyin:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. Repository içinde `Settings → Pages` bölümüne girin.
4. `Build and deployment` alanında:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/(root)`
5. `Save` butonuna basın.
6. Birkaç dakika sonra GitHub Pages bağlantınız oluşur.

Bu projede derleme veya GitHub Actions gerekmez.

## Gizlilik

Uygulama girilen metni sunucuya göndermez. Veriler tarayıcı belleğinde yalnızca mevcut kullanım sırasında tutulur. Yine de gerçek ad, sicil numarası, sağlık bilgisi veya hassas çalışan verileri girilmemelidir.
