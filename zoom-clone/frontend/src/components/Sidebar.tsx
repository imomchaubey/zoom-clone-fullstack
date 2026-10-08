import { Calendar, Home, Mail, MessageSquare, MoreHorizontal, Phone, Video } from "lucide-react";

const items = [
  { label: "Home", icon: Home, active: true },
  { label: "Team Chat", icon: MessageSquare },
  { label: "Meetings", icon: Video },
  { label: "Phone", icon: Phone },
  { label: "Calendar", icon: Calendar },
  { label: "Mail", icon: Mail },
  { label: "More", icon: MoreHorizontal },
];

export default function Sidebar() {
  return (
    <nav className="hidden md:flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-[#E4E6EB] bg-white py-3">
      {items.map(({ label, icon: Icon, active }) => (
        <button
          key={label}
          className={`w-16 py-2 rounded-lg flex flex-col items-center gap-1 text-[11px] ${
            active ? "bg-[#E8F0FF] text-[#0B5CFF] font-semibold" : "text-[#4A4F57] hover:bg-[#F2F4F7]"
          }`}
        >
          <Icon size={22} />
          {label}
        </button>
      ))}
    </nav>
  );
}
