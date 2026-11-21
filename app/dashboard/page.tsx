"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Users,
  ContactRound,
  Target,
  CalendarClock,
  ClipboardList,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Link from "next/link";
const colors = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"];
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
export default function Dashboard() {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Could not load dashboard"));
  }, []);
  const s = data?.stats || {};
  const cards = [
    [
      "Total customers",
      s.customers,
      Users,
      "#eef2ff",
      "#4f46e5",
      "/dashboard/customers",
    ],
    [
      "Total leads",
      s.leads,
      ContactRound,
      "#ecfeff",
      "#0891b2",
      "/dashboard/leads",
    ],
    [
      "Open opportunities",
      s.openOpps,
      Target,
      "#fff7ed",
      "#ea580c",
      "/dashboard/opportunities",
    ],
    [
      "Pending follow-ups",
      s.pending,
      CalendarClock,
      "#fdf2f8",
      "#db2777",
      "/dashboard/followups",
    ],
  ];
  const leads = (data?.leadStats || []).map((x: any) => ({
    name: x._id,
    value: x.count,
  }));
  const opps = (data?.oppStats || []).map((x: any) => ({
    name: x._id,
    value: x.amount,
    count: x.count,
  }));
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs font-bold tracking-[.18em] uppercase text-indigo-600">
            Overview
          </p>
          <h1 className="text-2xl md:text-[28px] font-extrabold mt-2">
            Your sales at a glance
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Here’s what’s happening across your workspace today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/leads"
            className="btn btn-ghost border border-slate-200 bg-white"
          >
            <Plus size={15} /> Add lead
          </Link>
          <Link href="/dashboard/customers" className="btn btn-primary">
            <Plus size={15} /> Add customer
          </Link>
        </div>
      </div>
      {error && <p className="text-rose-600">{error}</p>}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(([label, value, Icon, bg, color, href]: any, i) => (
          <Link
            href={href}
            key={label}
            className="panel p-5 hover:-translate-y-0.5 transition"
          >
            <div className="flex justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg, color }}
              >
                <Icon size={19} />
              </div>
              <ArrowUpRight size={17} className="text-slate-300" />
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-5">{label}</p>
            <p className="text-[27px] font-extrabold mt-1">{value ?? "—"}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Visible within your access scope
            </p>
          </Link>
        ))}
      </div>
      <div className="grid xl:grid-cols-[1.55fr_1fr] gap-4 mt-5">
        <section className="panel p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base">Sales pipeline</h2>
              <p className="text-xs text-slate-400 mt-1">
                Current value of open opportunities
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
              Live summary
            </span>
          </div>
          <div className="flex items-end gap-3 mt-6">
            <p className="text-3xl font-extrabold">{money(s.pipeline)}</p>
            <p className="text-xs text-slate-400 mb-1">Total pipeline value</p>
          </div>
          <div className="h-[235px] mt-4">
            {opps.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={opps} barSize={34}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f5"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip formatter={(v: any) => money(v)} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                Create opportunities to see your pipeline.
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 pt-4 mt-2">
            <div>
              <p className="text-[10px] text-slate-400">Weighted pipeline</p>
              <p className="font-bold mt-1">{money(s.weighted)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Won opportunities</p>
              <p className="font-bold mt-1">{s.won ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Lost opportunities</p>
              <p className="font-bold mt-1">{s.lost ?? 0}</p>
            </div>
          </div>
        </section>
        <section className="panel p-5 md:p-6">
          <h2 className="font-extrabold text-base">Lead status</h2>
          <p className="text-xs text-slate-400 mt-1">
            Lead distribution by current stage
          </p>
          <div className="h-[210px] mt-3">
            {leads.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leads}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {leads.map((x: any, i: number) => (
                      <Cell key={x.name} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No lead data yet.
              </div>
            )}
          </div>
          <div className="space-y-3">
            {leads.map((x: any, i: number) => (
              <div
                key={x.name}
                className="flex justify-between items-center text-xs"
              >
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: colors[i % colors.length] }}
                  />
                  {x.name}
                </span>
                <b>{x.value}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="grid xl:grid-cols-[1.4fr_1fr] gap-4 mt-5">
        <section className="panel p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-extrabold">Recent activity</h2>
              <p className="text-xs text-slate-400 mt-1">
                Latest updates in your workspace
              </p>
            </div>
            <Link
              href="/dashboard/activities"
              className="text-xs text-indigo-600 font-bold"
            >
              View all <ArrowRight className="inline" size={13} />
            </Link>
          </div>
          <div className="mt-5">
            {(data?.activities || []).length ? (
              data.activities.map((a: any) => (
                <div
                  key={a._id}
                  className="flex gap-3 py-3 border-t border-slate-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ActivityIcon type={a.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {a.subject}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {a.type} · {a.assignedTo?.name || "Team member"}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {a.date ? new Date(a.date).toLocaleDateString() : ""}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-slate-400">
                No activity recorded yet.
              </div>
            )}
          </div>
        </section>
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold">Monthly sales</h2>
              <p className="text-xs text-slate-400 mt-1">
                Won opportunity value by month
              </p>
            </div>
            <TrendingUp className="text-emerald-500" size={18} />
          </div>
          <div className="h-[190px] mt-4">
            {(data?.monthlySales || []).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlySales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f5"
                  />
                  <XAxis
                    dataKey="_id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip formatter={(v: any) => money(v)} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                Won deals will appear here.
              </div>
            )}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="font-extrabold">Quick actions</h2>
          <p className="text-xs text-slate-400 mt-1">
            Move work forward in a few clicks
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              {
                label: "New customer",
                href: "/dashboard/customers",
                icon: Users,
              },
              {
                label: "Create lead",
                href: "/dashboard/leads",
                icon: ContactRound,
              },
              {
                label: "New opportunity",
                href: "/dashboard/opportunities",
                icon: Target,
              },
              {
                label: "Schedule follow-up",
                href: "/dashboard/followups",
                icon: CalendarClock,
              },
            ].map((x) => (
              <Link
                key={x.label}
                href={x.href}
                className="rounded-xl border border-slate-100 p-4 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
              >
                <x.icon className="text-indigo-600" size={19} />
                <p className="text-xs font-bold mt-3">{x.label}</p>
                <ArrowUpRight size={14} className="text-slate-300 mt-2" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
function ActivityIcon({ type }: any) {
  return type === "Meeting" ? (
    <CalendarClock size={17} />
  ) : type === "Call" ? (
    <Clock3 size={17} />
  ) : type === "Email" ? (
    <ContactRound size={17} />
  ) : (
    <ClipboardList size={17} />
  );
}
