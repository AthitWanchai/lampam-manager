import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const connected = (await cookies()).get("lampam_meta_connected")?.value === "1";
  return NextResponse.json(connected
    ? { connected: true, message: "เชื่อมต่อ Meta แล้ว" }
    : { connected: false, message: "ต้องตั้งค่า Meta App, Facebook Login for Business และ Page access token ก่อน" });
}
