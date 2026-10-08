import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = { title: "Zoom Workplace", description: "Zoom clone" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#F7F8FA", color: "#232333", fontFamily: "Lato, 'Helvetica Neue', Arial, sans-serif" }}>
        <div className="h-screen flex flex-col">
          <Navbar />
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
