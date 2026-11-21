import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import { Search, Bell, ChevronDown } from "lucide-react";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1">
        <header className="h-[76px] bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-[.16em] uppercase">
              AcxiomCRM / Workspace
            </p>
            <p className="text-sm font-bold text-slate-700 mt-1">
              Good{" "}
              {new Date().getHours() < 12
                ? "morning"
                : new Date().getHours() < 18
                  ? "afternoon"
                  : "evening"}
              , {user.name.split(" ")[0]}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-slate-400">
              <Search size={15} />
              <span className="text-xs">Your workspace</span>
              <kbd className="ml-8 text-[10px] border rounded px-1">⌘ K</kbd>
            </div>
            <button className="relative text-slate-400 p-2">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
              {user.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-5 md:p-8 max-w-[1600px] mx-auto">{children}</main>
        <footer className="px-8 pb-6 text-[11px] text-slate-400 flex justify-between">
          <span>© 2026 AcxiomCRM. Sales workspace.</span>
          <span>Built for better customer relationships</span>
        </footer>
      </div>
    </div>
  );
}
