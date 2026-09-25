import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Meta Pages API ยังไม่ได้เชื่อมต่อ" }, { status: 501 });
}
