# flow.md

## Genel Akış
- Tetikleyici → Uygulama açılışı.
- İşlem → `src/app.js` bootstrap + router mount.
- State → store/localStorage yüklenir.
- UI → shell/page/components çizilir.
- Sonuç → kullanıcı etkileşimi başlar.

## Sayfa Akışları
- Chat: Tetikleyici: mesaj gönderimi → İşlem: chat service çağrısı → State: chatSlice mesaj güncellemesi → UI: ChatView render → Sonuç: yanıt/citation.
- Video: Tetikleyici: üretim → İşlem: video job başlat/poll → State: videoSlice progress/status → UI: VideoJobCard/Gallery → Sonuç: video veya hata.
- Billing/Usage: Tetikleyici: billing/usage route → İşlem: usage servisleri → State: billing/admin slice → UI: özet kartlar → Sonuç: maliyet görünür.

## Service Akışları
- Tetikleyici → page/effect çağrısı.
- İşlem → input doğrulama + timeout + normalize.
- State → effect dispatch.
- UI → toast/status/modal.
- Sonuç → başarılı veri veya hatalı fallback.

## State/Store Akışları
- Tetikleyici → action dispatch.
- İşlem → reducer immutable state üretir.
- State → subscriber tetiklenir.
- UI → yeniden render.
- Sonuç → tutarlı görünüm.

## Auth/Guard
- Tetikleyici → login/logout/session restore.
- İşlem → `puterAuth` normalize eder.
- State → app/admin alanları güncellenir.
- UI → kullanıcı bilgisi/forbidden/paywall görünümü.
- Sonuç → yetkili veya sınırlı akış.
- Not: `src/utils/guard.js` ve `utils/guard.js` mevcut; aktif import zinciri görünmedi (opsiyonel entegrasyon).

## Hata Akışları
- Ağ kesintisi → İşlem: error map → State: error flag → UI: “İşlem tamamlanamadı.” → Sonuç: tekrar dene.
- Timeout → İşlem: abort/retryable flag → State: failed/canceled → UI: retry önerisi → Sonuç: kontrollü tekrar.
- Model erişim yok → İşlem: fallback model → State: selectedModel güncelle → UI: kısa uyarı → Sonuç: uyumlu modelle devam.
- Tool uyumsuzluk → İşlem: matrix ile auto-off → State: toolsByThread düzeltme → UI: toast → Sonuç: geçerli kombinasyon.
- Draft kaybı riski → İşlem: route bazlı save/restore → State: draftsByRoute → UI: input geri dolar → Sonuç: veri kaybı yok.

## Telemetry
- Tetikleyici → kritik event/hata.
- İşlem → `logEvent` payload üretir.
- State → telemetry tercihi kontrol edilir.
- UI → gerekli ise sessiz/rozetli bilgi.
- Sonuç → izlenebilirlik.

## i18n Akışı
- Tetikleyici → dil seçimi.
- İşlem → translation service + sözlük çözümü.
- State → dil/cache güncelleme.
- UI → metin yenilenir.
- Sonuç → çok dilli akış.

## Ödeme Akışı
- Tetikleyici → billing/usage talebi.
- İşlem → usage normalize + diff hesap.
- State → billingSlice amounts/alerts.
- UI → ödeme sağlayıcı + TL/USD kartları.
- Sonuç → maliyet görünürlüğü.

## Video Job Akışı
- Tetikleyici → video üretimi başlat.
- İşlem → `createVideoJob` + `runVideoJob`.
- State → progress/status/result/error güncellemesi.
- UI → job card + galeri.
- Sonuç → başarıda medya, hatada retry/cancel.
