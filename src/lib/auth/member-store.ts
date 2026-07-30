/** Client-side member session for GitHub Pages / offline demo. */

export type MemberProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
};

type MemberRecord = MemberProfile & { passwordHash: string };

const MEMBERS_KEY = "arom_members_v1";
const SESSION_KEY = "arom_member_session_v1";

function readMembers(): MemberRecord[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MemberRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMembers(members: MemberRecord[]) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`arom:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getMemberSession(): MemberProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemberProfile;
  } catch {
    return null;
  }
}

export function clearMemberSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function setMemberSession(profile: MemberProfile) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
}

function setSession(profile: MemberProfile) {
  setMemberSession(profile);
}

function toProfile(member: MemberRecord): MemberProfile {
  return {
    id: member.id,
    email: member.email,
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    createdAt: member.createdAt,
  };
}

export async function registerLocalMember(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<{ ok: true; member: MemberProfile } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || input.password.length < 6) {
    return { ok: false, error: "E-posta ve en az 6 karakter şifre gerekli." };
  }
  if (!input.firstName.trim() || !input.lastName.trim()) {
    return { ok: false, error: "Ad ve soyad gerekli." };
  }

  const members = readMembers();
  if (members.some((m) => m.email === email)) {
    return { ok: false, error: "Bu e-posta ile zaten bir hesap var. Giriş yapın." };
  }

  const member: MemberRecord = {
    id: `m_${Date.now().toString(36)}`,
    email,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone?.trim() || undefined,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(input.password),
  };
  writeMembers([...members, member]);
  const profile = toProfile(member);
  setSession(profile);
  return { ok: true, member: profile };
}

export async function loginLocalMember(
  emailRaw: string,
  password: string,
): Promise<{ ok: true; member: MemberProfile } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  const members = readMembers();
  const found = members.find((m) => m.email === email);
  if (!found) {
    return { ok: false, error: "Bu e-posta ile kayıtlı hesap bulunamadı." };
  }
  const hash = await hashPassword(password);
  if (hash !== found.passwordHash) {
    return { ok: false, error: "E-posta veya şifre hatalı." };
  }
  const profile = toProfile(found);
  setSession(profile);
  return { ok: true, member: profile };
}
