"use client";
import { useSyncExternalStore } from "react";

// External store = the system clock. Server snapshot is 0 => renders blank on the server,
// so there is no hydration mismatch. Snapshot is rounded to 15s so it is stable between reads.
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 15_000);
  return () => clearInterval(t);
};
const getSnapshot = () => Math.floor(Date.now() / 15_000) * 15_000;
const getServerSnapshot = () => 0;

export default function Clock() {
  const ts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = ts ? new Date(ts) : null;

  return (
    <div className="rounded-2xl p-6 text-white bg-gradient-to-br from-[#2D8CFF] to-[#0B5CFF] min-h-[132px]">
      <div className="text-5xl font-semibold tracking-tight">
        {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "\u00A0"}
      </div>
      <div className="mt-1 text-sm opacity-90">
        {now ? now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ""}
      </div>
    </div>
  );
}
