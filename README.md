# README.md — Acemi Devralan

## Amaç
Bu sürüm, projeyi ilk kez devralan kişiye adım adım anlatım verir.

## Kurulum
1) Depoyu klonla.
2) Node sürümünü doğrula.
3) Paketleri yükle.
4) Başlangıç dosyalarını incele (`index.html`, `src/app.js`).

## Çalıştırma
Statik sunucu ile aç; hash route, model picker, sohbet akışı ve modal davranışını gözlemle.

## Konfigürasyon
`src/config/env.js`, `src/config/admin.js`, `src/config/i18n.js` dosyalarını düzenle; runtime tercihleri localStorage üzerinden yönet.

## Mimari
Shell: `index.html` + `src/app.js`.
Routing: `src/router.js`.
Ekranlar: `src/pages/*`.
Servisler: `src/services/*`.
State: `src/store/*`.
Bileşenler: `src/ui/components/*` + `src/ui/shell/*`.

## Dosya Haritası
- `https://github.com/salihcelebi/xx/admin\rehber.html`
  - Sorumluluk: Sayfa iskeleti/rehber; giriş: tarayıcı isteği; çıkış: DOM; bağımlılık: gömülü script ve CSS.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/config\admin.js`
  - Sorumluluk: Yapılandırma üretir; giriş: env/storage; çıkış: export; bağımlılık: app/router.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/config\env.js`
  - Sorumluluk: Yapılandırma üretir; giriş: env/storage; çıkış: export; bağımlılık: app/router.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/config\i18n.js`
  - Sorumluluk: Yapılandırma üretir; giriş: env/storage; çıkış: export; bağımlılık: app/router.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\adminPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\assetsPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\billingPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\chatPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\historyPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\modelsPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\usagePage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\videoPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\chatService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\imageService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\ttsService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\videoService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\aiService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\modelCatalog.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\puterAuth.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\puterUsage.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\telemetryService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\translationService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\usageService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\adminSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\appSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\billingSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\chatSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\videoSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\index.js`
  - Sorumluluk: Global store; giriş: reducer/action; çıkış: dispatch/getState/subscribe; bağımlılık: slice reducerları.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\store.js`
  - Sorumluluk: Global store; giriş: reducer/action; çıkış: dispatch/getState/subscribe; bağımlılık: slice reducerları.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\en.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\index.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\keys.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\tr.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\icons\logoMap.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\utils\debounce.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\utils\focusTrap.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\utils\timeAgoTR.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\AdminLogin.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\AdminToggle.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\AudioPlayer.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\BillingSummaryCards.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Button.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatList.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatListItem.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatSearchInput.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatView.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Checkbox.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Chip.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\CitationList.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Composer.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Dropdown.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\IconButton.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ImageGrid.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\MessageBubble.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\MessageToolbar.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\modals.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ModelPicker.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\pageHeader.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\PaymentProviders.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\StatusLine.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\toasts.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Toggle.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ToolsMenu.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\VideoGallery.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\VideoJobCard.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/shell\sidebar.js`
  - Sorumluluk: Shell parçası; giriş: root/state/callback; çıkış: sidebar/topbar; bağımlılık: ui components.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/shell\topbar.js`
  - Sorumluluk: Shell parçası; giriş: root/state/callback; çıkış: sidebar/topbar; bağımlılık: ui components.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/utils\guard.js`
  - Sorumluluk: Koruma/log katmanı; giriş: runtime hata/ağ; çıkış: overlay/log/breaker; bağımlılık: window/fetch/storage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık notu: import zincirinde doğrudan referans görünmedi (opsiyonel).
- `https://github.com/salihcelebi/xx/src/app.js`
  - Sorumluluk: Bootstrap/event bağlama; giriş: DOM+store; çıkış: çalışan shell/route; bağımlılık: router/store/services/ui.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/router.js`
  - Sorumluluk: Route çözümleyici; giriş: hash/els/store; çıkış: page render; bağımlılık: pages.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/static\kame-ui.js`
  - Sorumluluk: KAME UI akışı; giriş: kullanıcı metni/model listesi; çıkış: model seçimi+KAME/ROI; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/utils\guard.js`
  - Sorumluluk: Koruma/log katmanı; giriş: runtime hata/ağ; çıkış: overlay/log/breaker; bağımlılık: window/fetch/storage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık notu: ayrı kök yardımcı; src import zincirinde görünmedi (opsiyonel).
- `https://github.com/salihcelebi/xx/index.html`
  - Sorumluluk: Sayfa iskeleti/rehber; giriş: tarayıcı isteği; çıkış: DOM; bağımlılık: gömülü script ve CSS.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/opener.html`
  - Sorumluluk: Sayfa iskeleti/rehber; giriş: tarayıcı isteği; çıkış: DOM; bağımlılık: gömülü script ve CSS.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/WELCOME.HTML`
  - Sorumluluk: Varsayım: yardımcı/bağlayıcı modül.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).

## Modüller
- pages: route’a göre ekran üretir.
- services: puter/auth/usage/video/image/chat çağrılarını normalize eder.
- store: reducer/effect/selector ile veri akışını yönetir.
- ui: render + event bağlama katmanıdır.
- router: hash normalizasyonu ve page mount yönetir.
- guard: opsiyonel koruma/log katmanıdır.

## Akışlar
1) Route değişimi → router render → page görünümü.
2) Kullanıcı aksiyonu → service/effect → slice güncellemesi.
3) Store değişimi → UI yeniden çizim → kullanıcı çıktısı.

## Hata Ayıklama
1. Sayfa boş: `index.html` script yollarını ve console hatasını kontrol et.
2. Route değişmiyor: `normalizeRoute` ve hash formatını doğrula.
3. Mesaj gitmiyor: `sendUserMessage` içinde input/disable durumunu izle.
4. Model listesi yok: `listModelsSmart` ve `window.puter.ai.listModels` erişimini kontrol et.
5. Tool kaydı kayboluyor: `state.toolsByThread` + `persist()` sırasını incele.
6. Draft kaybı: `draftsByRoute` save/restore çağrılarını denetle.
7. Sidebar modu yanlış: `state.ui.sidebarMode` ve `renderSidebar` dalını doğrula.
8. Video progress kopuyor: `videoService` onProgress payload alanlarını kontrol et.
9. Auth oturumu yok: `puterAuth.getSession/checkSignedIn` sonuçlarını izle.
10. Çeviri anahtarı görünüyor: `translationService` + i18n key eşleşmesini doğrula.

## Güvenlik
- Token/anahtarları repoya yazma; env/secret yöneticisi kullan.
- Admin/test bayraklarını üretimde kısıtla.
- Telemetry payloadlarında PII maskele.
- Web/dosya tool açıkken paylaşım kapsamını kullanıcıya göster.
- localStorage verisini güvenilmez input kabul ederek doğrulama ekle.

## Katkı
1) Değişikliği tek konuya odakla.
2) Service/slice etkisini PR notuna yaz.
3) i18n anahtarlarını ve dokümantasyonu eş zamanlı güncelle.

## SSS
- `guard.js` hangisi aktif? → Import zincirinde doğrudan çağrı görünmedi; iki dosya da opsiyonel.
- Neden hem `index.html` hem `src/*` var? → Demo shell + modüler mimari birlikte korunmuş.
- Puter yoksa? → Fallback/testMode yolları devreye girer.

## Geliştirme Fikirleri (7)
1) Test: Chat/video slice için contract test ekle; neden: regresyonu erken yakalar; nereye: `tests/`.
2) Logging: onProgress ve route değişimlerini yapılandırılmış logla; neden: hata kökü hızlanır; nereye: `src/services/telemetryService.js`.
3) Perf: Model picker gruplamasına memo/cache iyileştirmesi ekle; neden: büyük katalogda donmayı azaltır; nereye: `index.html`.
4) A11y: Sidebar mod toggle ve tool menüsüne keyboard roving ekle; neden: erişilebilirlik puanı artar; nereye: `index.html` + `src/ui/components/*`.
5) i18n: EN/TR dışı diller için fallback zinciri genişlet; neden: çok dilli devralım kolaylaşır; nereye: `src/services/translationService.js`.
6) Error handling: Puter çağrılarında tutarlı hata kodu haritası birleştir; neden: kullanıcı mesajları netleşir; nereye: `src/services/*`.
7) CI/CD: lint+test+smoke pipeline ekle; neden: merge kalitesi korunur; nereye: `.github/workflows/`.

### Fonksiyon Envanteri (JS)
- `src/config/admin.js` → `setAdminLogin(status)`, `setTestMode(status)`, `getTestMode()`, `initAdmin()`, `getStorage()`
- `src/config/env.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/config/i18n.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/pages/adminPage.js` → `render({ store })`
- `src/pages/assetsPage.js` → `renderAssetsPage()`
- `src/pages/billingPage.js` → `render({ store })`
- `src/pages/chatPage.js` → `render({ els, store })`, `destroy()`
- `src/pages/historyPage.js` → `render({ store })`
- `src/pages/modelsPage.js` → `renderModelsPage()`
- `src/pages/usagePage.js` → `renderUsagePage()`
- `src/pages/videoPage.js` → `render({ store })`, `destroy()`
- `src/services/generation/chatService.js` → `sendMessage({ messages, modelId, options = {}, signal, testMode = false })`, `streamMessage({
  messages,
  modelId,
  options = {},
  onChunk,
  onDone,
  onError,
  signal,
  testMode = false,
})`, `sendChatCompletion({ messages, model, onChunk, signal })`, `loadThreadHistory(threadId)`, `now()`, `makeId(prefix = 'chat')`
- `src/services/generation/imageService.js` → `generateImage({ prompt, modelId, options = {}, testMode = false, signal } = {})`, `generateImageFromImage({ prompt, inputImageUrl, modelId, options = {}, testMode = false, signal } = {})`, `getImageMeta({ imgEl } = {})`, `now()`, `makeId(prefix = 'img')`, `makeError(code, retryable, details = null)`
- `src/services/generation/ttsService.js` → `synthesizeSpeech({ text, modelId = null, options = {}, testMode = false, signal } = {})`, `play({ audioEl } = {})`, `stop({ audioEl } = {})`, `getSupportedVoices()`, `now()`, `makeId(prefix = 'tts')`
- `src/services/generation/videoService.js` → `createVideoJob({ prompt, modelId, options = {}, testMode = false } = {})`, `runVideoJob({ jobId, onProgress, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {})`, `cancelVideoJob({ jobId } = {})`, `retryVideoJob({ jobId } = {})`, `getJobSnapshot({ jobId } = {})`, `submitTxt2Vid({ prompt, options = {} } = {})`
- `src/services/aiService.js` → `resolveTestMode(options = {})`, `listModelsWithCache(mode)`, `generateChat(promptOrMessages, options = {})`, `streamChat(promptOrMessages, options = {})`, `generateVideo(prompt, options = {})`, `generateImage(prompt, options = {})`
- `src/services/modelCatalog.js` → `listAllModels({ forceRefresh = false } = {})`, `listModelsByMode(mode, { forceRefresh = false } = {})`, `getDefaultModelForMode(mode, models = [])`, `getFeaturedModels(mode, models = [])`, `searchModels(models = [], query = '')`, `sortCatalogModels(mode, models = [])`
- `src/services/puterAuth.js` → `signIn({ mode = 'NORMAL', testMode = false } = {})`, `signOut()`, `checkSignedIn()`, `getUserLite()`, `getSession()`, `now()`
- `src/services/puterUsage.js` → `microcentsToUsdNumber(microcents = 0)`, `microcentsToUsdText(microcents = 0)`, `microcentsToTlText(microcents = 0, fxTry = null)`, `formatTlUsdPair(microcents = 0, fxTry = null)`, `normalizeUsage(raw)`, `fetchMonthlyUsage({ signedIn = true, forceRefresh = false, timeoutMs = DEFAULT_TIMEOUT_MS } = {})`
- `src/services/telemetryService.js` → `logEvent(type, payload = {})`
- `src/services/translationService.js` → `getInitialLanguage()`, `setLanguage(lang)`, `translateText(key, lang)`, `getStorage()`, `loadPersistedCache()`, `persistCache()`
- `src/services/usageService.js` → `fetchMonthlyUsage()`, `beginDiff(usage)`, `computeDiff(afterUsage)`, `microcentsToUsd(value)`
- `src/store/slices/adminSlice.js` → `adminReducer(state = initialAdminState, action)`, `checkAdminAccessEffect({ dispatch, getState })`, `fetchModelCatalogEffect({ dispatch, getState }, { force = false } = {})`, `fetchUsageMonitoringEffect({ dispatch })`, `selectIsAdmin(state)`, `selectAdminForbidden(state)`
- `src/store/slices/appSlice.js` → `appReducer(state = initialAppState, action)`, `setAppLanguage(dispatch, language)`, `hydrateAppPreferences(dispatch, configLanguage = DEFAULT_LANGUAGE)`, `refreshUsage(dispatch)`
- `src/store/slices/billingSlice.js` → `billingReducer(state = initialBillingState, action)`, `calculateDiffFromSnapshots(baselineMicrocents, currentMicrocents)`, `selectMonthlyUsageTotalMicrocents(state)`, `selectAmountsTLUSD(state)`, `selectDiffMicrocents(state)`, `selectDiffTextTLUSD(state)`
- `src/store/slices/chatSlice.js` → `chatReducer(state = initialChatState, action)`, `sendMessage({ dispatch, getState }, { content, threadId = null })`, `loadThreadHistoryEffect({ dispatch }, threadId)`, `selectThreads(state)`, `selectActiveThread(state)`, `selectMessagesForActiveThread(state)`
- `src/store/slices/videoSlice.js` → `videoReducer(state = initialVideoState, action)`, `submitVideo(context, { prompt, options = {} })`, `pollJob(context, jobId)`, `retryVideo(context, jobId)`, `cancelJob(context, jobId)`, `stopAllVideoPolling()`
- `src/store/index.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/store/store.js` → `rootReducer(state, action)`, `createStore(preloadedState = buildInitialState()`, `selectMode(state)`, `selectLanguage(state)`, `selectCredits(state)`, `selectBusy(state)`
- `src/ui/components/i18n/en.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/ui/components/i18n/index.js` → `t(key, language = 'tr')`
- `src/ui/components/i18n/keys.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/ui/components/i18n/tr.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/ui/components/icons/logoMap.js` → `getLogoGlyph(logoKey = '')`
- `src/ui/components/utils/debounce.js` → `debounce(fn, wait = 200)`
- `src/ui/components/utils/focusTrap.js` → `createFocusTrap(rootEl)`
- `src/ui/components/utils/timeAgoTR.js` → `timeAgoTR(ts)`
- `src/ui/components/AdminLogin.js` → `showAdminLogin()`, `sha256Hex(text)`
- `src/ui/components/AdminToggle.js` → `initAdminToggle()`, `updateTestModeIndicator()`, `showAdminPanel()`
- `src/ui/components/AudioPlayer.js` → `renderAudioPlayer(src = '')`
- `src/ui/components/BillingSummaryCards.js` → `renderBillingSummaryCards(cards = [])`
- `src/ui/components/Button.js` → `renderButton({ label, variant = 'primary', disabled = false, loading = false, ariaLabel = '' })`
- `src/ui/components/ChatList.js` → `renderChatList({ threads = [], pinnedIds = [], onOpen, onMenu })`
- `src/ui/components/ChatListItem.js` → `renderChatListItem(thread, { onOpen, onMenu } = {})`
- `src/ui/components/ChatSearchInput.js` → `renderChatSearchInput({ value = '', onInput })`
- `src/ui/components/ChatView.js` → `renderChatView({ messages = [] })`
- `src/ui/components/Checkbox.js` → `renderCheckbox({ checked = false, label = '' })`
- `src/ui/components/Chip.js` → `renderChip({ label = '', removable = false })`
- `src/ui/components/CitationList.js` → `renderCitationList(citations = [])`
- `src/ui/components/Composer.js` → `renderComposer({ onSubmit, onAttach, onVoice })`
- `src/ui/components/Dropdown.js` → `renderDropdown({ triggerLabel = '', items = [] })`
- `src/ui/components/IconButton.js` → `renderIconButton({ icon = '•', ariaLabel = '', title = '' })`
- `src/ui/components/ImageGrid.js` → `renderImageGrid(images = [])`
- `src/ui/components/MessageBubble.js` → `renderMessageBubble(message)`
- `src/ui/components/MessageToolbar.js` → `renderMessageToolbar()`
- `src/ui/components/modals.js` → `setupModalEscape(modalElements)`
- `src/ui/components/ModelPicker.js` → `renderModelPicker({ models = [], selectedModelId = null, onSelect })`
- `src/ui/components/pageHeader.js` → `renderPageHeader(root, title, description)`
- `src/ui/components/PaymentProviders.js` → `renderPaymentProviders()`
- `src/ui/components/StatusLine.js` → `renderStatusLine(target, statusKey)`
- `src/ui/components/toasts.js` → `createToastManager(root)`
- `src/ui/components/Toggle.js` → `renderToggle({ checked = false, label = '', ariaLabel = '' })`
- `src/ui/components/ToolsMenu.js` → `renderToolsMenu({ enabled = {}, onChange })`
- `src/ui/components/VideoGallery.js` → `renderVideoGallery(items = [])`
- `src/ui/components/VideoJobCard.js` → `renderVideoJobCard(job)`
- `src/ui/shell/sidebar.js` → `mountSidebar({ root, state, onNewChat, onOpenThread, onSearch })`
- `src/ui/shell/topbar.js` → `mountTopbar({ root, state, mode = 'chat', onModelChange, onToolsChange, onTempChange })`
- `src/utils/guard.js` → `installGlobalGuardsV2(customOptions = {})`, `now()`, `pushLog(kind, details = {})`, `createOverlay(options)`, `withTimeout(promise, timeoutMs)`, `isCircuitOpen()`
- `src/app.js` → `getEls()`, `setupGlobalErrorHandling(els, toast)`, `setupSearchPalette(els)`, `setupModeSwitch(els)`, `refreshModelPicker(els)`, `setupModelPicker(els)`
- `src/router.js` → `normalizeRoute(input = '')`, `isValidRoute(route)`, `getCurrentRoute(hash = window.location.hash)`, `navigateTo(route)`, `renderCurrentRoute(els, store, hooks = {})`, `mountRouter({ els, store, onRoute, onModeChanged, onWarning, onLoadingChange } = {})`
- `static/kame-ui.js` → `ensurePlaceholders()`, `setGlobalStatus(text)`, `setKameBadge(score)`, `setModeBadge(emoji)`, `mountAdminIndicator(isAdmin)`, `renderModelPickerAuto(catalog)`
- `utils/guard.js` → `installGlobalGuardsV2({
  // Görünürlük / admin
  isDev = true,
  isAdmin = ()`, `safeSerializeError(err)`, `safeStringify(v)`, `buildPayload(kind, err, extra = {})`, `kindRateLimit()`, `pushLog(level, args)`


---

# README.md — Tecrübeli Devralan

## Amaç
Bu sürüm, projeyi hızlı devralıp bakım/yeni geliştirme yapmak isteyen kişiye teknik özet verir.

## Kurulum
1) Depoyu klonla.
2) Node sürümünü doğrula.
3) Paketleri yükle.
4) Başlangıç dosyalarını incele (`index.html`, `src/app.js`).

## Çalıştırma
Statik sunucu ile aç; hash route, model picker, sohbet akışı ve modal davranışını gözlemle.

## Konfigürasyon
`src/config/env.js`, `src/config/admin.js`, `src/config/i18n.js` dosyalarını düzenle; runtime tercihleri localStorage üzerinden yönet.

## Mimari
Shell: `index.html` + `src/app.js`.
Routing: `src/router.js`.
Ekranlar: `src/pages/*`.
Servisler: `src/services/*`.
State: `src/store/*`.
Bileşenler: `src/ui/components/*` + `src/ui/shell/*`.

## Dosya Haritası
- `https://github.com/salihcelebi/xx/admin\rehber.html`
  - Sorumluluk: Sayfa iskeleti/rehber; giriş: tarayıcı isteği; çıkış: DOM; bağımlılık: gömülü script ve CSS.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/config\admin.js`
  - Sorumluluk: Yapılandırma üretir; giriş: env/storage; çıkış: export; bağımlılık: app/router.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/config\env.js`
  - Sorumluluk: Yapılandırma üretir; giriş: env/storage; çıkış: export; bağımlılık: app/router.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/config\i18n.js`
  - Sorumluluk: Yapılandırma üretir; giriş: env/storage; çıkış: export; bağımlılık: app/router.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\adminPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\assetsPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\billingPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\chatPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\historyPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\modelsPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\usagePage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/pages\videoPage.js`
  - Sorumluluk: Route ekranı render eder; giriş: store/els; çıkış: DOM; bağımlılık: ui+service.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\chatService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\imageService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\ttsService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\generation\videoService.js`
  - Sorumluluk: Üretim yürütür; giriş: prompt/options/signal; çıkış: sonuç/meta/hata; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\aiService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\modelCatalog.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\puterAuth.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\puterUsage.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\telemetryService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\translationService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/services\usageService.js`
  - Sorumluluk: Servis katmanı; giriş: app/store talebi; çıkış: normalize veri; bağımlılık: ağ/localStorage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\adminSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\appSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\billingSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\chatSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\slices\videoSlice.js`
  - Sorumluluk: State dilimi; giriş: action; çıkış: yeni state/selectors; bağımlılık: store/effect.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\index.js`
  - Sorumluluk: Global store; giriş: reducer/action; çıkış: dispatch/getState/subscribe; bağımlılık: slice reducerları.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/store\store.js`
  - Sorumluluk: Global store; giriş: reducer/action; çıkış: dispatch/getState/subscribe; bağımlılık: slice reducerları.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\en.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\index.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\keys.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\i18n\tr.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\icons\logoMap.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\utils\debounce.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\utils\focusTrap.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\utils\timeAgoTR.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\AdminLogin.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\AdminToggle.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\AudioPlayer.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\BillingSummaryCards.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Button.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatList.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatListItem.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatSearchInput.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ChatView.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Checkbox.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Chip.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\CitationList.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Composer.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Dropdown.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\IconButton.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ImageGrid.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\MessageBubble.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\MessageToolbar.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\modals.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ModelPicker.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\pageHeader.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\PaymentProviders.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\StatusLine.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\toasts.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\Toggle.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\ToolsMenu.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\VideoGallery.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/components\VideoJobCard.js`
  - Sorumluluk: UI bileşeni; giriş: props; çıkış: DOM; bağımlılık: stil/event.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/shell\sidebar.js`
  - Sorumluluk: Shell parçası; giriş: root/state/callback; çıkış: sidebar/topbar; bağımlılık: ui components.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/ui/shell\topbar.js`
  - Sorumluluk: Shell parçası; giriş: root/state/callback; çıkış: sidebar/topbar; bağımlılık: ui components.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/utils\guard.js`
  - Sorumluluk: Koruma/log katmanı; giriş: runtime hata/ağ; çıkış: overlay/log/breaker; bağımlılık: window/fetch/storage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık notu: import zincirinde doğrudan referans görünmedi (opsiyonel).
- `https://github.com/salihcelebi/xx/src/app.js`
  - Sorumluluk: Bootstrap/event bağlama; giriş: DOM+store; çıkış: çalışan shell/route; bağımlılık: router/store/services/ui.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/src/router.js`
  - Sorumluluk: Route çözümleyici; giriş: hash/els/store; çıkış: page render; bağımlılık: pages.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/static\kame-ui.js`
  - Sorumluluk: KAME UI akışı; giriş: kullanıcı metni/model listesi; çıkış: model seçimi+KAME/ROI; bağımlılık: puter.ai.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/utils\guard.js`
  - Sorumluluk: Koruma/log katmanı; giriş: runtime hata/ağ; çıkış: overlay/log/breaker; bağımlılık: window/fetch/storage.
  - Girdi/Çıktı: fonksiyon parametreleri + state -> return/DOM/state
  - Bağımlılık notu: ayrı kök yardımcı; src import zincirinde görünmedi (opsiyonel).
- `https://github.com/salihcelebi/xx/index.html`
  - Sorumluluk: Sayfa iskeleti/rehber; giriş: tarayıcı isteği; çıkış: DOM; bağımlılık: gömülü script ve CSS.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/opener.html`
  - Sorumluluk: Sayfa iskeleti/rehber; giriş: tarayıcı isteği; çıkış: DOM; bağımlılık: gömülü script ve CSS.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).
- `https://github.com/salihcelebi/xx/WELCOME.HTML`
  - Sorumluluk: Varsayım: yardımcı/bağlayıcı modül.
  - Girdi/Çıktı: sayfa yükleme -> HTML/DOM
  - Bağımlılık: kendi klasör zinciri + tarayıcı API + puter.* (varsa).

## Modüller
- pages: route’a göre ekran üretir.
- services: puter/auth/usage/video/image/chat çağrılarını normalize eder.
- store: reducer/effect/selector ile veri akışını yönetir.
- ui: render + event bağlama katmanıdır.
- router: hash normalizasyonu ve page mount yönetir.
- guard: opsiyonel koruma/log katmanıdır.

## Akışlar
1) Route değişimi → router render → page görünümü.
2) Kullanıcı aksiyonu → service/effect → slice güncellemesi.
3) Store değişimi → UI yeniden çizim → kullanıcı çıktısı.

## Hata Ayıklama
1. Sayfa boş: `index.html` script yollarını ve console hatasını kontrol et.
2. Route değişmiyor: `normalizeRoute` ve hash formatını doğrula.
3. Mesaj gitmiyor: `sendUserMessage` içinde input/disable durumunu izle.
4. Model listesi yok: `listModelsSmart` ve `window.puter.ai.listModels` erişimini kontrol et.
5. Tool kaydı kayboluyor: `state.toolsByThread` + `persist()` sırasını incele.
6. Draft kaybı: `draftsByRoute` save/restore çağrılarını denetle.
7. Sidebar modu yanlış: `state.ui.sidebarMode` ve `renderSidebar` dalını doğrula.
8. Video progress kopuyor: `videoService` onProgress payload alanlarını kontrol et.
9. Auth oturumu yok: `puterAuth.getSession/checkSignedIn` sonuçlarını izle.
10. Çeviri anahtarı görünüyor: `translationService` + i18n key eşleşmesini doğrula.

## Güvenlik
- Token/anahtarları repoya yazma; env/secret yöneticisi kullan.
- Admin/test bayraklarını üretimde kısıtla.
- Telemetry payloadlarında PII maskele.
- Web/dosya tool açıkken paylaşım kapsamını kullanıcıya göster.
- localStorage verisini güvenilmez input kabul ederek doğrulama ekle.

## Katkı
1) Değişikliği tek konuya odakla.
2) Service/slice etkisini PR notuna yaz.
3) i18n anahtarlarını ve dokümantasyonu eş zamanlı güncelle.

## SSS
- `guard.js` hangisi aktif? → Import zincirinde doğrudan çağrı görünmedi; iki dosya da opsiyonel.
- Neden hem `index.html` hem `src/*` var? → Demo shell + modüler mimari birlikte korunmuş.
- Puter yoksa? → Fallback/testMode yolları devreye girer.

## Geliştirme Fikirleri (7)
1) Test: Chat/video slice için contract test ekle; neden: regresyonu erken yakalar; nereye: `tests/`.
2) Logging: onProgress ve route değişimlerini yapılandırılmış logla; neden: hata kökü hızlanır; nereye: `src/services/telemetryService.js`.
3) Perf: Model picker gruplamasına memo/cache iyileştirmesi ekle; neden: büyük katalogda donmayı azaltır; nereye: `index.html`.
4) A11y: Sidebar mod toggle ve tool menüsüne keyboard roving ekle; neden: erişilebilirlik puanı artar; nereye: `index.html` + `src/ui/components/*`.
5) i18n: EN/TR dışı diller için fallback zinciri genişlet; neden: çok dilli devralım kolaylaşır; nereye: `src/services/translationService.js`.
6) Error handling: Puter çağrılarında tutarlı hata kodu haritası birleştir; neden: kullanıcı mesajları netleşir; nereye: `src/services/*`.
7) CI/CD: lint+test+smoke pipeline ekle; neden: merge kalitesi korunur; nereye: `.github/workflows/`.

### Fonksiyon Envanteri (JS)
- `src/config/admin.js` → `setAdminLogin(status)`, `setTestMode(status)`, `getTestMode()`, `initAdmin()`, `getStorage()`
- `src/config/env.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/config/i18n.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/pages/adminPage.js` → `render({ store })`
- `src/pages/assetsPage.js` → `renderAssetsPage()`
- `src/pages/billingPage.js` → `render({ store })`
- `src/pages/chatPage.js` → `render({ els, store })`, `destroy()`
- `src/pages/historyPage.js` → `render({ store })`
- `src/pages/modelsPage.js` → `renderModelsPage()`
- `src/pages/usagePage.js` → `renderUsagePage()`
- `src/pages/videoPage.js` → `render({ store })`, `destroy()`
- `src/services/generation/chatService.js` → `sendMessage({ messages, modelId, options = {}, signal, testMode = false })`, `streamMessage({
  messages,
  modelId,
  options = {},
  onChunk,
  onDone,
  onError,
  signal,
  testMode = false,
})`, `sendChatCompletion({ messages, model, onChunk, signal })`, `loadThreadHistory(threadId)`, `now()`, `makeId(prefix = 'chat')`
- `src/services/generation/imageService.js` → `generateImage({ prompt, modelId, options = {}, testMode = false, signal } = {})`, `generateImageFromImage({ prompt, inputImageUrl, modelId, options = {}, testMode = false, signal } = {})`, `getImageMeta({ imgEl } = {})`, `now()`, `makeId(prefix = 'img')`, `makeError(code, retryable, details = null)`
- `src/services/generation/ttsService.js` → `synthesizeSpeech({ text, modelId = null, options = {}, testMode = false, signal } = {})`, `play({ audioEl } = {})`, `stop({ audioEl } = {})`, `getSupportedVoices()`, `now()`, `makeId(prefix = 'tts')`
- `src/services/generation/videoService.js` → `createVideoJob({ prompt, modelId, options = {}, testMode = false } = {})`, `runVideoJob({ jobId, onProgress, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {})`, `cancelVideoJob({ jobId } = {})`, `retryVideoJob({ jobId } = {})`, `getJobSnapshot({ jobId } = {})`, `submitTxt2Vid({ prompt, options = {} } = {})`
- `src/services/aiService.js` → `resolveTestMode(options = {})`, `listModelsWithCache(mode)`, `generateChat(promptOrMessages, options = {})`, `streamChat(promptOrMessages, options = {})`, `generateVideo(prompt, options = {})`, `generateImage(prompt, options = {})`
- `src/services/modelCatalog.js` → `listAllModels({ forceRefresh = false } = {})`, `listModelsByMode(mode, { forceRefresh = false } = {})`, `getDefaultModelForMode(mode, models = [])`, `getFeaturedModels(mode, models = [])`, `searchModels(models = [], query = '')`, `sortCatalogModels(mode, models = [])`
- `src/services/puterAuth.js` → `signIn({ mode = 'NORMAL', testMode = false } = {})`, `signOut()`, `checkSignedIn()`, `getUserLite()`, `getSession()`, `now()`
- `src/services/puterUsage.js` → `microcentsToUsdNumber(microcents = 0)`, `microcentsToUsdText(microcents = 0)`, `microcentsToTlText(microcents = 0, fxTry = null)`, `formatTlUsdPair(microcents = 0, fxTry = null)`, `normalizeUsage(raw)`, `fetchMonthlyUsage({ signedIn = true, forceRefresh = false, timeoutMs = DEFAULT_TIMEOUT_MS } = {})`
- `src/services/telemetryService.js` → `logEvent(type, payload = {})`
- `src/services/translationService.js` → `getInitialLanguage()`, `setLanguage(lang)`, `translateText(key, lang)`, `getStorage()`, `loadPersistedCache()`, `persistCache()`
- `src/services/usageService.js` → `fetchMonthlyUsage()`, `beginDiff(usage)`, `computeDiff(afterUsage)`, `microcentsToUsd(value)`
- `src/store/slices/adminSlice.js` → `adminReducer(state = initialAdminState, action)`, `checkAdminAccessEffect({ dispatch, getState })`, `fetchModelCatalogEffect({ dispatch, getState }, { force = false } = {})`, `fetchUsageMonitoringEffect({ dispatch })`, `selectIsAdmin(state)`, `selectAdminForbidden(state)`
- `src/store/slices/appSlice.js` → `appReducer(state = initialAppState, action)`, `setAppLanguage(dispatch, language)`, `hydrateAppPreferences(dispatch, configLanguage = DEFAULT_LANGUAGE)`, `refreshUsage(dispatch)`
- `src/store/slices/billingSlice.js` → `billingReducer(state = initialBillingState, action)`, `calculateDiffFromSnapshots(baselineMicrocents, currentMicrocents)`, `selectMonthlyUsageTotalMicrocents(state)`, `selectAmountsTLUSD(state)`, `selectDiffMicrocents(state)`, `selectDiffTextTLUSD(state)`
- `src/store/slices/chatSlice.js` → `chatReducer(state = initialChatState, action)`, `sendMessage({ dispatch, getState }, { content, threadId = null })`, `loadThreadHistoryEffect({ dispatch }, threadId)`, `selectThreads(state)`, `selectActiveThread(state)`, `selectMessagesForActiveThread(state)`
- `src/store/slices/videoSlice.js` → `videoReducer(state = initialVideoState, action)`, `submitVideo(context, { prompt, options = {} })`, `pollJob(context, jobId)`, `retryVideo(context, jobId)`, `cancelJob(context, jobId)`, `stopAllVideoPolling()`
- `src/store/index.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/store/store.js` → `rootReducer(state, action)`, `createStore(preloadedState = buildInitialState()`, `selectMode(state)`, `selectLanguage(state)`, `selectCredits(state)`, `selectBusy(state)`
- `src/ui/components/i18n/en.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/ui/components/i18n/index.js` → `t(key, language = 'tr')`
- `src/ui/components/i18n/keys.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/ui/components/i18n/tr.js` → export fonksiyon tespit edilmedi (config/sabit/varsayım).
- `src/ui/components/icons/logoMap.js` → `getLogoGlyph(logoKey = '')`
- `src/ui/components/utils/debounce.js` → `debounce(fn, wait = 200)`
- `src/ui/components/utils/focusTrap.js` → `createFocusTrap(rootEl)`
- `src/ui/components/utils/timeAgoTR.js` → `timeAgoTR(ts)`
- `src/ui/components/AdminLogin.js` → `showAdminLogin()`, `sha256Hex(text)`
- `src/ui/components/AdminToggle.js` → `initAdminToggle()`, `updateTestModeIndicator()`, `showAdminPanel()`
- `src/ui/components/AudioPlayer.js` → `renderAudioPlayer(src = '')`
- `src/ui/components/BillingSummaryCards.js` → `renderBillingSummaryCards(cards = [])`
- `src/ui/components/Button.js` → `renderButton({ label, variant = 'primary', disabled = false, loading = false, ariaLabel = '' })`
- `src/ui/components/ChatList.js` → `renderChatList({ threads = [], pinnedIds = [], onOpen, onMenu })`
- `src/ui/components/ChatListItem.js` → `renderChatListItem(thread, { onOpen, onMenu } = {})`
- `src/ui/components/ChatSearchInput.js` → `renderChatSearchInput({ value = '', onInput })`
- `src/ui/components/ChatView.js` → `renderChatView({ messages = [] })`
- `src/ui/components/Checkbox.js` → `renderCheckbox({ checked = false, label = '' })`
- `src/ui/components/Chip.js` → `renderChip({ label = '', removable = false })`
- `src/ui/components/CitationList.js` → `renderCitationList(citations = [])`
- `src/ui/components/Composer.js` → `renderComposer({ onSubmit, onAttach, onVoice })`
- `src/ui/components/Dropdown.js` → `renderDropdown({ triggerLabel = '', items = [] })`
- `src/ui/components/IconButton.js` → `renderIconButton({ icon = '•', ariaLabel = '', title = '' })`
- `src/ui/components/ImageGrid.js` → `renderImageGrid(images = [])`
- `src/ui/components/MessageBubble.js` → `renderMessageBubble(message)`
- `src/ui/components/MessageToolbar.js` → `renderMessageToolbar()`
- `src/ui/components/modals.js` → `setupModalEscape(modalElements)`
- `src/ui/components/ModelPicker.js` → `renderModelPicker({ models = [], selectedModelId = null, onSelect })`
- `src/ui/components/pageHeader.js` → `renderPageHeader(root, title, description)`
- `src/ui/components/PaymentProviders.js` → `renderPaymentProviders()`
- `src/ui/components/StatusLine.js` → `renderStatusLine(target, statusKey)`
- `src/ui/components/toasts.js` → `createToastManager(root)`
- `src/ui/components/Toggle.js` → `renderToggle({ checked = false, label = '', ariaLabel = '' })`
- `src/ui/components/ToolsMenu.js` → `renderToolsMenu({ enabled = {}, onChange })`
- `src/ui/components/VideoGallery.js` → `renderVideoGallery(items = [])`
- `src/ui/components/VideoJobCard.js` → `renderVideoJobCard(job)`
- `src/ui/shell/sidebar.js` → `mountSidebar({ root, state, onNewChat, onOpenThread, onSearch })`
- `src/ui/shell/topbar.js` → `mountTopbar({ root, state, mode = 'chat', onModelChange, onToolsChange, onTempChange })`
- `src/utils/guard.js` → `installGlobalGuardsV2(customOptions = {})`, `now()`, `pushLog(kind, details = {})`, `createOverlay(options)`, `withTimeout(promise, timeoutMs)`, `isCircuitOpen()`
- `src/app.js` → `getEls()`, `setupGlobalErrorHandling(els, toast)`, `setupSearchPalette(els)`, `setupModeSwitch(els)`, `refreshModelPicker(els)`, `setupModelPicker(els)`
- `src/router.js` → `normalizeRoute(input = '')`, `isValidRoute(route)`, `getCurrentRoute(hash = window.location.hash)`, `navigateTo(route)`, `renderCurrentRoute(els, store, hooks = {})`, `mountRouter({ els, store, onRoute, onModeChanged, onWarning, onLoadingChange } = {})`
- `static/kame-ui.js` → `ensurePlaceholders()`, `setGlobalStatus(text)`, `setKameBadge(score)`, `setModeBadge(emoji)`, `mountAdminIndicator(isAdmin)`, `renderModelPickerAuto(catalog)`
- `utils/guard.js` → `installGlobalGuardsV2({
  // Görünürlük / admin
  isDev = true,
  isAdmin = ()`, `safeSerializeError(err)`, `safeStringify(v)`, `buildPayload(kind, err, extra = {})`, `kindRateLimit()`, `pushLog(level, args)`
