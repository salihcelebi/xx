
# ElevenLabs Benzeri Tek Sayfadan Yönetilen Yapay Zeka Platformu Tasarımı ve Puter.js ile Maliyet–Kredi–Kalite Optimizasyonu

## Amaç, kapsam ve kritik kısıtlar

ElevenLabs Benzeri Tek Sayfadan Yönetilen Yapay Zeka Platformu Tasarımı ve Puter.js ile Maliyet–Kredi–Kalite Optimizasyonu
Amaç, kapsam ve kritik kısıtlar
Bu proje; tek bir “uygulama kabuğu” (single-page shell) içinde çok modüllü bir üretim stüdyosu kurmayı hedefliyor: “TXT→Chat” ve “TXT→Video” aynı ürün altında; ileride “TXT→Voice (TTS)”, “TXT→Image”, “IMG→TXT (OCR)”, “Speech→TXT (STT)”, “Speech→Speech (voice changer)” gibi Puter.js AI modülleri de eklenerek ölçeklenecek. Puter.js’nin “User-Pays” (kullanıcı öder) modeli sayesinde geliştirici olarak altyapı/AI maliyetini kullanıcıların Puter hesabına taşıyıp, ürün maliyetini dramatik biçimde düşürmek mümkün. 

Bununla birlikte, “ElevenLabs görünümünü birebir kopyalama” hedefi marka/arayüz benzerliği (trade dress), telif, haksız rekabet ve kullanıcıyı yanıltma riskleri doğurabilir. Puter App Developer Agreement; geliştiricinin gönderdiği uygulamanın üçüncü taraf fikri mülkiyetini ihlal etmeyeceğini taahhüt etmesini açıkça şart koşar. 
 Ayrıca, gerçek dünyada “resmî uygulamaya benzeyen sahte uygulamalar” kullanıcıları yanıltıp platformlarda güvenlik sorunlarına yol açabiliyor; bu da “birebir klon” stratejisinin pratik riskini artırır. 
 Bu rapor bu yüzden birebir kopya üretmeyi değil; ElevenLabs benzeri “tek panel / üretim stüdyosu” mantığını, bilgi mimarisini ve etkileşim desenlerini yasal ve sürdürülebilir şekilde yeniden tasarlamayı hedefler.

ElevenLabs tarafında, ürünün kapsadığı yetenekler güncel olarak; sentez/TTS, dubbing, müzik, ses tasarımı (SFX), voice yönetimi ve analitik gibi başlıklara yayılmış durumda (ElevenCreative yetenek özeti). 
 Bu, senin üründe “modül modül genişleme” yaklaşımını doğrular: çekirdekte Chat+Video; yan modüllerde Voice/Image/Transcribe.

## ElevenLabs benzeri tek panel stüdyo için UX haritası ve tasarım rehberi

### Bilgi mimarisi ve yan menü kurgusu

ElevenLabs benzeri tek panel stüdyo için UX haritası ve tasarım rehberi
Bilgi mimarisi ve yan menü kurgusu
ElevenLabs/benzeri ürünlerde kullanıcı; tek bir sol sidebar üzerinden “üretim yüzeylerine” (TTS, Dubbing, Voice Library, vb.) ve “yönetim yüzeylerine” (API keys, usage, billing) gider. ElevenLabs’te örneğin “Voice Library” ayrı bir “katalog keşif” ekranıdır. 
 Ayrıca API kullanımına başlamak için kullanıcıyı dashboard’dan API key üretmeye yönlendiren akışlar bulunur (ElevenLabs dokümantasyon quickstart ve dubbing cookbook’ta dashboard’dan API key üretimi vurgulanır). 

Senin ürün için önerilen sidebar topolojisi (iki ana mod: Chat ve Video; ek modüller genişleyebilir):

Create
Chat (TXT→Chat)
Video (TXT→Video)
Voice (TXT→Voice) (sonra)
Image (TXT→Image / IMG→TXT) (sonra)
Audio Tools (STT / Voice Changer) (sonra; Puter speech2txt & speech2speech ile uyumlu) 
Library
History (tüm modüller ortak geçmiş)
Assets (prompt şablonları, yüklenen referans görseller, indirilen çıktıların “link” listesi)
Manage
Models (model kataloğu + karşılaştırma)
Usage & Credits (kredi/harcama)
Billing (Stripe/PayPal)
Settings
Admin (yalnız admin rolü; ayrı route)
Bu yapı, ElevenLabs’in “platform yetenekleri + yönetim” ayrımını taklit ederken birebir isim/ikonografi kopyalamadan aynı zihinsel modeli taşır. 

### Uygulama kabuğu şeması (Header + Sidebar + çalışma alanı)

Uygulama kabuğu şeması (Header + Sidebar + çalışma alanı)
Aşağıdaki şema, tek sayfa stüdyo kabuğunun minimum iskeletidir (UI bileşen hiyerarşisi):

php-template
Kopyala
<AppShell>
  <TopBar>
    <Brand/>
    <GlobalSearch/>         (⌘/Ctrl+K)
    <ModeSwitch/>           (Chat | Video)
    <ModelQuickPicker/>     (seçili modun varsayılan modeli)
    <CreditsIndicator/>     (kalan allowance + “Top up / Upgrade”)
    <UserMenu/>             (Profile, Settings, Admin)
  </TopBar>

  <Sidebar>
    <NavSection title="Create">...</NavSection>
    <NavSection title="Library">...</NavSection>
    <NavSection title="Manage">...</NavSection>
  </Sidebar>

  <Main>
    <RouteOutlet/>
    <Toasts/>
    <GlobalModals/>         (Sign-in, Paywall, Error details)
  </Main>
</AppShell>
Kritik nokta: CreditsIndicator tek bir metrik göstermemeli; Puter kullanıcılarının “aylık allowance” ve kalanını uygulama bazında alabiliyorsun; ölçü birimi Puter ekosisteminde microcents olarak tanımlanıyor (örn. $0.50 = 50,000,000 microcents). 

### Görsel sistem (renk, tipografi, spacing) için “klon değil, denk ritim” yaklaşımı

Görsel sistem (renk, tipografi, spacing) için “klon değil, denk ritim” yaklaşımı
Birebir renk kodu/typography kopyalamak yerine aynı “stüdyo” hissini veren ama özgün bir tasarım sistemi kurgula:

Renk tokenları: bg/surface/elevated, text/primary/secondary, border, accent, danger, warning, success.
Spacing ölçeği: 4-8-12-16-24-32-48.
Tipografi: 12/14/16 body; 20/24/32 heading; monospace “token & cost” alanlarında.
ElevenLabs UI’nin açık kaynak “ElevenLabs UI” bileşen kitaplığı (MIT) özellikle agent/audio bileşenlerinde (orb, waveform, conversation) hız kazandırabilir; bu, “ElevenLabs görünümü” yerine “üretim stüdyosu hissi”ni hızla yakalamaya yarar. 

### Mikro kopya, boş durumlar, hatalar, loading

Mikro kopya, boş durumlar, hatalar, loading
Birebir kopya mikrocopy yerine; aynı fonksiyonel mesajları kısa, ölçümlü, eylem odaklı yaz:

Boş durum (History): “Henüz çıktı yok. Chat veya Video’da ilk üretimini başlat.”
Boş durum (Assets): “Referans görsel ekle: Video’yu daha tutarlı yapar.” (TXT→Video’da input_reference desteklenir.) 
Kredi uyarısı: “Bu üretim tahmini X maliyet. Kalan allowance: Y.” (allowance/remaining Puter monthly usage’dan). 
Hata (network/timeout): “İstek tamamlanamadı. Kuyruk yoğun olabilir; tekrar dene veya daha düşük kalite seç.” (Sora render süresi dakikaları bulabilir; UI responsive kalmalı.) 
Klavye odağı: ⌘/Ctrl+K global arama; G (Generate), Esc modal kapatma; “Model seçici” için ok tuşları + Enter; “Generate” butonuna Enter/Space. (Bu bölüm tasarım standardı olarak dokümante edilmeli; kopya değil, ürün kalitesi için.)

## Sora tarzı TXT→Video akışını doğru konumlandırma

### Sora’nın (uygulama) kullanıcı akışı: ayarlar, varyasyon, kütüphane

Sora tarzı TXT→Video akışını doğru konumlandırma
Sora’nın (uygulama) kullanıcı akışı: ayarlar, varyasyon, kütüphane
OpenAI’nin Sora yardım dokümanı, üretimde kullanıcıya aspect ratio, resolution, duration ve varyasyon sayısı gibi ayarları değiştirme imkânı verdiğini; üretim sonrasında da kütüphanede varyasyonları hover ile karşılaştırıp tekil videoya girerek “edit & build upon” (üzerine inşa) yapabildiğini söyler. 
 Bu, UI’da “tek sefer üret → galeride karşılaştır → seç → tekrar türet” döngüsünü zorunlu kılar.

### Puter.js ile Sora benzeri ayar eşlemesi

Puter.js ile Sora benzeri ayar eşlemesi
Puter puter.ai.txt2vid() dokümantasyonu, OpenAI sağlayıcısı için doğrudan model, seconds, size/resolution ve opsiyonel input_reference (image reference) alanlarını destekler. 
 Ayrıca “testMode” ile UI’ı krediler harcamadan deneme imkânı vardır. 

Sora 2 tarafında OpenAI’nin model sayfası; sora-2’nin 720p (720×1280 / 1280×720) için $0.10/s olduğunu belirtir. 
 Sora 2 Pro model sayfası ise daha pahalı bir fiyat bandı (ör. $0.30–$0.50/s) ve daha yüksek çıktılarla konumlanır; Puter tarafında size seçenekleri 1024×1792 ve 1792×1024 gibi yüksek çözünürlükleri destekleyecek şekilde dokümante edilmiştir. 

### Önerilen TXT→Video ekran düzeni: “Prompt sol, ayarlar sağ, çıktı aşağı”

Önerilen TXT→Video ekran düzeni: “Prompt sol, ayarlar sağ, çıktı aşağı”
Sora benzeri bir UI’da en iyi çalışan yerleşim:

Sol ana panel (Prompt Editor)

Prompt textarea (çok satır)
Prompt şablon seçici (dropdown)
“Negatif prompt / avoid” (provider destekliyorsa; TogetherAI opsiyonlarında var) 
“Reference image” uploader / picker (input_reference) 
Sağ panel (Settings Drawer / Inspector)

Model: sora-2 (Default) / sora-2-pro (Pro) 
Süre: 4 / 8 / 12 sn (OpenAI opsiyonları) 
Çözünürlük: 720×1280, 1280×720; Pro’da 1024×1792, 1792×1024 (UI’da koşullu) 
“Varyasyon sayısı” (UI özelliği): Puter/OpenAI çağrısında doğrudan varyasyon parametresi görünmüyorsa, UI bunu batch job olarak uygulama katmanında çoğaltabilir (aynı prompt ile N istek). Burada kullanıcıya “N adet üretim = maliyet N×” etiketi net gösterilmeli. (Sora uygulaması varyasyon kavramını kütüphane içinde karşılaştırma olarak sunuyor.) 
Alt bölüm (Queue + Output Gallery)

“Kuyruk” listesi (job id, started, ETA, cancel)
“Çıktı galerisi”: her kartta
thumbnail
model, res, süre
tahmini maliyet etiketi
Download / Share (Puter UI API’da socialShare() gibi paylaşım yardımcıları da var; Puter environment’a göre koşullu) 

### Doğru “Pro” konumlandırma: pahalı kaliteyi kontrollü açma

Doğru “Pro” konumlandırma: pahalı kaliteyi kontrollü açma
Kullanıcıyı önce en az harcayan seçeneklere yönlendirmek için:

Varsayılan: sora-2, 4s, 720p. (En ucuz başlangıç; $0.10/s) 
“Pro” açılımı: sora-2-pro ve yüksek çözünürlükler; UI’da kilit ikon + “Pro plan gerekli” (veya “Advanced toggles”) akışı. 
Her ayar değişiminde sağ panelde “Tahmini maliyet: $X” hesaplanır (süre×fiyat/s). Fiyat kaynağı OpenAI model fiyatı; ayrıca Puter monthly usage microcents ile fiili harcama doğrulaması yapılabilir. 

## Puter.js ile model kataloğu, maliyet, kredi ve kaliteyi metrikle yönetme

### User-Pays modeli: maliyet optimizasyonunun temeli

Puter.js ile model kataloğu, maliyet, kredi ve kaliteyi metrikle yönetme
User-Pays modeli: maliyet optimizasyonunun temeli
Puter dokümantasyonu ve tanıtım metinleri; Puter.js ile geliştiricinin “backend/API key/billing” yükünü taşımadan, kullanıcının kendi Puter hesabı üzerinden kaynak tükettiğini vurgular. 
 Bu, senin ürününde “maliyet düşürme” hedefinin omurgasıdır: senin operasyonel giderin (AI inference) yerine, kullanıcı allowance/overage ile yönetilir.

### Kredi/harcama ölçümü: MonthlyUsage ve microcents

Kredi/harcama ölçümü: MonthlyUsage ve microcents
puter.auth.getMonthlyUsage() çağrısı uygulama kapsamlı aylık kullanım/allowance bilgisini verir. 
 MonthlyUsage objesi; allowance (aylık limit), remaining (kalan) ve uygulama toplamları gibi alanlar içerir ve ölçüm birimi microcents olarak tanımlanır. 

UI gereksinimi olarak “CreditsIndicator” şu üç katmanı göstermeli:

Kalan allowance (remaining) → “bugün kaç üretim kaldı” hissi
Bu uygulamanın tüketimi (appTotals) → kullanıcı güveni
Son işlem maliyeti (diff) → eğitim/şeffaflık

### Chat modelleri: dinamik listeleme + fiyat sinyali

Chat modelleri: dinamik listeleme + fiyat sinyali
Puter puter.ai.listModels() dokümantasyonunda; model listesinin id/provider yanında bağlama penceresi ve cost (usd-cents, tokens, input/output maliyeti) gibi alanları içerebileceği belirtilir. 
 Örnek model girdisi; 1M token başına input/output cent maliyetini açıkça gösterir. 

Bu sayede “TXT→Chat model seçici” şu şekilde tasarlanabilir:

Kategoriler (UI label): “Ucuza En Yakın”, “Hızlı”, “Uzun Kontext”, “Kod Odaklı”, “Premium”.
Varsayılan sıralama: cost.input + cost.output en düşük → en üste. (Kullanıcıya “En az token harcayanlar” filtresi sunulur.)
Her model kartı:
Bağlam (context), max çıktı (max_tokens)
Streaming desteği (options.stream) 
“Tahmini maliyet” etiketi: girdiyi token tahmini ile çarp (bu rapor kod üretmez; metrik tanımı verilir).

### Video modelleri: Puter txt2vid + çoklu sağlayıcı

Video modelleri: Puter txt2vid + çoklu sağlayıcı
Puter puter.ai.txt2vid() hem OpenAI hem Together sağlayıcısını destekler; Together tarafında seed, fps, guidance_scale, negative_prompt ve reference_images gibi “Sora benzeri gelişmiş kontrol” parametreleri dokümante edilmiştir. 
 Bu, ürün stratejisi için çok değerlidir:

En ucuz/kolay: OpenAI Sora 2 (az sayıda, belirli seçenek). 
Daha ileri kontrol: Together tabanlı T2V modelleri (seed, fps, negative prompt vb.). 
UI’da bu ikisini aynı ayar panelinde değil; “Basic” ve “Advanced (Pro)” sekmeleriyle ayırmak kullanıcıyı yormaz.

### Ücretsiz kredi pazarlaması: “miktar” değil, “mekanizma” üzerinden doğru vaat

Ücretsiz kredi pazarlaması: “miktar” değil, “mekanizma” üzerinden doğru vaat
Puter tarafında her kullanıcı oturum açtığında “pre-allocated resources (storage, database, AI credits, vb.)” aldığı ve aşınca Puter’a ödeme yaptığı anlatılır; ancak bu free tier miktarı herkes için sabit bir sayı olarak dokümante edilmeyebilir. 
 Bu yüzden pazarlama dilinde:

Yanlış vaat: “Herkese X kredi bedava.” (doğrulanamaz)
Doğru vaat: “Puter hesabınla ücretsiz allowance ile başla; harcamanı panelden canlı gör. Aşınca Puter üzerinden artırabilirsin.” (UI bunu gerçek zamanlı gösterebilir.) 

## Tek index.html mi, modüler dosya yapısı mı

### Puter App’lerde “indexURL” gerçekliği

Tek index.html mi, modüler dosya yapısı mı
Puter App’lerde “indexURL” gerçekliği
Puter Apps API’de puter.apps.create(name, indexURL) parametresi “uygulamanın index sayfasının URL’si” olarak tanımlanır ve uygulama başlangıcında gösterilecek sayfadır. 
 Bu, pratikte şu anlama gelir:

Evet, bir “entry” sayfan var (index.html veya route).
Hayır, tüm uygulama tek HTML dosyası olmak zorunda değil: entry sayfa; ES module import’larıyla app.js, store.js, routes/*, components/* gibi modülleri yükleyebilir.
Puter “Framework Integrations” sayfası, Puter.js’in framework-agnostic olduğunu ve NPM ile farklı framework’lerde kullanılabildiğini söyler. 
 Bu da modüler yapıyı teşvik eder.

### Önerilen dosya ağacı (index kabuk, modüller ayrı)

Önerilen dosya ağacı (index kabuk, modüller ayrı)
Aşağıdaki yapı; “tek sayfa” hedefiyle çelişmeden, kod bakımını kolaylaştırır:

bash
Kopyala
/index.html               (yalnız shell + root containers + script imports)
 /src/
   app.js                 (bootstrap, router init)
   router.js              (route registry)
   store/
     store.js             (global state)
     slices/              (chatSlice, videoSlice, billingSlice, adminSlice)
   services/
     puterAuth.js
     puterUsage.js        (getMonthlyUsage, cost diff)
     modelCatalog.js      (listModels + caching)
     generation/
       chatService.js
       videoService.js    (txt2vid wrapper; job queue)
       ttsService.js      (txt2speech wrapper)
       imageService.js    (txt2img/img2txt)
   ui/
     shell/TopBar.js
     shell/Sidebar.js
     components/...
   pages/
     ChatPage.js
     VideoPage.js
     HistoryPage.js
     BillingPage.js
     AdminPage.js
Bu yapı; “index.html tek olsun mu?” sorusunu şöyle çözer: index.html kabuk kalır, asıl iş JS modüllerinde sürer.

### Performans: cache, versioning, lazy load

Performans: cache, versioning, lazy load
Model kataloğu: puter.ai.listModels() maliyetli olabilir; sonuçları KV store’da (user bazlı) kısa TTL ile cache’lemek mantıklı. (KV store Puter’de mevcut.) 
Video sayfası: ağır bileşenleri lazy-load; çünkü Sora render beklerken UI “responsive” olmalı. 

## Monetizasyon: Puter teşvikleri + Stripe/PayPal ile sürdürülebilir gelir, paketler ve marj

### Puter Incentive Program: “kullanım üzerinden gelir paylaşımı”

Monetizasyon: Puter teşvikleri + Stripe/PayPal ile sürdürülebilir gelir, paketler ve marj
Puter Incentive Program: “kullanım üzerinden gelir paylaşımı”
Puter “Earn with Puter” sayfası; kullanıcıların Puter servisleriyle etkileşiminde (storage/AI vb.) harcamanın bir kısmının geliştiriciyle paylaşıldığını ve aylık PayPal ile ödeme yapıldığını açıklar. 
 Bu, senin için “arka planda çalışan” ek gelir hattıdır ve “maliyet optimizasyonu” stratejisiyle uyumludur.

Dev Center ekranında da Incentive Program ve PayPal payout formu akışı görünür. 

### Kendi ürün paketlerin: Stripe/PayPal ile 4 katman

Kendi ürün paketlerin: Stripe/PayPal ile 4 katman
Senin hedefin: Puter kullanıcı allowance’ı bittiğinde (veya premium özellik ihtiyacı doğduğunda) 4 paketle ücretlendirmek. Burada iki ayrı gerçek var:

Puter kullanım maliyeti: kullanıcıya ait (User-Pays). 
Senin ürün gelir modelin: premium özellik (yüksek kalite preset’leri, daha iyi queue politikası, ekip yönetimi, depolama, prompt kütüphanesi, watermark kaldırma gibi ürün katmanı) üzerinden olmalı.
Önerilen paket çerçevesi (örnek; “kredi” burada senin ürün içi hakların ve/veya “Pro model kilidi” anlamına gelir):

FREE: Chat+Video temel; düşük seviye preset; sınırlı history; “Advanced models” kilitli.
BASIC: daha uzun geçmiş + daha fazla preset + export organizasyonu.
PRO: sora-2-pro ve yüksek çözünürlük preset’leri + batch/varyasyon + öncelikli kuyruk. 
ENTERPRISE: takım, RBAC, SLA, audit log, özel storage politikası.

### Stripe akışı: abonelik yaşam döngüsü ve webhooks

Stripe akışı: abonelik yaşam döngüsü ve webhooks
Stripe dokümantasyonu; abonelik olaylarını webhook ile yönetmeyi, ödeme başarısızlığı ve durum değişimlerini yakalamayı önerir. 
 İptal, plan değişikliği, prorasyon ve portal davranışları için resmi rehberler mevcut. 

UI/Flow gereksinimleri:

Plan seçimi → Checkout → invoice.paid geldiğinde plan aktif (özellikleri aç) 
invoice.payment_failed → kullanıcıya “Ödeme başarısız, kartını güncelle” + grace period 
Downgrade/upgrade → proration politikası (immediate vs end-of-period vs none) açıkça belirlenir. 
“Customer portal” bazı kısıtlar taşır; ör. portal içinde müşteri yeni abonelik oluşturamaz, sadece güncelleyebilir/iptal edebilir. 

### PayPal akışı: plan, abonelik ve webhook olayları

PayPal akışı: plan, abonelik ve webhook olayları
PayPal Subscriptions API; planlarda fiyat/billing cycle tanımlayıp abonelik yaratmayı destekler. 
 PayPal Subscriptions webhooks listesinde BILLING.SUBSCRIPTION.PAYMENT.FAILED gibi “abonelik ödeme başarısız” olayları yer alır. 
 PayPal webhook teslimatında retry/failed davranışları ve webhook yönetimi için resmi rehber bulunur. 

Uygulama içinde başarısız ödeme senaryoları için “dunning” metinleri standardize edilmeli (örn. 1. deneme, 3. deneme, askıya alma).

### Marj modeli: senaryolara bölünmüş net kâr mantığı

Marj modeli: senaryolara bölünmüş net kâr mantığı
Puter User-Pays sayesinde “AI inference marjı” senin için birincil marj kalemi değildir; marjın çoğu ürün katmanı ücreti – ödeme sağlayıcı komisyonları – operasyon (destek/infra, webhook worker vb.) üzerinden hesaplanır. (Puter Incentive Program geliri, ayrıca ek katkı sağlar.) 
 Puter App Developer Agreement ayrıca geliştiricinin uygulama fiyatını belirleyebileceğini belirtir. 

Bu nedenle admin panelinde mutlaka şu KPI’lar olmalı:

ARPU / MRR / churn
“Ücretsiz allowance sonrası dönüşüm”
Modül bazında kullanım: Chat vs Video vs Voice vb. (MonthlyUsage usage alanı API bazında cost/count verir) 

## Admin dashboard tasarımı ve GPT’ye verilecek talimat şablonu

### Admin dashboard: modül, yetki, audit ve canlı ayar

Admin dashboard tasarımı ve GPT’ye verilecek talimat şablonu
Admin dashboard: modül, yetki, audit ve canlı ayar
Admin panel; ürünün en kritik “kontrol kulesi” olmalı:

Kullanıcı yönetimi: plan, durum, risk/abuse flag
Model kataloğu yönetimi: varsayılan model, “Recommended/Least cost” rozetleri, Pro kilitleri (chat modellerinde listModels maliyet datasına göre otomatik) 
Video preset yönetimi: Sora 2 (0.10/s) default preset’ler; Sora 2 Pro advanced preset’ler. 
Ödeme izleme: Stripe/PayPal webhook logları, retry, payment_failed, chargeback
Audit log: admin değişiklikleri (model default değişti, fiyat değişti, vb.)
A/B test: “ucuz model first” vs “kalite first” dönüşüm testi
Teknik olarak Stripe ve PayPal webhook’ları için bir “server” gerekir; Puter’ın Serverless Workers altyapısı bu iş için uygun bir seçenek olabilir (worker oluşturma dokümanı). 

## Kabul kriterleri: “ElevenLabs benzeri” hedefi için ölçülebilir metrikler

Kabul kriterleri: “ElevenLabs benzeri” hedefi için ölçülebilir metrikler
“Birebir klon” yerine ölçülebilir UX hedefleri:

Tek panel hissi: Chat↔Video geçişinde context korunur (model seçimi, kullanıcı profili, credits indicator, history).
Maliyet şeffaflığı: her generate aksiyonunda tahmini maliyet + kalan allowance görünür; işlem sonrası “fiilî maliyet” (microcents diff) history kaydına eklenir. 
Cheap-first kuralı: ilk kez gelen kullanıcıya en düşük maliyetli presetler otomatik seçili gelir; Pro seçenekleri kullanıcı açık onayıyla açılır.
Sora UX eşleşmesi: çözünürlük/süre/varyasyon, queue, kütüphane/galeri, download/share akışları tamdır. 

## GPT’ye verilecek talimat şablonu (kod üretmeden, sadece araştırma+tasarım)

GPT’ye verilecek talimat şablonu (kod üretmeden, sadece araştırma+tasarım)
Aşağıdaki metni doğrudan GPT’ye “talimat” olarak verebilirsin (bu şablon özellikle senin “net, uygulanabilir ve tutarlı” istek ihtiyacına göre yazıldı):

text
Kopyala
ROL: Ürün araştırmacısı + UX mimarı + tasarım sistem editörü gibi davran.
AMAÇ: ElevenLabs benzeri, ancak özgün markalı bir “tek panel AI stüdyosu” için araştırma ve tasarım spesifikasyonu üretmek.

KAPSAM:
- Tek ürün içinde iki ana mod: TXT→Chat ve TXT→Video.
- Altyapı: Puter.js (User-Pays). Model ve maliyet verisi için Puter dokümantasyonundaki:
  - puter.ai.listModels() (chat modelleri, cost metadata)
  - puter.auth.getMonthlyUsage() ve MonthlyUsage (allowance/remaining, microcents)
  - puter.ai.txt2vid() (OpenAI: sora-2 / sora-2-pro; seconds, size, input_reference; testMode)
- Sora tarzı video üretim akışı: prompt + ayarlar + queue + varyasyon + çıktı galerisi + download/share.

ÇIKTI KURALLARI:
- UYGULAMA KODU ÜRETME. Sadece: araştırma bulgusu, bilgi mimarisi, UX akışı, UI bileşen listesi, tasarım tokenları, hata/boş durum metinleri, kabul kriterleri.
- Hiçbir üçüncü taraf UI’ını “birebir kopyalama” önermeyeceksin. Sadece benzer problemlere benzer çözümler ve özgün tasarım dili.
- Her kritik iddia için kaynak zorunlu: Puter docs, OpenAI Sora docs/help, Stripe docs, PayPal dev docs, ElevenLabs docs. Kaynaksız iddia yazma.
- Çıktıda şu bölümler zorunlu:
  1) IA + Sidebar/Topbar şeması (ASCII)
  2) Chat ekranı: model seçici, stream, maliyet etiketi, prompt şablonları
  3) Video ekranı: prompt, ayarlar (model/seconds/size), queue, gallery
  4) Credits/Usage ekranı: allowance, kalan, mikrocent açıklaması
  5) Monetizasyon: FREE/BASIC/PRO/ENTERPRISE; Stripe+PayPal webhook durumları; kullanıcı mesajları
  6) Admin dashboard: model kataloğu, default seçimler, webhook log, RBAC, audit log
  7) Kabul kriterleri + test checklist (UI, maliyet, kredi, kalite)

TERİM SÖZLÜĞÜ:
- “Allowance”: Puter aylık kullanım hakkı
- “Microcents”: Puter kaynak ölçüm birimi (örn. $0.50 = 50,000,000)
- “Preset”: Video/Chat için kayıtlı ayar seti (model + kalite + limit)
- “Pro kilidi”: Yalnız ücretli planda açılan gelişmiş seçenekler

BAŞARI TANIMI:
- Kullanıcı ilk 5 dakikada ücretsiz allowance ile Chat ve Video üretebilmeli.
- Her üretimde tahmini maliyet + kalan allowance görünmeli.
- Pro seçenekleri kullanıcı açık onayı olmadan görünür/aktif olmamalı.
- Stripe/PayPal ödeme başarısızlığında kullanıcıya net ve eylem odaklı hata metni gösterilmeli.
Bu şablon; Puter’nin ölçüm/allowance yapısını (MonthlyUsage, microcents) 
, model maliyet metadata’sını (listModels) 
 ve video üretim parametrelerini (txt2vid: model/seconds/size/input_reference/testMode) 
 “delil zorunluluğu” ile birlikte GPT’ye bağlar.

**BAĞLANTILI**

# Puter.js AI API Referans Rehberi (Chrome Eklentisi MV3 Odaklı)

Puter.js; tek bir birleşik API ile **500+ AI modele** (OpenAI, Anthropic, Google, DeepSeek vb.) erişim sağlayan, **tarayıcı tarafında** çalışabilen bir SDK’dır. Bu rehber; Puter.js’i **Google Chrome Extension (Manifest V3)** içinde **CSP’ye takılmadan** kullanacak şekilde revize edilmiştir.

---

## 0) Chrome Eklentisinde Puter.js Kullanırken “Altın Kurallar” 🛡️

### 0.1 Remote Script YASAK 🚫

* ✅ **Yap:** Puter SDK dosyasını **eklenti içine kopyala** (vendor et).
* ❌ **Yapma:** Popup/Options gibi “extension pages” içinde
  `https://js.puter.com/v2/` gibi **uzaktan script** yükleme.

> Not: MV3’te “extension pages” **remote code** çalıştırmayı engeller. Script’i yerelde tutman gerekir.

### 0.2 Inline Script YASAK 🧱

* ✅ **Yap:** Tüm JavaScript’i `.js` dosyalarına taşı.
* ❌ **Yapma:** `arayuz.html` içinde `<script> ... </script>` inline kod yazma.

### 0.3 Arayüz Sayfası ≠ Service Worker ⚙️

* ✅ **Popup/Options (UI):** `puter.ai.*` çağrılarını UI içinde yapmak en rahatı.
* ✅ **Background Service Worker:** Ağ işleri, mesajlaşma, scheduler gibi arka plan işlerini burada yönet.
* ⚠️ **HTMLImageElement / HTMLAudioElement / HTMLVideoElement** dönen fonksiyonları (txt2img, txt2speech, txt2vid) **UI tarafında** kullan.

---

## 1) Kurulum: MV3 Uyumlu Yapı Oluştur 📦

### 1.1 Dosya Yapısını Kur ✅

```text
extension/
  manifest.json
  popup.html
  popup.js
  lib/
    puter-v2.js
  icons/
    16.png
    48.png
    128.png
````

### 1.2 Puter SDK’yı Yerelleştir 📌

* ✅ `https://js.puter.com/v2/` içeriğini indir.
* ✅ Dosyayı `lib/puter-v2.js` olarak projenin içine koy.
* ❌ Popup/Options içinde CDN’den yükleme yapma.

---

## 2) MV3 Manifest Ayarı (Temel) 🧾

### 2.1 Manifest’i MV3’e Göre Tanımla ✅

> Amaç: Popup aç, scriptleri **self** kaynaktan yükle, CSP’yi temiz tut.

```json
{
  "manifest_version": 3,
  "name": "Puter.js MV3 Extension",
  "version": "1.0.0",
  "description": "Puter.js'i MV3 CSP kurallarına uygun şekilde kullanır.",
  "action": { "default_popup": "popup.html" },
  "permissions": ["storage"],
  "icons": {
    "16": "icons/16.png",
    "48": "icons/48.png",
    "128": "icons/128.png"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

> Eğer Puter SDK bazı senaryolarda WASM/eval isterse (her SDK sürümüne göre değişebilir):

* ✅ Gerekirse ekle: `'wasm-unsafe-eval'`
* ❌ Gerek yoksa ekleme (en sıkı politika daha iyidir)

---

## 3) HTML Kurulumu (CDN YOK, INLINE YOK) 🧩

### 3.1 Popup HTML’e Yalnızca Yerel Script Bağla ✅

```html
<!-- popup.html -->
<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Puter UI</title>
</head>
<body>
  <textarea id="prompt" placeholder="Sorunu yaz..."></textarea>
  <button id="run">Gönder</button>
  <pre id="out">Hazır.</pre>

  <!-- ✅ Yerel Puter SDK -->
  <script src="lib/puter-v2.js"></script>

  <!-- ✅ Yerel uygulama kodu -->
  <script src="popup.js"></script>
</body>
</html>
```

---

## 4) Metin & Sohbet (puter.ai.chat) 💬

### 4.1 Sözdizimi

* ✅ `puter.ai.chat(prompt, options)`

### 4.2 Parametreler

* **prompt**

  * ✅ String: `"Merhaba!"`
  * ✅ Mesaj dizisi: `[{ role: "user", content: "..." }]`
* **options**

  * ✅ `model`: `"gpt-5-nano"` gibi
  * ✅ `stream`: `true/false`
  * ✅ `tools`: function calling ve web_search için
  * ✅ `testMode`: `true` (kredi harcamadan test)

### 4.3 Popup içinde Örnek Kullanım (MV3 Uyumlu) ✅

```js
// popup.js
document.getElementById("run").addEventListener("click", async () => {
  const out = document.getElementById("out");
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return (out.textContent = "⚠️ Metin gir.");

  out.textContent = "⏳ Çalışıyor...";

  try {
    const resp = await puter.ai.chat(prompt, {
      model: "gpt-5-nano",
      testMode: true
    });

    // SDK yanıt formatına göre string ya da objeyi güvenli bas
    out.textContent = typeof resp === "string" ? resp : JSON.stringify(resp, null, 2);
  } catch (e) {
    out.textContent = "❌ Hata: " + (e?.message || String(e));
  }
});
```

---

## 5) Önemli Model & Sağlayıcı Seçimi 🧠

Puter.js tek API ile farklı sağlayıcılara eriştirir. Model seçimini **options.model** ile yap:

### 5.1 OpenAI

* `gpt-4o` (dengeli amiral gemisi)
* `gpt-4o-mini` (hızlı/ucuz)
* `o1-preview` / `o1-mini` (reasoning odaklı)
* `gpt-4-turbo` (klasik yüksek performans)

### 5.2 Anthropic

* `claude-3-5-sonnet` (kodlama + yaratıcı)
* `claude-3-5-haiku` (çok hızlı)
* `claude-3-opus` (derin analiz)
* `claude-3-sonnet`, `claude-3-haiku`

### 5.3 Google (Gemini)

* `gemini-1.5-pro` (çok büyük context)
* `gemini-1.5-flash` (hızlı multimodal)
* `gemini-1.5-flash-8b`
* `gemini-1.0-pro`
* `gemini-ultra`

### 5.4 DeepSeek

* `deepseek-v3` (genel chat)
* `deepseek-r1` (reasoning)
* `deepseek-coder` (kod)
* `deepseek-chat`
* `deepseek-reasoner`

---

## 6) Görsel Analizi & Multimodal 🖼️

* ✅ Multimodal mesajlar desteklenir (örn. `type: "file"` veya `puter_path`).
* ✅ Eklenti tarafında dosyayı **UI’dan seçtir**, içeriği Puter’a uygun formatta gönder.
* ⚠️ Hedef sayfanın CSP’si varsa (content script ile çalışıyorsan) ayrı değerlendirme yap.

---

## 7) Görsel Üretimi (puter.ai.txt2img) 🎨

* ✅ `puter.ai.txt2img(prompt, options)`
* ✅ Dönüş: **HTMLImageElement** (Promise içinde)
* ✅ Örnek modeller: `gpt-image-1.5`, `dall-e-3`, `gemini-2.5-flash-image-preview`
* ✅ UI tarafında `img.src = ...` gibi göster.

> Emir: Görsel üretimi işini **popup/options** içinde yap. Service worker’da DOM yok.

---

## 8) Ses & Konuşma 🔊

### 8.1 Text-to-Speech

* ✅ `puter.ai.txt2speech(text, options)` → **HTMLAudioElement**

### 8.2 Speech-to-Text

* ✅ `puter.ai.speech2txt(audioSource, options)` → transkript

### 8.3 Speech-to-Speech

* ✅ `puter.ai.speech2speech(source, options)` → ses dönüşümü (örn. ElevenLabs)

> Emir: Audio element dönen işleri UI tarafında çalıştır; izin (autoplay vs.) yönetimini unutma.

---

## 9) Video Üretimi (puter.ai.txt2vid) 🎬

* ✅ `puter.ai.txt2vid(prompt, options)`
* ✅ Dönüş: **HTMLVideoElement**
* ✅ Modeller: `sora-2` veya `together` gibi seçenekler

> Emir: Videoyu UI tarafında üret ve `<video>` ile göster.

---

## 10) Gelişmiş Özellikler 🧰

### 10.1 Function Calling (tools) 🔧

* ✅ `tools` ile yerel fonksiyon şemaları tanımla
* ✅ Model `tool_calls` döndürürse:

  * Emir: Tool’u **yerelde çalıştır**
  * Emir: Sonucu modele **geri gönder**

### 10.2 Web Search (OpenAI Modellerinde) 🌐

* ✅ `tools: [{ type: "web_search" }]`

### 10.3 Test Modu ✅

* ✅ `testMode: true` ile kredi harcamadan akışı doğrula
* Emir: Önce testMode ile geliştir, sonra prod’da kapat.

---

## 11) Chrome Eklentisi İçin “Sık Görülen Hatalar” ve Çözüm ✅🧯

### 11.1 “Loading the script ... violates CSP” 🚫

* ✅ Çöz: `https://js.puter.com/v2/` script tag’ini kaldır.
* ✅ Çöz: SDK’yı `lib/puter-v2.js` olarak yerelleştir.

### 11.2 “Executing inline script violates CSP” 🧱

* ✅ Çöz: Tüm inline `<script>...</script>` bloklarını kaldır.
* ✅ Çöz: Kodları `popup.js` / `options.js` gibi dosyalara taşı.

### 11.3 “Invalid or unexpected token” 🧨

* ✅ Çöz: Akıllı tırnakları düz tırnak yap (`“ ”` → `"`, `’` → `'`)
* ✅ Çöz: Dosyayı UTF-8 kaydet.
* ✅ Çöz: Hatalı satırı silip **elle yeniden yaz** (görünmez karakterleri temizler).

---

## 12) Eklenti Mimari Önerisi (Pratik) 🧭

* ✅ **Popup/Options:** Puter çağrılarını yap, UI göster.
* ✅ **Background SW:** Gerekirse mesaj kuyruğu, cache, storage, scheduling yönet.
* ✅ **Content Script (opsiyonel):** Sayfa üstüne UI ekleyeceksen kullan; ama sayfa CSP’sini hesaba kat.

---

```
```
