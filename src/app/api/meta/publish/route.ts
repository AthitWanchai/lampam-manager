import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const page = (await cookies()).get("lampam_meta_page")?.value;
  if (!page) return NextResponse.json({ error: "ยังไม่ได้เชื่อมต่อ Facebook Page" }, { status: 401 });
  const { message, image_url } = await request.json();
  const { id, token } = JSON.parse(page);
  const params = new URLSearchParams({ message: message || "", access_token: token });
  if (image_url) params.set("url", image_url);
  const response = await fetch(`https://graph.facebook.com/v24.0/${id}/feed`, { method: "POST", body: params });
  const result = await response.json();
  if (!response.ok) return NextResponse.json({ error: result.error?.message || "เผยแพร่โพสต์ไม่สำเร็จ" }, { status: 400 });
  return NextResponse.json({ published: true, id: result.id });
}
