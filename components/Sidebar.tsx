"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ContactRound,
  Target,
  CalendarClock,
  ClipboardList,
  ChartNoAxesCombined,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Activity,
  PanelLeftClose,
} from "lucide-react";
import { useState } from "react";
const main = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/dashboard/customers", icon: Building2 },
  { label: "Leads", href: "/dashboard/leads", icon: ContactRound },
  { label: "Opportunities", href: "/dashboard/opportunities", icon: Target },
  { label: "Follow-ups", href: "/dashboard/followups", icon: CalendarClock },
  { label: "Activities", href: "/dashboard/activities", icon: Activity },
];
export default function Sidebar({ user }: { user: any }) {
  const path = usePathname(),
    router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <aside
      className={`${collapsed ? "w-[76px]" : "w-[250px]"} shrink-0 bg-[#151c31] min-h-screen text-white flex flex-col transition-all duration-200`}
    >
      <div className="h-[76px] px-5 flex items-center justify-between border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-500 flex items-center justify-center">
            <ChartNoAxesCombined size={19} />
          </div>
          {!collapsed && (
            <span className="font-extrabold tracking-wide">
              ACXIOM<span className="text-indigo-400">CRM</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-white"
        >
          {!collapsed && <PanelLeftClose size={17} />}
        </button>
      </div>
      <div className="px-3 pt-7">
        <p
          className={`px-3 mb-3 text-[10px] tracking-[.18em] font-bold text-slate-500 ${collapsed ? "text-center" : ""}`}
        >
          {collapsed ? "•••" : "WORKSPACE"}
        </p>
        {main.map((x) => {
          const active =
            x.href === "/dashboard"
              ? path === "/dashboard"
              : path.startsWith(x.href);
          return (
            <Link
              key={x.href}
              href={x.href}
              title={collapsed ? x.label : ""}
              className={`nav-item mb-1 ${active ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <x.icon size={18} />
              {!collapsed && x.label}
            </Link>
          );
        })}
      </div>
      <div className="px-3 pt-8">
        <p
          className={`px-3 mb-3 text-[10px] tracking-[.18em] font-bold text-slate-500 ${collapsed ? "text-center" : ""}`}
        >
          {collapsed ? "•••" : "INSIGHTS & ADMIN"}
        </p>
        {[
          {
            label: "Reports",
            href: "/dashboard/reports",
            icon: ChartNoAxesCombined,
          },
          ...(user.role === "Admin"
            ? [
                {
                  label: "Team & users",
                  href: "/dashboard/users",
                  icon: Users,
                },
                {
                  label: "Audit log",
                  href: "/dashboard/audit",
                  icon: ShieldCheck,
                },
              ]
            : []),
        ].map((x) => (
          <Link
            key={x.href}
            href={x.href}
            title={collapsed ? x.label : ""}
            className={`nav-item mb-1 ${path.startsWith(x.href) ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
          >
            <x.icon size={18} />
            {!collapsed && x.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto p-3">
        <div
          className={`border-t border-white/10 pt-4 ${collapsed ? "text-center" : ""}`}
        >
          <div
            className={`flex items-center gap-3 px-2 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-400/20 text-indigo-200 flex items-center justify-center font-bold text-sm">
              {user.name?.[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className={`nav-item w-full mt-3 hover:bg-rose-500/10 hover:text-rose-300 ${collapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut size={17} />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </div>
    </aside>
  );
}
