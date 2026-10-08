"use client";
import { useEffect, useState } from "react";
import ActionCards from "@/components/ActionCards";
import Clock from "@/components/Clock";
import MeetingList from "@/components/MeetingList";
import { api, Meeting } from "@/lib/api";

export default function Dashboard() {
  const [upcoming, setUpcoming] = useState<Meeting[] | null>(null);
  const [recent, setRecent] = useState<Meeting[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.upcoming(), api.recent()])
      .then(([u, r]) => { setUpcoming(u); setRecent(r); })
      .catch((e) => { setError(e.message); setUpcoming([]); setRecent([]); });
  }, []);

  return (
    <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6 min-w-0">
        <ActionCards />
        <MeetingList title="Recent meetings" meetings={recent} error={error} variant="recent"
                     emptyText="No recent meetings yet. Start one with New meeting." />
      </div>
      <div className="space-y-6 min-w-0">
        <Clock />
        <MeetingList title="Upcoming meetings" meetings={upcoming} error={error} variant="upcoming"
                     emptyText="No upcoming meetings. Use Schedule to add one." />
      </div>
    </div>
  );
}
