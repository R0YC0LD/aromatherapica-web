import { NextResponse } from "next/server";
import { isTicimaxConfigured } from "@/lib/env";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    ok: dbOk,
    ticimaxConfigured: isTicimaxConfigured(),
    db: dbOk ? "up" : "down",
    ts: new Date().toISOString(),
  });
}
