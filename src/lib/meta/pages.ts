export type MetaPage = { id: string; name: string; access_token?: string; tasks?: string[] };
export type MetaPostInput = { message: string; imageUrls?: string[]; scheduledAt?: string };

export async function publishToPage(_page: MetaPage, _input: MetaPostInput) {
  throw new Error("Meta Pages API ยังไม่ได้เชื่อมต่อ: ต้องตั้งค่า Meta App และ Page access token ก่อน");
}

export async function listManagedPages() {
  throw new Error("Meta Pages API ยังไม่ได้เชื่อมต่อ");
}
