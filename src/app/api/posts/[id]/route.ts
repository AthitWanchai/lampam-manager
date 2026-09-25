import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const store = await cookies(); const client = createServerClient(url, key, { cookies: { getAll: () => store.getAll(), setAll: values => values.forEach(({ name, value, options }) => store.set(name, value, options)) } });
  const { data: { user } } = await client.auth.getUser(); if (!user) return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  const { id } = await context.params; const { data: post, error } = await client.from("posts").select("id,title,body,status,scheduled_at,updated_at").eq("id", id).single();
  if (error || !post) return NextResponse.json({ error: error?.message || "ไม่พบโพสต์" }, { status: 404 });
  const { data: media } = await client.from("post_media").select("id,storage_path,alt_text,sort_order").eq("post_id", id).order("sort_order");
  const withUrls = await Promise.all((media || []).map(async item => { const signed = await client.storage.from("post-media").createSignedUrl(item.storage_path, 3600); return { ...item, url: signed.data?.signedUrl || null }; }));
  return NextResponse.json({ ...post, media: withUrls });
}
