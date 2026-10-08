"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Meeting } from "@/lib/api";
import { formatDay, formatRange } from "@/lib/format";

type Props = {
  title: string;
  meetings: Meeting[] | null; // null = loading
  error?: string;
  variant: "upcoming" | "recent";
  emptyText: string;
};

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      aria-label="Copy invitation link"
      title="Copy invitation link"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
      }}
      className="p-2 rounded-lg text-[#4A4F57] hover:bg-[#F2F4F7]"
    >
      {done ? <Check size={16} className="text-[#188038]" /> : <Copy size={16} />}
    </button>
  );
}

export default function MeetingList({ title, meetings, error, variant, emptyText }: Props) {
  return (
    <section className="rounded-2xl border border-[#E4E6EB] bg-white">
      <h2 className="px-5 py-4 text-[17px] font-semibold text-[#232333] border-b border-[#E4E6EB]">{title}</h2>
      {error ? (
        <p className="p-5 text-sm text-[#D93025]">{error}</p>
      ) : meetings === null ? (
        <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-[#F2F4F7] animate-pulse" />)}</div>
      ) : meetings.length === 0 ? (
        <p className="p-5 text-sm text-[#6E7680]">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-[#EEF0F3]">
          {meetings.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-[92px] shrink-0">
                <div className="text-sm font-semibold text-[#232333]">{m.scheduled_start ? formatDay(m.scheduled_start) : "—"}</div>
                <div className="text-xs text-[#6E7680]">{m.scheduled_start ? formatRange(m.scheduled_start, m.duration_minutes) : ""}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-[#232333]">{m.title}</div>
                <div className="truncate text-xs text-[#6E7680]">Meeting ID: {m.formatted_code}</div>
              </div>
              {variant === "upcoming" && (
                <>
                  <CopyButton text={m.join_url} />
                  <Link
                    href={`/meeting/${m.meeting_code}?host=1&name=${encodeURIComponent("Om Prakash")}`}
                    className="h-8 px-4 rounded-lg bg-[#0B5CFF] text-white text-sm font-semibold flex items-center hover:bg-[#0948C7]"
                  >
                    Start
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
