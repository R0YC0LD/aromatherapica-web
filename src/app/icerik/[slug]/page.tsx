import Link from "next/link";

const PAGES: Record<string, { title: string; body: string }> = {
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    body: "Kişisel verileriniz, sipariş ve üyelik süreçlerinin yürütülmesi amacıyla Ticimax altyapısı ve bu site üzerinden işlenir. Detaylı metin mağaza politikalarına göre güncellenmelidir.",
  },
  gizlilik: {
    title: "Gizlilik Politikası",
    body: "Ödeme kartı verileri bu uygulamada işlenmez veya saklanmaz. API anahtarları yalnızca sunucu tarafında tutulur.",
  },
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    body: "Mesafeli satış sözleşmesi Ticimax / mağaza yasal metinleri ile uyumlu olacak şekilde yayınlanmalıdır.",
  },
  iade: {
    title: "İade ve Değişim",
    body: "İade talepleri Ticimax CustomServis SelectIadeTalebi / UpdateIadeTalebi desteklediği ölçüde yönetilir.",
  },
  teslimat: {
    title: "Teslimat",
    body: "Kargo seçenekleri Ticimax GetKargoSecenek / SelectKargoFirmalari üzerinden alınabilir.",
  },
  iletisim: {
    title: "İletişim",
    body: "Müşteri hizmetleri iletişim bilgilerinizi buraya ekleyin.",
  },
  markamiz: {
    title: "Markamız",
    body: "Aromatherapica — doğanın bilgisinden modern bakım ritüellerine.",
  },
};

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) {
    return (
      <section className="section">
        <h1>Sayfa bulunamadı</h1>
        <Link href="/">Ana sayfa</Link>
      </section>
    );
  }

  return (
    <section className="section" style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>{page.title}</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{page.body}</p>
    </section>
  );
}
