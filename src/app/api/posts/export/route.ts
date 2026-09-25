import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const store = await cookies();
  const client = createServerClient(url, key, { cookies: { getAll: () => store.getAll(), setAll: values => values.forEach(({ name, value, options }) => store.set(name, value, options)) } });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  const { data: posts, error } = await client.from("posts").select("id,title,body,status,facebook_post_id,scheduled_at,created_at,updated_at").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const ids = (posts || []).map(post => post.id);
  const { data: media } = ids.length ? await client.from("post_media").select("post_id,storage_path,alt_text,sort_order").in("post_id", ids).order("sort_order") : { data: [] };
  const payload = { exported_at: new Date().toISOString(), posts: (posts || []).map(post => ({ ...post, media: (media || []).filter(item => item.post_id === post.id) })) };
  return new NextResponse(JSON.stringify(payload, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="lampam-posts-${new Date().toISOString().slice(0, 10)}.json"` } });
}
