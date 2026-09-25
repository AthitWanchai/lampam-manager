import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "lampam-manager", description: "จัดเตรียมโพสต์สำหรับทีมการตลาด" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}</body></html>; }
