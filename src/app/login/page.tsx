"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [resetMode, setResetMode] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setResetMode(new URLSearchParams(window.location.search).get("reset") === "1");
    const remembered = window.localStorage.getItem("lampam_login_email");
    if (remembered) setEmail(remembered);
    if (new URLSearchParams(window.location.search).get("reset") === "1") return;
    // Do not redirect automatically from a cached browser session. If the
    // session is stale, the proxy can reject `/` and send the browser back
    // here repeatedly. The user can sign in explicitly with the form below.
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const client = createSupabaseBrowserClient();
    if (!client) { setMessage("ยังไม่ได้ตั้งค่า Supabase ใน .env.local"); setBusy(false); return; }
    window.localStorage.setItem("lampam_login_email", email);
    if (resetMode) { const { error } = await client.auth.updateUser({ password }); setMessage(error ? error.message : "ตั้งรหัสผ่านใหม่แล้ว กำลังเปิดพื้นที่ทำงาน…"); setBusy(false); if (!error) window.location.replace("/"); return; }
    const result = mode === "password" ? await client.auth.signInWithPassword({ email, password }) : await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(new URLSearchParams(window.location.search).get("next") || "/")}` } });
    setMessage(result.error ? result.error.message : mode === "password" ? "เข้าสู่ระบบแล้ว กำลังเปิดพื้นที่ทำงาน…" : "ส่งลิงก์เข้าสู่ระบบไปที่อีเมลแล้ว กรุณาตรวจกล่องข้อความ"); setBusy(false);
    if (!result.error && mode === "password") window.location.replace(new URLSearchParams(window.location.search).get("next") || "/");
  }
  async function resetPassword() {
    setBusy(true); setMessage(""); const client = createSupabaseBrowserClient();
    if (!client) { setMessage("ยังไม่ได้ตั้งค่า Supabase ใน .env.local"); setBusy(false); return; }
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login?reset=1` });
    setMessage(error ? error.message : "ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว"); setBusy(false);
  }
  return <main className="login-shell"><section className="login-card"><div className="brand">lampam<span>•</span>manager</div><h1>{resetMode ? "ตั้งรหัสผ่านใหม่" : "เข้าสู่ระบบ"}</h1><p>{resetMode ? "ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ" : "เข้าสู่พื้นที่ทำงานของทีม"}</p><form onSubmit={submit}><label className="label" htmlFor="email">อีเมล</label><input id="email" className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>{(mode === "password" || resetMode) && <><label className="label" htmlFor="password">{resetMode ? "รหัสผ่านใหม่" : "รหัสผ่าน"}</label><input id="password" className="input" type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร"/></>}<button className="primary login-button" disabled={busy}>{busy?"กำลังตรวจสอบ…":resetMode ? "บันทึกรหัสผ่านใหม่" : mode === "password" ? "เข้าสู่ระบบ" : "ส่งลิงก์เข้าสู่ระบบ"}</button></form>{!resetMode && mode === "password" && <><button type="button" className="text-button" onClick={resetPassword} disabled={busy}>ลืมรหัสผ่าน?</button><div className="login-divider"><span>หรือ</span></div><button type="button" className="link-button" onClick={()=>setMode("magic")} disabled={busy}>เข้าสู่ระบบด้วยลิงก์ในอีเมล</button></>}{!resetMode && mode === "magic" && <button type="button" className="link-button" onClick={()=>setMode("password")} disabled={busy}>กลับไปใช้รหัสผ่าน</button>}{message&&<div className="login-message" role="status">{message}</div>}</section></main>;
}

