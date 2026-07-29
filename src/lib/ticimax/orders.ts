import { callTicimax } from "@/lib/ticimax/soap-client";
import type { CartLineInput } from "@/lib/ticimax/types";
import { validateCartLines } from "@/lib/ticimax/stock-price";

export interface CreateOrderInput {
  idempotencyKey: string;
  memberId: number;
  billingAddressId: number;
  shippingAddressId: number;
  cargoCompanyId: number;
  paymentType: number;
  paymentOptionId: number;
  paymentStatus: number;
  lines: CartLineInput[];
  orderNote?: string;
}

export async function createTicimaxOrder(input: CreateOrderInput) {
  const validation = await validateCartLines(input.lines);
  if (!validation.valid) {
    throw new Error("Sepet stok veya fiyat doğrulamasından geçemedi");
  }

  const urunler = validation.lines.map((line) => {
    const unit = line.salePrice && line.salePrice < line.price ? line.salePrice : line.price;
    const kdvOrani = 20;
    const kdvTutari = (unit * line.quantity * kdvOrani) / (100 + kdvOrani);
    return {
      Adet: line.quantity,
      KdvOrani: kdvOrani,
      KdvTutari: Number(kdvTutari.toFixed(2)),
      Maliyet: 0,
      Tutar: Number((unit * line.quantity).toFixed(2)),
      UrunID: line.variantId,
    };
  });

  const odeme = {
    OdemeDurumu: input.paymentStatus,
    OdemeSecenekID: input.paymentOptionId,
    OdemeTipi: input.paymentType,
    Tarih: new Date().toISOString(),
    Tutar: validation.total,
  };

  const siparis = {
    FaturaAdresId: input.billingAddressId,
    KargoAdresId: input.shippingAddressId,
    KargoFirmaId: input.cargoCompanyId,
    KargoTutari: 0,
    Odeme: odeme,
    ParaBirimi: "TL",
    SiparisKaynagi: "Web",
    SiparisNotu: input.orderNote ?? "",
    Urunler: urunler,
    UrunTutari: validation.total,
    UyeId: input.memberId,
  };

  const { data } = await callTicimax<{ IsError?: boolean; ErrorMessage?: string; SiparisID?: number; SiparisKodu?: string }>(
    "SiparisServis",
    "SaveSiparis",
    { siparis },
  );

  if (data?.IsError) {
    throw new Error(data.ErrorMessage || "Sipariş oluşturulamadı");
  }

  return {
    orderId: data.SiparisID,
    orderCode: data.SiparisKodu,
    total: validation.total,
  };
}

export async function fetchOrders(limit = 20) {
  const webSiparisFiltre = {
    EntegrasyonAktarildi: -1,
    IptalEdilmisUrunler: true,
    OdemeDurumu: -1,
    OdemeTipi: -1,
    SiparisDurumu: -1,
    SiparisID: -1,
    TedarikciID: -1,
    UyeID: -1,
  };
  const webSiparisSayfalama = {
    BaslangicIndex: 0,
    KayitSayisi: limit,
    SiralamaDegeri: "id",
    SiralamaYonu: "Desc",
  };

  const { data } = await callTicimax<unknown>("SiparisServis", "SelectSiparis", {
    webSiparisFiltre,
    webSiparisSayfalama,
  });

  return Array.isArray(data) ? data : data ? [data] : [];
}

export async function fetchPaymentTypes() {
  const { data } = await callTicimax<unknown>("SiparisServis", "GetOdemeTipleri", {});
  return Array.isArray(data) ? data : data ? [data] : [];
}

export async function fetchCargoCompanies() {
  const { data } = await callTicimax<unknown>("CustomServis", "SelectKargoFirmalari", {});
  return Array.isArray(data) ? data : data ? [data] : [];
}

export async function setOrderStatus(orderId: number, status: number) {
  await callTicimax("SiparisServis", "SetSiparisDurum", {
    siparisId: orderId,
    durum: status,
  });
}
