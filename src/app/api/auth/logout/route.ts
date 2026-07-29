import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("arom_customer_session")?.value;
  if (token) {
    await prisma.customerSession.deleteMany({ where: { sessionToken: token } });
    cookieStore.delete("arom_customer_session");
  }
  return NextResponse.json({ ok: true });
}
