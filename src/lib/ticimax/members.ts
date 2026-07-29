import { callTicimax } from "@/lib/ticimax/soap-client";

export async function loginMember(email: string, password: string) {
  const { data } = await callTicimax<{ Basarili?: boolean; Mesaj?: string; UyeID?: number }>(
    "UyeServis",
    "GirisYap",
    {
      ug: {
        Admin: false,
        Mail: email,
        Sifre: password,
        Otp: "",
      },
    },
    { includeAuth: false },
  );

  return data;
}

export async function registerMember(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const uye = {
    ID: 0,
    Isim: payload.firstName,
    Soyisim: payload.lastName,
    Mail: payload.email,
    Sifre: payload.password,
    Telefon: payload.phone ?? "",
    CepTelefonu: payload.phone ?? "",
    Aktif: true,
    MailIzin: false,
    SmsIzin: false,
    UyeTuruID: 1,
  };

  const uyeAyar = {
    IsimGuncelle: true,
    SoyisimGuncelle: true,
    MailGuncelle: true,
    SifreGuncelle: true,
    TelefonGuncelle: true,
    CepTelefonuGuncelle: true,
    MailIzinGuncelle: true,
    SmsIzinGuncelle: true,
  };

  const { data } = await callTicimax<number>("UyeServis", "SaveUye", { u: uye, ayar: uyeAyar });
  return data;
}

export async function fetchMemberAddresses(memberId: number) {
  const { data } = await callTicimax<unknown>("UyeServis", "SelectUyeAdres", {
    uyeId: memberId,
    adresId: 0,
  });
  return Array.isArray(data) ? data : data ? [data] : [];
}

export async function saveMemberAddress(address: Record<string, unknown>) {
  const { data } = await callTicimax<number>("UyeServis", "SaveUyeAdres", { uyeAdres: address });
  return data;
}

export async function fetchMemberOrders(memberId: number, limit = 20) {
  const uyeFiltre = { UyeID: memberId, Aktif: -1, AlisverisYapti: -1, Cinsiyet: -1, MailIzin: -1, SmsIzin: -1 };
  const uyeSayfalama = { SayfaNo: 1, SiralamaDegeri: "id", SiralamaYonu: "Desc" };
  await callTicimax("UyeServis", "SelectUyeler", { uyeFiltre, uyeSayfalama });

  const webSiparisFiltre = { UyeID: memberId, OdemeDurumu: -1, OdemeTipi: -1, SiparisDurumu: -1, SiparisID: -1, TedarikciID: -1, EntegrasyonAktarildi: -1, IptalEdilmisUrunler: true };
  const webSiparisSayfalama = { BaslangicIndex: 0, KayitSayisi: limit, SiralamaDegeri: "id", SiralamaYonu: "Desc" };
  const { data } = await callTicimax<unknown>("SiparisServis", "SelectSiparis", {
    webSiparisFiltre,
    webSiparisSayfalama,
  });
  return Array.isArray(data) ? data : data ? [data] : [];
}
