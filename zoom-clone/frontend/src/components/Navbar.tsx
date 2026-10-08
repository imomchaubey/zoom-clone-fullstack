"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Search, Settings } from "lucide-react";
import { api, User } from "@/lib/api";
import { initials } from "@/lib/format";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { api.me().then(setUser).catch(() => {}); }, []);

  return (
    <header className="h-14 shrink-0 border-b border-[#E4E6EB] bg-white flex items-center px-4 gap-4">
      <Link href="/" className="text-[#0B5CFF] text-[28px] font-extrabold tracking-tight leading-none select-none">
        zoom
      </Link>
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7680]" />
          <input
            placeholder="Search"
            className="w-full h-9 rounded-lg bg-[#F2F4F7] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0B5CFF]/40"
          />
        </div>
      </div>
      <button aria-label="Notifications" className="p-2 rounded-full hover:bg-[#F2F4F7] text-[#4A4F57]"><Bell size={20} /></button>
      <button aria-label="Settings" className="p-2 rounded-full hover:bg-[#F2F4F7] text-[#4A4F57]"><Settings size={20} /></button>
      <div
        title={user?.name}
        className="h-8 w-8 rounded-full text-white text-xs font-semibold flex items-center justify-center"
        style={{ background: user?.avatar_color ?? "#B0B7C3" }}
      >
        {user ? initials(user.name) : ""}
      </div>
    </header>
  );
}
