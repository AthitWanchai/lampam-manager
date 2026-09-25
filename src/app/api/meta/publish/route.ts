import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptSecret } from "@/lib/security/encryption";

export async function POST(request: Request) {
  const page = (await cookies()).get("lampam_meta_page")?.value;
  if (!page) return NextResponse.json({ error: "ยังไม่ได้เชื่อมต่อ Facebook Page" }, { status: 401 });
  try {
    const { message } = await request.json();
    if (typeof message !== "string" || !message.trim()) return NextResponse.json({ error: "กรุณาใส่ข้อความโพสต์" }, { status: 400 });
    const { id, token } = JSON.parse(decryptSecret(page)) as { id: string; token: string };
    const params = new URLSearchParams({ message: message.trim(), access_token: token });
    const response = await fetch(`https://graph.facebook.com/v24.0/${id}/feed`, { method: "POST", body: params, cache: "no-store" });
    const result = await response.json();
    if (!response.ok) return NextResponse.json({ error: result.error?.message || "เผยแพร่โพสต์ไม่สำเร็จ" }, { status: 400 });
    return NextResponse.json({ published: true, id: result.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "เผยแพร่โพสต์ไม่สำเร็จ" }, { status: 500 });
  }
}
