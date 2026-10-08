"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function JoinModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("Om Prakash");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!query.trim()) return setError("Enter a meeting ID or invite link.");
    if (!name.trim()) return setError("Enter your name.");
    setBusy(true);
    try {
      const m = await api.lookup(query.trim()); // validates the meeting exists
      if (m.status === "ended") throw new ApiError(410, "This meeting has ended.");
      router.push(`/meeting/${m.meeting_code}?name=${encodeURIComponent(name.trim())}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const field = "w-full h-11 rounded-lg border border-[#C9CED6] px-3 text-[15px] outline-none focus:border-[#0B5CFF] focus:ring-2 focus:ring-[#0B5CFF]/25";
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E6EB]">
          <h2 className="text-lg font-semibold text-[#232333]">Join meeting</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded hover:bg-[#F2F4F7]"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <input ref={ref} value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="Meeting ID or invite link" className={field} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
          {error && <p role="alert" className="text-sm text-[#D93025]">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E4E6EB]">
          <button type="button" onClick={onClose} className="h-10 px-5 rounded-lg bg-[#F2F4F7] text-sm font-semibold hover:bg-[#E4E6EB]">Cancel</button>
          <button disabled={busy} className="h-10 px-6 rounded-lg bg-[#0B5CFF] text-white text-sm font-semibold hover:bg-[#0948C7] disabled:opacity-60">
            {busy ? "Checking…" : "Join"}
          </button>
        </div>
      </form>
    </div>
  );
}
