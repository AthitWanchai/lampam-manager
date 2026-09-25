import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url); const code = requestUrl.searchParams.get("code"); const error = requestUrl.searchParams.get("error_description");
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (!code) return NextResponse.json({ error: "ไม่พบ authorization code จาก Meta" }, { status: 400 });
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("lampam_meta_oauth_state")?.value;
  if (!expectedState || expectedState !== requestUrl.searchParams.get("state")) return NextResponse.json({ error: "OAuth state ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
  const appId = process.env.META_APP_ID; const appSecret = process.env.META_APP_SECRET; const redirectUri = process.env.META_REDIRECT_URI || `${requestUrl.origin}/api/meta/callback`;
  if (!appId || !appSecret) return NextResponse.json({ connected: false, message: "ได้รับ authorization code แล้ว แต่ยังไม่ได้ตั้งค่า Meta App secret" });
  const tokenParams = new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code });
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(`https://graph.facebook.com/v24.0/oauth/access_token?${tokenParams}`, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "ติดต่อ Meta Graph API ไม่ได้จากเครื่องที่รัน localhost", connected: false }, { status: 502 });
  }
  const tokenResult = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenResult.access_token) return NextResponse.json({ error: "แลก authorization code กับ Meta ไม่สำเร็จ", detail: tokenResult.error?.message }, { status: 400 });
  let pagesResponse: Response;
  try {
    pagesResponse = await fetch(`https://graph.facebook.com/v24.0/me/accounts?fields=id,name,tasks,access_token&access_token=${encodeURIComponent(tokenResult.access_token)}`, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "แลก token ได้แล้ว แต่ติดต่อ Meta เพื่ออ่านรายการเพจไม่ได้", connected: false }, { status: 502 });
  }
  const pagesResult = await pagesResponse.json();
  if (!pagesResponse.ok) return NextResponse.json({ error: "อ่านรายการเพจจาก Meta ไม่สำเร็จ", detail: pagesResult.error?.message }, { status: 400 });
  const response = NextResponse.redirect(new URL("/settings/facebook?connected=1", requestUrl));
  response.cookies.set("lampam_meta_connected", "1", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  const firstPage = (pagesResult.data || [])[0];
  if (firstPage?.id && firstPage?.access_token) response.cookies.set("lampam_meta_page", JSON.stringify({ id: firstPage.id, token: firstPage.access_token, name: firstPage.name }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  response.cookies.set("lampam_meta_oauth_state", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" });
  return response;
}
