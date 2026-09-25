import type { SupabaseClient } from "@supabase/supabase-js";

export type PostRow = {
  id: string;
  title: string;
  body: string;
  status: "draft" | "ready" | "scheduled" | "published" | "archived";
  scheduled_at: string | null;
  updated_at: string;
};

export async function listPosts(client: SupabaseClient, limit = 50) {
  return client.from("posts").select("id,title,body,status,scheduled_at,updated_at").order("updated_at", { ascending: false }).limit(limit);
}

export async function savePost(client: SupabaseClient, input: Pick<PostRow, "id" | "title" | "body" | "status"> & { created_by?: string }) {
  return client.from("posts").upsert({ ...input, updated_at: new Date().toISOString() }).select().single();
}
