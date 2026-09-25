import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI || `${new URL(request.url).origin}/api/meta/callback`;
  if (!appId) return NextResponse.json({ connected: false, error: "ยังไม่ได้ตั้งค่า META_APP_ID" }, { status: 503 });
  const cookieStore = await cookies();
  const state = crypto.randomUUID();
  // Start with permissions available immediately to a development app. Page
  // permissions require the matching Meta use case and App Review before
  // Meta will accept them in the OAuth dialog.
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    scope: "public_profile,pages_show_list",
  });
  const response = NextResponse.redirect(`https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`);
  response.cookies.set("lampam_meta_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
