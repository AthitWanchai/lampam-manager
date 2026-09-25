import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function clientFor(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient(url, key, { cookies: { getAll: () => store.getAll(), setAll: values => values.forEach(({ name, value, options }) => store.set(name, value, options)) } });
}

export async function PATCH(request: Request) {
  const client = await clientFor(request);
  if (!client) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  const body = await request.json();
  if (!body.postId || !Array.isArray(body.media)) return NextResponse.json({ error: "ข้อมูลรูปไม่ถูกต้อง" }, { status: 400 });
  const rows = body.media.map((item: { id: string }, index: number) => ({ id: item.id, sort_order: index }));
  for (const row of rows) {
    const { error } = await client.from("post_media").update({ sort_order: row.sort_order }).eq("id", row.id).eq("post_id", body.postId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const client = await clientFor(request);
  if (!client) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  const { id } = await request.json();
  const { data: media, error: readError } = await client.from("post_media").select("id,storage_path").eq("id", id).single();
  if (readError || !media) return NextResponse.json({ error: "ไม่พบรูป" }, { status: 404 });
  if (!media.storage_path.startsWith(`${user.id}/`)) return NextResponse.json({ error: "ไม่มีสิทธิ์ลบรูปนี้" }, { status: 403 });
  const { error } = await client.from("post_media").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await client.storage.from("post-media").remove([media.storage_path]);
  return NextResponse.json({ ok: true });
}
