# TIMELAPSE DEĞİŞİM RAPORU

Kapsam: Depodaki erişilebilir geçmişten son 50 commit tarandı (`git log --name-status --date=iso --pretty=format:"%h|%ad|%s"`). Ana referans çizgisi mevcut commit geçmişidir; ayrı bir `main` checkout yapılmadan repo içeriği üzerinden doğrulama yapıldı.

## A) GENEL TIMELINE

- [2026-03-03 12:50:35 +0300] (Commit `0670660`) **Create nisai.md** — Proje yönlendirme dokümanı başlangıçta eklendi.
  - Etkilenen ana dosyalar: `nisai.md`
  - Risk/Not: İçerik hızlı evrildi; güncel sürüm için son commit’e bakılmalı.

- [2026-03-03 13:31:55 +0300] (Commit `b4d9556`) **Create lib directory** — Kütüphane klasörü için placeholder oluşturuldu.
  - Etkilenen ana dosyalar: `lib/.gitkeep`
  - Risk/Not: Fonksiyonel kod yok, sadece klasörün repoda kalması sağlandı.

- [2026-03-03 13:32:06 +0300] (PR Merge `#1`, commit `c590ea1`) **Merge pull request #1 from salihcelebi/codex/add-lib-directory-to-repo** — `lib` klasörü ana çizgiye alındı.
  - Etkilenen ana dosyalar: `lib/.gitkeep` (PR içeriği)
  - Risk/Not: PR metadata’sı var; değişiklik kapsamı küçük.

- [2026-03-03 13:34:44 +0300] (Commit `1f87d46`) **Update nisai.md** — Gereksinim metni revize edildi.
  - Etkilenen ana dosyalar: `nisai.md`
  - Risk/Not: Doküman bazlı değişiklik, kod etkisi dolaylı.

- [2026-03-03 13:35:27 +0300] (Commit `10a5ec0`) **Update nisai.md** — İkinci hızlı düzenleme yapıldı.
  - Etkilenen ana dosyalar: `nisai.md`
  - Risk/Not: Ardışık revizyonlar nedeniyle versiyon farkı dikkat ister.

- [2026-03-03 13:35:44 +0300] (Commit `250efad`) **Update nisai.md** — Üçüncü düzenleme ile metin netleştirildi.
  - Etkilenen ana dosyalar: `nisai.md`
  - Risk/Not: Nihai yorum için bir sonraki commit ile birlikte okunmalı.

- [2026-03-03 13:46:02 +0300] (Commit `6bc4fb8`) **Update nisai.md** — Dokümanın bu repodaki en güncel sürümü yazıldı.
  - Etkilenen ana dosyalar: `nisai.md`
  - Risk/Not: Uygulama kodunda belirsiz kalan alanlar bu dosyada ayrıca netleştirilmeli.

- [2026-03-03 11:28:29 +0000] (Commit `cbe040f`) **Add modular SPA shell, service-layer architecture, multilingual runtime and smoke tests** — Uygulama kabuğu, modüler JS mimarisi, servis/store katmanı ve temel test seti toplu olarak eklendi.
  - Etkilenen ana dosyalar: `index.html`, `src/**`, `tests/smoke.mjs`, `package.json`
  - Risk/Not: Birçok dosya tek committe eklendiği için sonraki bakımda küçük parçalara bölerek ilerlemek daha güvenli olur.

## B) DOSYA KATALOĞU (DOSYA DOSYA)

- DOSYA: `/nisai.md`
  - ROLÜ: Ürün, mimari ve UX gereksinimlerinin ana referans metni.
  - İLK EKLENME: `0670660`, 2026-03-03T12:50:35+03:00
  - ÖNEMLİ DEĞİŞİMLER: `1f87d46`, `10a5ec0`, `250efad`, `6bc4fb8` (2026-03-03) -> Metin art arda güncellenip netleştirildi.
  - BAĞLANTILAR: Tüm `src/` tasarım kararlarını yönlendirir.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Bu dosya bizzat netleştirme kaynağıdır.
  - TEST/SMOKE: Doğrudan test yok.

- DOSYA: `/lib/.gitkeep`
  - ROLÜ: `lib/` klasörünü depoda kalıcı tutan placeholder.
  - İLK EKLENME: `b4d9556`, 2026-03-03T13:31:55+03:00
  - ÖNEMLİ DEĞİŞİMLER: `b4d9556` -> İlk ve tek ekleme.
  - BAĞLANTILAR: Şu an aktif modül bağlantısı yok.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Yok.
  - TEST/SMOKE: Yok.

- DOSYA: `/index.html`
  - ROLÜ: TopBar/Sidebar/Main/Toasts/Modals içeren SPA kabuk yapısı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Tüm kabuk ve mount alanları eklendi.
  - BAĞLANTILAR: `/src/app.js`, `/src/styles/global.css`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Build/bundler detayı `nisai.md` ile kesinleştirilmeli.
  - TEST/SMOKE: Görsel doğrulama local server + browser screenshot ile yapıldı.

- DOSYA: `/package.json`
  - ROLÜ: Node modül tipi ve test script tanımı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> `npm test` komutu tanımlandı.
  - BAĞLANTILAR: `/tests/smoke.mjs`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Yok.
  - TEST/SMOKE: `npm test` bu dosyadan tetiklenir.

- DOSYA: `/src/app.js`
  - ROLÜ: Uygulama bootstrap, event bağlama, route render, global handler merkezi.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Ctrl/⌘+K, G komutu, error handling, polling ve render akışı eklendi.
  - BAĞLANTILAR: `/src/router.js`, `/src/store/**`, `/src/services/**`, `/src/ui/components/**`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Başlık açıklamasında NISAI referansı var; entegrasyon detayları servis katmanında tamamlanmalı.
  - TEST/SMOKE: `node --check src/app.js`.

- DOSYA: `/src/router.js`
  - ROLÜ: Hash route -> sayfa renderer eşleştirmesi.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Route tablosu ve outlet render eklendi.
  - BAĞLANTILAR: `/src/pages/*.js`, `/src/app.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Router API genişletme kuralları `nisai.md` ile kesinleşmeli.
  - TEST/SMOKE: `node --check src/router.js`.

- DOSYA: `/src/config/i18n.js`
  - ROLÜ: Varsayılan dil ve TR/EN sabit sözlükler.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Default language ve dictionary objeleri eklendi.
  - BAĞLANTILAR: `/src/services/translationService.js`, `/src/app.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Ek dil sözlük kapsamı büyütülecekse `nisai.md` üzerinden netleşmeli.
  - TEST/SMOKE: Dolaylı olarak `npm test` akışında kullanılır.

- DOSYA: `/src/services/aiService.js`
  - ROLÜ: Model listeleme cache’i ve generate servis kapısı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> `listModelsWithCache` ve `generateByMode` eklendi.
  - BAĞLANTILAR: `/src/app.js`, gelecekte Puter SDK entegrasyonu.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: `listModels`, `txt2vid`, chat completion alan adları ve TTL politikası.
  - TEST/SMOKE: Doğrudan test yok.

- DOSYA: `/src/services/usageService.js`
  - ROLÜ: Monthly usage snapshot, diff hesabı ve microcents->USD formatlama.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> `fetchMonthlyUsage`, `beginDiff`, `computeDiff`, `microcentsToUsd` eklendi.
  - BAĞLANTILAR: `/src/app.js`, `/tests/smoke.mjs`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Gerçek MonthlyUsage alan adları ve Puter obje mapping.
  - TEST/SMOKE: `tests/smoke.mjs` içinde fonksiyonlar doğrulanıyor.

- DOSYA: `/src/services/translationService.js`
  - ROLÜ: Dil seçimi, sözlük okuma, otomatik çeviri cache/fallback mantığı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> localStorage + memory cache ve translate fonksiyonu eklendi.
  - BAĞLANTILAR: `/src/config/i18n.js`, `/src/store/slices/appSlice.js`, `/src/app.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Dış çeviri sağlayıcısı/endpoint seçimi.
  - TEST/SMOKE: `node --check src/services/translationService.js`.

- DOSYA: `/src/services/telemetryService.js`
  - ROLÜ: Tek noktadan event log arayüzü.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> `logEvent` fonksiyonu eklendi.
  - BAĞLANTILAR: `/src/app.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Hedef telemetry sistemi (endpoint/SaaS).
  - TEST/SMOKE: Doğrudan test yok.

- DOSYA: `/src/store/index.js`
  - ROLÜ: Basit global state, subscribe ve dispatch mekanizması.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Store çekirdeği eklendi.
  - BAĞLANTILAR: `/src/app.js`, `/src/store/slices/appSlice.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Ölçek büyürse slice middleware stratejisi netleşmeli.
  - TEST/SMOKE: Dolaylı test.

- DOSYA: `/src/store/slices/appSlice.js`
  - ROLÜ: Uygulama route/mode/language/usage state alanları ve aksiyonları.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> `refreshUsage` ve `setAppLanguage` eklendi.
  - BAĞLANTILAR: `/src/services/usageService.js`, `/src/services/translationService.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Yetki/rol ve kapsamlı state şeması.
  - TEST/SMOKE: Dolaylı test.

- DOSYA: `/src/ui/components/toasts.js`
  - ROLÜ: Global toast üretimi ve otomatik kapanma.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> toast manager eklendi.
  - BAĞLANTILAR: `/src/app.js`, `/index.html#toasts`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Toast queue limiti/stratejisi.
  - TEST/SMOKE: Doğrudan test yok.

- DOSYA: `/src/ui/components/modals.js`
  - ROLÜ: Modal kapanış (ESC) davranışlarının merkezi.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> ESC kapanış helper eklendi.
  - BAĞLANTILAR: `/src/app.js`, `/index.html#modals`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Focus return/focus trap standardı genişletilebilir.
  - TEST/SMOKE: Doğrudan test yok.

- DOSYA: `/src/ui/components/pageHeader.js`
  - ROLÜ: Standart sayfa başlığı ve sağ aksiyon alanı render eder.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Header şablonu eklendi.
  - BAĞLANTILAR: `/src/app.js`, `/index.html#page-header`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Aksiyon slot kontratı netleşebilir.
  - TEST/SMOKE: Doğrudan test yok.

- DOSYA: `/src/pages/chatPage.js`
  - ROLÜ: Chat route içeriği.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Chat sayfa kartı eklendi.
  - BAĞLANTILAR: `/src/router.js`, `/src/app.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Gerçek prompt/generate form sözleşmesi.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/pages/videoPage.js`
  - ROLÜ: Video route içeriği ve lazy-load hook noktası.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Video paneli ve async render akışı eklendi.
  - BAĞLANTILAR: `/src/router.js`, `/src/services/aiService.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Queue/cancel/retry davranış ayrıntısı.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/pages/historyPage.js`
  - ROLÜ: History route boş durum marker’ı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> `data-empty` işareti eklendi.
  - BAĞLANTILAR: `/src/app.js` empty-state toggling.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Gerçek geçmiş veri modeli.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/pages/assetsPage.js`
  - ROLÜ: Assets route için başlangıç paneli.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Basit assets kartı eklendi.
  - BAĞLANTILAR: `/src/router.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Chip/veri kaynağı sözleşmesi.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/pages/modelsPage.js`
  - ROLÜ: Models yönetim ekranı placeholder’ı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Models kartı eklendi.
  - BAĞLANTILAR: `/src/router.js`, `/src/services/aiService.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Filtre/sıralama ve preset modeli.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/pages/usagePage.js`
  - ROLÜ: Usage & Credits ekranı placeholder’ı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Usage panel kartı eklendi.
  - BAĞLANTILAR: `/src/services/usageService.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Maliyet metriklerinin detay görünümü.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/pages/billingPage.js`
  - ROLÜ: Billing route placeholder’ı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Billing panel kartı eklendi.
  - BAĞLANTILAR: `/src/router.js`, `/index.html#billing-action`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Ödeme sağlayıcı akışı.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/pages/adminPage.js`
  - ROLÜ: Admin route placeholder’ı.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Admin panel kartı eklendi.
  - BAĞLANTILAR: `/src/app.js` role-based görünürlük.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Admin yetki modeli.
  - TEST/SMOKE: Görsel smoke kapsamında.

- DOSYA: `/src/styles/global.css`
  - ROLÜ: Token tabanlı global stil, layout, responsive ve katman stilleri.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> Topbar/sidebar/main, focus, toast, loader stilleri eklendi.
  - BAĞLANTILAR: `/index.html`, tüm UI bileşenleri.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: İleri tasarım token seti genişletilebilir.
  - TEST/SMOKE: Görsel screenshot ile doğrulandı.

- DOSYA: `/tests/smoke.mjs`
  - ROLÜ: Usage servisindeki temel hesapların hızlı doğrulaması.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `cbe040f` -> USD format ve diff hesabı assert edildi.
  - BAĞLANTILAR: `/src/services/usageService.js`.
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Ek route/i18n smoke testleri eklenebilir.
  - TEST/SMOKE: `npm test`.

## C) “GÖRSEL TIMELAPSE” METNİ (6–12 ADIM)

1) **Neden:** Proje hedeflerini tek kaynakta toplamak gerekiyordu. **Ne:** `nisai.md` ilk kez eklendi. **Dosyalar:** `/nisai.md`.
2) **Neden:** Boş `lib` klasörünün repoda kalması gerekiyordu. **Ne:** `.gitkeep` eklendi. **Dosyalar:** `/lib/.gitkeep`.
3) **Neden:** `lib` değişikliğini ana çizgiye almak gerekiyordu. **Ne:** PR #1 merge edildi. **Dosyalar:** `/lib/.gitkeep`.
4) **Neden:** Gereksinimler olgunlaştıkça metin güncellendi. **Ne:** `nisai.md` dört ardışık commit ile revize edildi. **Dosyalar:** `/nisai.md`.
5) **Neden:** Tek sayfa stüdyo kabuğu hedeflendi. **Ne:** TopBar/Sidebar/Main/Toasts/Modals içeren `index.html` eklendi. **Dosyalar:** `/index.html`.
6) **Neden:** Davranışı HTML’den ayırmak gerekiyordu. **Ne:** Bootstrap ve event akışları `src/app.js` içinde toplandı. **Dosyalar:** `/src/app.js`.
7) **Neden:** Navigasyon ve sayfa ayrımı isteniyordu. **Ne:** Hash router ve route sayfaları eklendi. **Dosyalar:** `/src/router.js`, `/src/pages/*`.
8) **Neden:** UI’nin servisleri doğrudan çağırmaması gerekiyordu. **Ne:** AI/usage/translation/telemetry servis katmanı eklendi. **Dosyalar:** `/src/services/*`.
9) **Neden:** State yönetimi modüler olmalıydı. **Ne:** Store çekirdeği ve app slice oluşturuldu. **Dosyalar:** `/src/store/index.js`, `/src/store/slices/appSlice.js`.
10) **Neden:** Profesyonel görsel ritim ve erişilebilirlik gerekiyordu. **Ne:** Token tabanlı global CSS ve responsive yapı yazıldı. **Dosyalar:** `/src/styles/global.css`.
11) **Neden:** Hızlı doğrulama olmadan bakım zorlaşır. **Ne:** Smoke test ve npm test komutu eklendi. **Dosyalar:** `/tests/smoke.mjs`, `/package.json`.
12) **Neden:** Belirsiz entegrasyonları işaretlemek gerekiyordu. **Ne:** Kod içine “NISAI.MD’de netleştir” notları bırakıldı. **Dosyalar:** `/src/services/aiService.js`, `/src/services/usageService.js`, `/src/services/translationService.js`, `/src/services/telemetryService.js`.

---

## EK RAPOR — ROUTER İYİLEŞTİRME GÜNCELLEMESİ

Bu bölüm mevcut repo taraması üstüne, router odaklı son geliştirme turunu kronolojik olarak ekler.

### A) GENEL TIMELINE (EK)

- [2026-03-03T11:36:51+00:00] (Commit `bu-güncelleme-commit'i`) **Router kontratı sadeleştirildi ve test edilebilir hale getirildi** — Hash route parser, fallback ve mount akışı tek dosyada netleştirildi.
  - Etkilenen ana dosyalar: `src/router.js`, `src/app.js`, `src/pages/chatPage.js`, `src/pages/videoPage.js`, `src/pages/historyPage.js`, `src/pages/billingPage.js`, `src/pages/adminPage.js`, `tests/smoke.mjs`
  - Risk/Not: Query/param ve title sahipliği kararı için NISAI.MD’de netleştir.

### B) DOSYA KATALOĞU (EKLENEN SON BÜYÜK DEĞİŞİM)

- DOSYA: `/src/router.js`
  - ROLÜ: Pure parser + whitelist doğrulama + sayfa render orkestrasyonu + mount API.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> `normalizeRoute/isValidRoute/getCurrentRoute`, `navigateTo`, `renderCurrentRoute`, `mountRouter` ve destroy kontratı eklendi.
  - BAĞLANTILAR: `/src/app.js`, `/src/pages/{chat,video,history,billing,admin}Page.js`, `/tests/smoke.mjs`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Query params, popstate ve title sorumluluğu.
  - TEST/SMOKE: `tests/smoke.mjs` route parser assert’leri.

- DOSYA: `/src/app.js`
  - ROLÜ: Shell bootstrap + router mount + UI event koordinasyonu.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> Hashchange yönetimi router mount’a devredildi, mode değişiminde model picker refresh hook bağlandı.
  - BAĞLANTILAR: `/src/router.js`, `/src/services/*`, `/src/store/*`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Router/app sorumluluk sınırı ileride kesinleştirilmeli.
  - TEST/SMOKE: `node --check src/app.js`.

- DOSYA: `/src/pages/chatPage.js`
  - ROLÜ: Chat görünüm modülü.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> `render({els, store})` kontratına uyumlu export yapısı netleştirildi.
  - BAĞLANTILAR: `/src/router.js`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Gerçek form/aksiyon bağları.
  - TEST/SMOKE: Router render akışıyla dolaylı.

- DOSYA: `/src/pages/videoPage.js`
  - ROLÜ: Video görünüm modülü.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> Async `render` + opsiyonel `destroy` kontratı eklendi.
  - BAĞLANTILAR: `/src/router.js`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Ağır bileşen lazy-load detayları.
  - TEST/SMOKE: Router render akışıyla dolaylı.

- DOSYA: `/src/pages/historyPage.js`
  - ROLÜ: History boş durum paneli.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> `render` kontratına uyumlu hale getirildi.
  - BAĞLANTILAR: `/src/router.js`, `/src/app.js`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Geçmiş veri modeli.
  - TEST/SMOKE: Router render akışıyla dolaylı.

- DOSYA: `/src/pages/billingPage.js`
  - ROLÜ: Billing görünüm modülü.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> `render` kontratına uyumlu hale getirildi.
  - BAĞLANTILAR: `/src/router.js`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Ödeme akışı ayrıntıları.
  - TEST/SMOKE: Router render akışıyla dolaylı.

- DOSYA: `/src/pages/adminPage.js`
  - ROLÜ: Admin görünüm modülü.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> `render` kontratına uyumlu hale getirildi.
  - BAĞLANTILAR: `/src/router.js`, `/src/app.js`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: Rol doğrulama ayrıntıları.
  - TEST/SMOKE: Router render akışıyla dolaylı.

- DOSYA: `/tests/smoke.mjs`
  - ROLÜ: Temel smoke doğrulama.
  - İLK EKLENME: `cbe040f`, 2026-03-03T11:28:29+00:00
  - ÖNEMLİ DEĞİŞİMLER: `bu-güncelleme-commit'i`, `2026-03-03T11:36:47+00:00` -> Router pure parser fonksiyonları için minimal kritik testler eklendi.
  - BAĞLANTILAR: `/src/router.js`, `/src/services/usageService.js`
  - TODO / “NISAI.MD’de netleştir” NOTLARI: renderCurrentRoute mock testi genişletilebilir.
  - TEST/SMOKE: `npm test`.

### C) “GÖRSEL TIMELAPSE” METNİ (EK)

1) **Neden:** Router görev alanı dağınıktı. **Ne:** Pure parser yardımcıları eklendi. **Dosyalar:** `/src/router.js`.
2) **Neden:** Geçersiz rota davranışı net değildi. **Ne:** Whitelist + fallback `/chat` tanımlandı. **Dosyalar:** `/src/router.js`.
3) **Neden:** Sayfa modülleri standart değildi. **Ne:** `render({els, store})` kontratı zorlandı. **Dosyalar:** `/src/pages/chatPage.js`, `/src/pages/videoPage.js`, `/src/pages/historyPage.js`, `/src/pages/billingPage.js`, `/src/pages/adminPage.js`.
4) **Neden:** Sayfa geçişlerinde temizlik gerekiyordu. **Ne:** `destroy()` desteği eklendi. **Dosyalar:** `/src/router.js`, `/src/pages/chatPage.js`, `/src/pages/videoPage.js`.
5) **Neden:** Render hatasında kullanıcı çıkmazda kalıyordu. **Ne:** Error panel + retry akışı eklendi. **Dosyalar:** `/src/router.js`.
6) **Neden:** Bilinmeyen route görünürlüğü gerekiyordu. **Ne:** Not found paneli + Chat’a dönüş butonu eklendi. **Dosyalar:** `/src/router.js`.
7) **Neden:** Stale model picker sorunu vardı. **Ne:** `onModeChanged` callback’iyle model yenileme bağlandı. **Dosyalar:** `/src/router.js`, `/src/app.js`.
8) **Neden:** Router/app entegrasyonu sade olmalıydı. **Ne:** `mountRouter` kullanımı app bootstrap’e taşındı. **Dosyalar:** `/src/app.js`, `/src/router.js`.
9) **Neden:** No-op navigate eksikti. **Ne:** Aynı route’a gidişte tekrar render engellendi. **Dosyalar:** `/src/router.js`.
10) **Neden:** Parser güveni test edilmeliydi. **Ne:** normalize/isValid/getCurrent için smoke assert eklendi. **Dosyalar:** `/tests/smoke.mjs`.
