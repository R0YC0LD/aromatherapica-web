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

Sepet ara toplamı **100.000 TL** ve üzeri olduğunda kargo ücretsizdir (`src/lib/shipping.ts`).

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

## Admin paneli

- URL: `/admin/login`
- Dev: `admin` / `12345` (kaynak kodda hardcode yok; `.env`)
- Production’da varsayılan şifre → zorunlu şifre değişimi
- Rate limit: 15 dk içinde 5 başarısız deneme
- HttpOnly + SameSite session cookie, CSRF koruması

### Logo 5 tıklama

Aromatherapica logosuna **3 saniye içinde 5 kez** tıklanınca `/admin/login` açılır. Bu bir güvenlik yöntemi değildir.

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

GitHub Pages Node/API çalıştırmaz. Bu yüzden mağaza vitrini `output: 'export'` ile statik üretilir:

- Ürünler `public/data/catalog.json` üzerinden gelir (138 ürün seed)
- Sepet / ödeme tarayıcıda çalışır
- Admin API ve Ticimax SOAP için Node sunucusu gerekir (`npm run dev` / Vercel)

### Yayın adımları

1. GitHub → **Settings → Pages → Source: GitHub Actions**
2. `master`/`main` push sonrası workflow `Deploy GitHub Pages` çalışır
3. Site: `https://r0yc0ld.github.io/aromatherapica-web/`

Yerelde statik derleme:

```bash
npm run build:pages
# çıktı: out/  (içinde index.html, .nojekyll, 404.html)
```

`basePath` otomatik olarak repo adıdır (`/aromatherapica-web`). Böylece CSS/JS yolları kırılmaz ve Pages `index.html` bulur.

## Deployment (Node / Ticimax canlı)

1. Repo’yu clone edin, env doldurun
2. `npm run build && npm start` veya Vercel/Docker
3. `CRON_SECRET` ile zamanlanmış sync ekleyin

```bash
docker compose up --build
```

## Güvenlik notları

- `.env` Git’e eklenmez
- API anahtarları frontend bundle’a girmez
- Admin API’leri session + middleware ile korunur
- Production’da `ADMIN_PASSWORD=12345` kullanmayın

## Bilinen API kısıtlamaları

- Ticimax SOAP’tır; REST değil
- Ödeme gateway redirect/webhook bu örnek pakette yok; kartlı ödeme Ticimax mağaza ödeme sayfası üzerinden yapılmalıdır
- Webhook dosyası yok; polling/cron kullanılır
- Ürün düzenleme admin’de salt okunur (SaveUrun admin’den bilinçli tetiklenmez)

## Lisans

Özel proje — Aromatherapica
