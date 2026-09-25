# lampam-manager

ต้นแบบเว็บสำหรับจัดการคอนเทนต์ของ Facebook Page สำหรับทีมเล็ก ๆ โดยเริ่มจากการสร้าง แก้ไข ค้นหา และทำสำเนาโพสต์ภายในระบบก่อน แล้วค่อยเชื่อมต่อ Meta Pages API ในระยะถัดไป

## Stack

- Next.js + TypeScript + App Router
- Tailwind CSS (เตรียมไว้สำหรับขยาย UI)
- TanStack Form + Zod (เตรียมไว้สำหรับฟอร์มจริง)
- Supabase Free (Auth, PostgreSQL และ Storage เชื่อมไว้แล้ว)
- Meta Graph API / Pages API (มี OAuth skeleton และยังรอ Meta App จริง)

## เริ่มรันในเครื่อง

```bash
bun install
bun run dev
```

จากนั้นเปิด `http://localhost:3000`

## สถานะต้นแบบ

ตอนนี้มี dashboard แบบ Facebook Page สำหรับค้นหา กรองสถานะ สร้าง/แก้ไข/ทำสำเนา/เก็บโพสต์ จัดการรูปหลายรูป ตั้งเวลาในระบบ และ export สำรองข้อมูล โพสต์กับรูปเก็บใน Supabase เมื่อใส่ค่าใน `.env.local` แล้ว

การเข้าสู่ระบบเป็นแบบเชิญเท่านั้น ผู้ดูแลเพิ่มสมาชิกจาก Supabase Dashboard > Authentication > Users > Invite user แล้วสมาชิกใช้ email + password หรือ Magic Link เข้าใช้งาน

## เตรียม Supabase รุ่นถัดไป

1. สร้างโปรเจค Supabase ใหม่
2. เปิด SQL Editor แล้วรัน [supabase/schema.sql](supabase/schema.sql)
3. สร้าง Storage bucket ชื่อ `post-media` และตั้งเป็น private
4. คัดลอก `.env.example` เป็น `.env.local` แล้วเติมค่าจาก Supabase Dashboard
5. เติม `SUPABASE_SERVICE_ROLE_KEY` ใน `.env.local` เฉพาะฝั่ง server เพื่อเปิดหน้าเพิ่มสมาชิกทีม (ห้ามใส่ค่านี้ใน Client หรือ Git)
6. ผู้ใช้ที่ล็อกอินแล้วเปิดเมนู “เพิ่มสมาชิกทีม” กรอกชื่อและอีเมล ระบบจะส่งคำเชิญให้เอง

ตรวจ production build ด้วย `bun run build` และตรวจสถานะระบบได้ที่ `GET /api/health`

ตรวจค่าตั้งค่าก่อนรันด้วย PowerShell: `./scripts/check-setup.ps1` (สคริปต์จะแสดงเฉพาะว่ามีค่าหรือขาด ไม่แสดง secret)

ยังไม่ควรใส่ค่า secret จริงใน Git หรือส่งผ่านแชต

## API อัปโหลดรูป

`POST /api/media` รับ `multipart/form-data` field ชื่อ `file` เฉพาะ JPG, PNG และ WebP ขนาดไม่เกิน 10 MB และต้องมี Supabase session ก่อนอัปโหลด

## Meta Pages API

มี route ตรวจสถานะที่ `GET /api/meta/status` และ route เตรียมเผยแพร่ที่ `POST /api/meta/publish` ซึ่งจะตอบสถานะยังไม่เชื่อมต่อจนกว่าจะตั้งค่า Meta App, Facebook Login for Business และ Page access token ตามเอกสารค้นคว้า

Callback สำหรับ Meta App คือ `GET /api/meta/callback` และ URL ที่ต้องใส่ใน Meta App คือค่าจาก `META_REDIRECT_URI` ใน `.env.local`
## บัญชีผู้ใช้รุ่นแรก

ระบบใช้แบบเชิญเท่านั้น ผู้ดูแลเพิ่มสมาชิกจาก Supabase Dashboard > Authentication > Users > Invite user แล้วสมาชิกเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน หรือใช้ Magic Link เป็นทางเลือก ไม่มีการเปิดสมัครบัญชีจากหน้าเว็บ
