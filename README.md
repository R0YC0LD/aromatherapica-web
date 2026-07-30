# Aromatherapica Web — Ticimax Entegrasyonlu E-Ticaret

Bağımsız Next.js mağaza sitesi. Ürün, stok, fiyat, üye ve sipariş süreçlerinin ana kaynağı **Ticimax SOAP Web Servisleri**dir. Frontend Ticimax kimlik bilgilerine erişmez; tüm iletişim sunucu tarafında yapılır.

## Teknolojiler

- Next.js 16 (App Router) + TypeScript + React
- Tailwind CSS v4 + marka CSS değişkenleri
- Prisma + SQLite (yerel/cache/oturum/log; production’da PostgreSQL URL kullanılabilir)
- Zod doğrulama, iron-session (admin), bcryptjs
- `soap` ile Ticimax UrunServis / SiparisServis / UyeServis / CustomServis
- Vitest birim testleri

## Kurulum

```bash
git clone https://github.com/R0YC0LD/aromatherapica-web.git
cd aromatherapica-web
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
# Katalog seed (Excel'den üretilmiş 138 ürün)
npm run db:seed
# veya taze Excel:
# npm run import:xls -- "%USERPROFILE%\Downloads\TicimaxExport-4.xls"
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

### Ücretsiz kargo

Kargo **her zaman ücretsizdir** — Ticimax kargo çeki ile karşılanır; müşteriden kargo ücreti alınmaz (`src/lib/shipping.ts`).

## Ortam değişkenleri

`.env.example` dosyasına bakın. Özet:

| Değişken | Açıklama |
|---|---|
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin paneli (dev: `admin` / `12345`) |
| `SESSION_SECRET` | En az 32 karakter |
| `TICIMAX_BASE_URL` | Örn. `https://magaza.com/servis` |
| `TICIMAX_UYE_KODU` | Yetki / üye kodu (App.config `YetkiKodu`) |
| `TICIMAX_ALAN_ADI` | Mağaza alan adı |
| `DATABASE_URL` | Varsayılan `file:./dev.db` |
| `CRON_SECRET` | `/api/cron/sync` Bearer token |

## Ticimax API yapılandırması

Kaynak: `TicimaxWebService` örnek projesi (WSDL + C# method örnekleri).

Auth alanı: çoğu çağrıda `UyeKodu`. Endpoint’ler:

- `{BASE}/UrunServis.svc` — SelectUrun, SelectKategori, SelectVaryasyon, StokAdediGuncelle…
- `{BASE}/SiparisServis.svc` — SaveSiparis, SelectSiparis, GetOdemeTipleri…
- `{BASE}/UyeServis.svc` — GirisYap (`ug`), SaveUye (`u`,`ayar`), SaveUyeAdres…
- `{BASE}/CustomServis.svc` — kargo, iade, menü…

Yapılandırma sonrası admin panelinden **Ürün sync** çalıştırın.

## Komutlar

```bash
npm run dev          # geliştirme
npm run build        # production build
npm run start        # production sunucu
npm run lint
npm test             # vitest
npx prisma db push   # şema uygula
```

## Yönetim paneli (CMS)

- URL: `/admin/` veya `/admin.html`
- GitHub Pages’te de çalışır (yerel CMS: görsel, fiyat, stok, açıklama, Ticimax ayarları)
- Varsayılan giriş: `admin` / `12345` — panelden değiştirin
- Telefon/bilgisayardan galeri ile ürün görseli yükleme (sıkıştırılmış JPEG)
- Yedek al / yedek yükle (cihazlar arası taşıma)
- Ticimax bilgilerini panelden girip **entegrasyonu aktif** edebilirsiniz
- Canlı SOAP için ayrıca Node sunucusu + `.env` gerekir (aşağıdaki kurulum)

### Logo 5 tıklama

Aromatherapica logosuna **3 saniye içinde 5 kez** tıklanınca `/admin/` açılır.

## Senkronizasyon

- Admin → Entegrasyon → Ürün / Sipariş sync
- Cron: `GET /api/cron/sync` + `Authorization: Bearer $CRON_SECRET`
- Vercel örneği: `vercel.json`
- Batch + exponential backoff

## Ödeme güvenliği

- Kart numarası / CVV **işlenmez**
- Desteklenen tipler Ticimax dokümanına göre: Havale (1), Kapıda nakit (2), Kapıda KK (3 — Ticimax tarafı)
- Sipariş öncesi stok/fiyat yeniden doğrulanır
- `idempotencyKey` ile çift sipariş engellenir

## GitHub Pages (statik yayın)

Canlı site: `https://r0yc0ld.github.io/aromatherapica-web/`  
Yönetim: `https://r0yc0ld.github.io/aromatherapica-web/admin/`

- Ürünler `public/data/catalog.json` (138 ürün)
- Sepet / ödeme / CMS tarayıcıda çalışır
- `out/index.html` + `.nojekyll` ile Pages `index` ve `_next` klasörünü doğru servis eder
- `basePath` = `/aromatherapica-web`

```bash
npm run build:pages
```

## Kurulum — Ticimax canlı (Node)

1. `.env.example` → `.env` kopyalayın
2. Şunları doldurun:

| Alan | Nereye | Örnek |
|---|---|---|
| `TICIMAX_BASE_URL` | `.env` ve/veya Admin → Ayarlar | `https://magaza.com/servis` |
| `TICIMAX_UYE_KODU` | Yetki / üye kodu | Ticimax panelinden |
| `TICIMAX_ALAN_ADI` | Mağaza alan adı | `magaza.com` |
| `ADMIN_*` / `SESSION_SECRET` | Admin güvenliği | en az 32 karakter secret |
| `DATABASE_URL` | SQLite/Postgres | `file:./dev.db` |

3. Komutlar:

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

4. Tarayıcıda `/admin/` → Ayarlar → Ticimax bilgilerini girin → **entegrasyonu aktif et**
5. Node modunda SOAP test/sync `src/lib/ticimax/*` üzerinden çalışır (Urun / Siparis / Uye / Custom)

**Onay:** Entegrasyon kodu hazırdır; doğru `BASE_URL` + `UYE_KODU` ile ürün/stok/sipariş Ticimax SOAP’a bağlanır. GitHub Pages SOAP çağırmaz (tarayıcı kısıtı); vitrin + CMS Pages’te, canlı Ticimax Node’da.

```bash
docker compose up --build
```

## Güvenlik notları

- `.env` Git’e eklenmez
- SOAP anahtarları frontend’e gömülmez; Node tarafında okunur
- Production’da `ADMIN_PASSWORD=12345` kullanmayın
- Pages CMS şifresi tarayıcıda hash’lenir; yedek dosyanızı paylaşmayın

## Bilinen API kısıtlamaları

- Ticimax SOAP’tır; REST değil
- Kart verisi bu uygulamada işlenmez
- Webhook yok; polling/cron kullanılır

## Lisans

Özel proje — Aromatherapica
