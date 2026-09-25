import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ connected: false, message: "ต้องตั้งค่า Meta App, Facebook Login for Business และ Page access token ก่อน" });
}
