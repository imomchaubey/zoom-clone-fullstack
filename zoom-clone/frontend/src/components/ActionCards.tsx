"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Video } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import JoinModal from "./JoinModal";

const tile = "h-[132px] w-full rounded-2xl text-white flex flex-col items-center justify-center gap-3 transition active:scale-[0.98]";

export default function ActionCards() {
  const router = useRouter();
  const [joinOpen, setJoinOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function newMeeting() {
    setBusy(true); setError("");
    try {
      const m = await api.createInstant();
      router.push(`/meeting/${m.meeting_code}?host=1&name=${encodeURIComponent("Om Prakash")}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start the meeting.");
      setBusy(false);
    }
  }

  const label = "text-sm font-medium";
  return (
    <>
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <button onClick={newMeeting} disabled={busy} className={`${tile} bg-[#FF742E] hover:bg-[#E8631F] disabled:opacity-70`}>
          <Video size={34} /><span className={label}>{busy ? "Starting…" : "New meeting"}</span>
        </button>
        <button onClick={() => setJoinOpen(true)} className={`${tile} bg-[#0B5CFF] hover:bg-[#0948C7]`}>
          <Plus size={34} /><span className={label}>Join</span>
        </button>
        <Link href="/schedule" className={`${tile} bg-[#0B5CFF] hover:bg-[#0948C7]`}>
          <Calendar size={34} /><span className={label}>Schedule</span>
        </Link>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-[#D93025]">{error}</p>}
      {joinOpen && <JoinModal onClose={() => setJoinOpen(false)} />}
    </>
  );
}
