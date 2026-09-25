import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const store = await cookies();
  const client = createServerClient(url, key, { cookies: { getAll: () => store.getAll(), setAll: values => values.forEach(({ name, value, options }) => store.set(name, value, options)) } });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 });
  const { postId, path } = await request.json();
  if (!postId || !path || !path.startsWith(`${user.id}/`)) return NextResponse.json({ error: "ข้อมูลรูปไม่ถูกต้อง" }, { status: 400 });
  const { data, error } = await client.from("post_media").upsert({ post_id: postId, storage_path: path }, { onConflict: "post_id,storage_path" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
