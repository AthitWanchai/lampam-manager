import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptSecret } from "@/lib/security/encryption";

export async function GET() {
  const pageCookie = (await cookies()).get("lampam_meta_page")?.value;
  if (pageCookie) {
    try {
      const page = JSON.parse(decryptSecret(pageCookie)) as { name?: string };
      return NextResponse.json({ connected: true, pageName: page.name, message: page.name ? `เชื่อมต่อเพจ ${page.name} แล้ว` : "เชื่อมต่อ Meta แล้ว" });
    } catch { /* an old or invalid token cookie should be treated as disconnected */ }
  }
  const legacyConnected = (await cookies()).get("lampam_meta_connected")?.value === "1";
  return NextResponse.json(legacyConnected
    ? { connected: true, message: "เชื่อมต่อ Meta แล้ว กรุณาเชื่อมต่อใหม่เพื่อเปิดใช้การเผยแพร่" }
    : { connected: false, message: "ต้องตั้งค่า Meta App, Facebook Login for Business และ Page access token ก่อน" });
}
