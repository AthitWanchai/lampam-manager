# การนำ lampam-manager ไปทดสอบ

## ก่อน deploy

1. ตั้งค่า Supabase project และรัน `supabase/schema.sql`
2. สร้าง private Storage bucket ชื่อ `post-media`
3. ตั้งค่า Email Auth และเพิ่ม URL ของเว็บใน Auth URL Configuration
4. เตรียม environment variables จาก `.env.example`
5. ตรวจ `bun install`, `bun run build` และ `bun run lint`

## ตัวแปรที่ต้องตั้ง

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
META_APP_ID
META_APP_SECRET
META_REDIRECT_URI
```

`SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะ server route `/api/team/invite` และห้ามใส่ใน client code เด็ดขาด ห้าม commit `.env.local`

## ทดสอบในเครื่อง

```bash
bun install
bun run dev
```

เปิด `/login` เพื่อเข้าสู่ระบบ แล้วทดลองสร้างโพสต์ อัปโหลดรูป ตั้งเวลา และเปิด `/schedule`

หลังล็อกอิน เปิด `/settings/team` เพื่อเชิญสมาชิกด้วยชื่อและอีเมล ระบบจะส่งคำเชิญผ่าน Supabase Auth และแสดงรายชื่อสมาชิกในหน้าเดียวกัน

## ก่อนใช้กับเพจจริง

- ทดสอบด้วยบัญชีและเพจที่ได้รับอนุญาต
- ตรวจ App Review และ permissions ของ Meta
- ตรวจ callback URL ให้ตรงกับ deployment URL
- ทดสอบ token หมดอายุและสิทธิ์ถูกถอน
- ยังไม่ควรใช้ route publish จนกว่าจะทำ token storage และ retry/idempotency เสร็จ
