# Dependency Map

- `index.html` -> `index.css`, `static/kame-ui.js`, `window.puter`
- `src/app.js` -> `src/router.js`, `src/store/index.js`, `src/ui/shell/*`
- `src/router.js` -> `src/pages/*`
- `src/pages/*` -> `src/services/*`, `src/ui/components/*`
- `src/store/*` -> `src/services/*` (effect çağrıları)

## Paket/Özellik Erişim Önerisi
- Free: Chat + temel model + sınırlı geçmiş
- Pro: Chat + Video + Görsel + Ses + Dublaj
- Enterprise: Tüm modlar + admin denetim + telemetry raporu
