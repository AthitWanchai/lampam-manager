"use client";
import { useState } from "react";
type MediaItem = { id?: string; path: string; url: string };

export function MediaUploader({ postId, initialItems = [], onUploaded }: { postId?: string; initialItems?: MediaItem[]; onUploaded?: (path: string) => void }) {
  const [items, setItems] = useState<MediaItem[]>(initialItems); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const [dragIndex, setDragIndex] = useState<number | null>(null);
  async function choose(files: FileList | null) {
    if (!files?.length) return; setBusy(true); setMessage("");
    for (const file of Array.from(files)) {
      const form = new FormData(); form.append("file", file); const response = await fetch("/api/media", { method: "POST", body: form }); const result = await response.json();
      if (!response.ok || !result.path) { setMessage(result.error || "อัปโหลดไม่สำเร็จ"); continue; }
      let id: string | undefined;
      if (postId && !postId.startsWith("demo-")) { const attached = await fetch("/api/media/attach", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId, path: result.path }) }); if (attached.ok) id = (await attached.json()).id; }
      setItems(current => [...current, { id, path: result.path, url: URL.createObjectURL(file) }]); onUploaded?.(result.path);
    }
    setMessage("อัปโหลดรูปแล้ว"); setBusy(false);
  }
  async function remove(item: MediaItem) { if (item.id) await fetch("/api/media/manage", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id }) }); setItems(current => current.filter(candidate => candidate !== item)); }
  async function move(index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; setItems(next); if (postId && !postId.startsWith("demo-")) await fetch("/api/media/manage", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId, media: next }) }); }
  async function drop(index: number) { if (dragIndex === null || dragIndex === index) return; const next = [...items]; const [picked] = next.splice(dragIndex, 1); next.splice(index, 0, picked); setItems(next); setDragIndex(null); if (postId && !postId.startsWith("demo-")) await fetch("/api/media/manage", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId, media: next }) }); }
  return <div className="media-manager"><div className="media-grid">{items.map((item, index) => <div className="media-item" key={item.path} draggable onDragStart={() => setDragIndex(index)} onDragOver={e => e.preventDefault()} onDrop={() => drop(index)}><img src={item.url} className="upload-preview" alt={`รูปประกอบลำดับที่ ${index + 1}`} /><div className="media-item-actions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0}>←</button><button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}>→</button><button type="button" onClick={() => remove(item)}>ลบ</button></div></div>)}</div><label className="upload upload-clickable"><span>{busy ? "กำลังอัปโหลด…" : "เพิ่มรูปประกอบ"}</span><small>เลือกได้หลายรูป · ลากเพื่อเรียงลำดับ · JPG, PNG, WebP ไม่เกิน 10 MB {message && `· ${message}`}</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => choose(e.target.files)} /></label></div>;
}
