"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  Target,
  CalendarClock,
  Building2,
  ContactRound,
  ClipboardList,
  ShieldCheck,
  ChartNoAxesCombined,
} from "lucide-react";
const configs: any = {
  customers: {
    title: "Customers",
    sub: "Manage your customer relationships and account details.",
    singular: "Customer",
    icon: Building2,
    fields: [
      ["name", "Customer name", "text", true],
      ["email", "Email address", "email", true],
      ["phone", "Phone number", "tel", true],
      ["company", "Company", "text"],
      ["address", "Address", "text"],
      ["city", "City", "text"],
      ["state", "State", "text"],
      ["status", "Status", "select", ["Active", "Inactive"]],
      ["notes", "Notes", "textarea"],
    ],
    cols: ["name", "company", "email", "phone", "status"],
    search: "Search name, email, phone or company",
  },
  leads: {
    title: "Leads",
    sub: "Capture prospects, qualify interest and convert leads into customers.",
    singular: "Lead",
    icon: ContactRound,
    fields: [
      ["name", "Lead name", "text", true],
      ["email", "Email address", "email"],
      ["phone", "Phone number", "tel"],
      ["company", "Company", "text"],
      [
        "source",
        "Lead source",
        "select",
        [
          "Website",
          "Referral",
          "Social Media",
          "Campaign",
          "Cold Call",
          "Other",
        ],
      ],
      [
        "status",
        "Lead status",
        "select",
        ["New", "Contacted", "Qualified", "Unqualified", "Converted", "Lost"],
      ],
      ["priority", "Priority", "select", ["Low", "Medium", "High"]],
      ["expectedValue", "Expected value (₹)", "number"],
      ["notes", "Notes", "textarea"],
    ],
    cols: ["name", "company", "source", "status", "priority", "expectedValue"],
    search: "Search lead, company or status",
  },
  opportunities: {
    title: "Opportunities",
    sub: "Track deals from qualification through close.",
    singular: "Opportunity",
    icon: Target,
    fields: [
      ["name", "Opportunity name", "text", true],
      ["customer", "Customer ID (optional)", "text"],
      ["amount", "Amount (₹)", "number", true],
      [
        "stage",
        "Pipeline stage",
        "select",
        ["Qualification", "Proposal", "Negotiation", "Won", "Lost"],
      ],
      ["probability", "Probability (%)", "number", true],
      ["expectedCloseDate", "Expected close date", "date", true],
      ["status", "Status", "select", ["Open", "Won", "Lost"]],
      ["source", "Source", "text"],
      ["notes", "Notes", "textarea"],
    ],
    cols: [
      "name",
      "stage",
      "amount",
      "probability",
      "expectedCloseDate",
      "status",
    ],
    search: "Search opportunity or stage",
  },
  followups: {
    title: "Follow-ups",
    sub: "Stay on top of every customer conversation and next step.",
    singular: "Follow-up",
    icon: CalendarClock,
    fields: [
      ["subject", "Subject", "text", true],
      ["date", "Follow-up date", "date", true],
      ["type", "Type", "select", ["Call", "Meeting", "Email", "Task"]],
      [
        "status",
        "Status",
        "select",
        ["Planned", "Completed", "Missed", "Cancelled"],
      ],
      ["customer", "Customer ID (optional)", "text"],
      ["lead", "Lead ID (optional)", "text"],
      ["opportunity", "Opportunity ID (optional)", "text"],
      ["notes", "Notes", "textarea"],
    ],
    cols: ["subject", "date", "type", "status"],
    search: "Search subject or type",
  },
  activities: {
    title: "Activities",
    sub: "Keep a clear record of calls, meetings, emails and tasks.",
    singular: "Activity",
    icon: ClipboardList,
    fields: [
      ["subject", "Subject", "text", true],
      ["type", "Activity type", "select", ["Call", "Meeting", "Email", "Task"]],
      ["description", "Description", "textarea"],
      ["date", "Activity date", "date", true],
      ["status", "Status", "select", ["Open", "Completed"]],
      ["customer", "Customer ID (optional)", "text"],
      ["lead", "Lead ID (optional)", "text"],
    ],
    cols: ["subject", "type", "date", "status"],
    search: "Search activity subject",
  },
  users: {
    title: "Team & users",
    sub: "Manage team access, roles and account status.",
    singular: "User",
    icon: Users,
    fields: [
      ["name", "Full name", "text", true],
      ["email", "Email address", "email", true],
      ["password", "Temporary password", "password", true],
      ["role", "Role", "select", ["Admin", "Manager", "SalesExecutive"]],
      ["team", "Team", "text"],
      ["isActive", "Account status", "select", [true, false]],
    ],
    cols: ["name", "email", "role", "team", "isActive"],
    search: "Search name or email",
  },
  audit: {
    title: "Audit log",
    sub: "Review security events and important business operations.",
    singular: "Audit event",
    icon: ShieldCheck,
    fields: [],
    cols: [
      "userName",
      "action",
      "entityName",
      "recordId",
      "result",
      "createdAt",
    ],
    search: "Search user, action or module",
  },
  reports: {
    title: "Reports & insights",
    sub: "Explore sales performance and operational activity.",
    singular: "Report",
    icon: ChartNoAxesCombined,
    fields: [],
    cols: [],
    search: "",
  },
};
const labels: any = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  source: "Source",
  status: "Status",
  priority: "Priority",
  expectedValue: "Expected value",
  amount: "Amount",
  stage: "Stage",
  probability: "Probability",
  expectedCloseDate: "Close date",
  date: "Date",
  type: "Type",
  subject: "Subject",
  role: "Role",
  team: "Team",
  isActive: "Active",
  userName: "User",
  action: "Action",
  entityName: "Module",
  recordId: "Record ID",
  result: "Result",
  createdAt: "Date",
};
const fmt = (v: any, k: string) => {
  if (v == null || v === "") return "—";
  if (k === "amount" || k === "expectedValue")
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(v));
  if (k === "isActive") return v ? "Active" : "Inactive";
  if (k.toLowerCase().includes("date") || k === "createdAt")
    return new Date(v).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (typeof v === "object") return v.name || v._id || "—";
  return String(v);
};
export default function ModulePage() {
  const params = useParams();
  const module = String(params.module || "");
  const cfg = configs[module];
  const [items, setItems] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [modal, setModal] = useState(false),
    [editing, setEditing] = useState<any>(null),
    [form, setForm] = useState<any>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [notice, setNotice] = useState("");
  const [user, setUser] = useState<any>(null),
    [history, setHistory] = useState<any>(null),
    [historyLoading, setHistoryLoading] = useState(false);
  const load = useCallback(async () => {
    if (!cfg || module === "reports") return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/${module}?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&page=${page}`,
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setItems(d.items || []);
      setTotal(d.total || 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [module, q, status, page]);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);
  function open(item?: any) {
    setEditing(item || null);
    const initial: any = {};
    cfg.fields.forEach((f: any) => {
      initial[f[0]] =
        item && item[f[0]] !== undefined
          ? item[f[0]]?._id || item[f[0]]
          : f[0] === "status"
            ? module === "customers"
              ? "Active"
              : module === "leads"
                ? "New"
                : module === "opportunities"
                  ? "Open"
                  : module === "followups"
                    ? "Planned"
                    : "Open"
            : f[0] === "role"
              ? "SalesExecutive"
              : f[0] === "isActive"
                ? true
                : "";
    });
    if (item?.date)
      initial.date = new Date(item.date).toISOString().slice(0, 10);
    if (item?.expectedCloseDate)
      initial.expectedCloseDate = new Date(item.expectedCloseDate)
        .toISOString()
        .slice(0, 10);
    setForm(initial);
    setError("");
    setModal(true);
  }
  async function save(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = { ...form };
    if (module === "opportunities")
      ((payload.amount = Number(payload.amount)),
        (payload.probability = Number(payload.probability)));
    if (module === "leads")
      payload.expectedValue = Number(payload.expectedValue || 0);
    if (module === "users" && editing) delete payload.password;
    try {
      const r = await fetch(
        editing ? `/api/${module}/${editing._id}` : `/api/${module}`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setModal(false);
      setNotice(
        `${cfg.singular} ${editing ? "updated" : "created"} successfully.`,
      );
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function openHistory(item: any) {
    setHistoryLoading(true);
    try {
      const r = await fetch(`/api/customers/${item._id}/history`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setHistory(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setHistoryLoading(false);
    }
  }
  async function convert(item: any) {
    if (!confirm(`Convert ${item.name} into a customer?`)) return;
    const r = await fetch(`/api/leads/${item._id}/convert`, { method: "POST" });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setNotice("Lead converted to customer successfully.");
    load();
  }
  async function remove(item: any) {
    if (!confirm(`Delete/deactivate this ${cfg.singular.toLowerCase()}?`))
      return;
    const r = await fetch(`/api/${module}/${item._id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setNotice("Record deleted or deactivated.");
    load();
  }
  if (!cfg)
    return (
      <div className="panel p-10">
        <h1 className="text-xl font-bold">Page not found</h1>
      </div>
    );
  if (module === "reports") return <Reports />;
  const Icon = cfg.icon;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-indigo-600 font-bold">{cfg.title}</span>
          </div>
          <h1 className="text-2xl font-extrabold">{cfg.title}</h1>
          <p className="text-sm text-slate-500 mt-2">{cfg.sub}</p>
        </div>
        {module !== "audit" && (
          <button onClick={() => open()} className="btn btn-primary">
            <Plus size={16} /> Add {cfg.singular}
          </button>
        )}
      </div>
      {notice && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex justify-between">
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {error && !modal && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
          {error}
        </div>
      )}
      <div className="panel overflow-hidden">
        <div className="p-4 flex flex-wrap gap-3 justify-between border-b border-slate-100">
          <div className="relative w-full sm:max-w-[340px]">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className="field pl-9"
              placeholder={cfg.search}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="field !w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {[
                "Active",
                "Inactive",
                "New",
                "Contacted",
                "Qualified",
                "Unqualified",
                "Converted",
                "Lost",
                "Open",
                "Won",
                "Planned",
                "Completed",
                "Missed",
                "Cancelled",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <button
              onClick={load}
              className="btn btn-ghost border border-slate-200"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80">
                {cfg.cols.map((k: string) => (
                  <th key={k} className="table-head px-5 py-4">
                    {labels[k] || k}
                  </th>
                ))}
                <th className="table-head px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={cfg.cols.length + 1}
                    className="text-center py-16 text-sm text-slate-400"
                  >
                    Loading records…
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-slate-50 hover:bg-slate-50/60"
                  >
                    {cfg.cols.map((k: string) => (
                      <td
                        key={k}
                        className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap"
                      >
                        {k === "status" ||
                        k === "stage" ||
                        k === "priority" ||
                        k === "result" ||
                        k === "isActive" ? (
                          <span
                            className={`badge ${["Won", "Active", "Completed", "Qualified", "Success", true].includes(item[k]) ? "bg-emerald-50 text-emerald-700" : ["Lost", "Inactive", "Missed", "Failed", false].includes(item[k]) ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                          >
                            {fmt(item[k], k)}
                          </span>
                        ) : (
                          fmt(item[k], k)
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {module === "customers" && (
                          <button
                            title="Customer history"
                            onClick={() => openHistory(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {module === "leads" && item.status === "Qualified" && (
                          <button
                            title="Convert to customer"
                            onClick={() => convert(item)}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 text-xs font-bold"
                          >
                            Convert
                          </button>
                        )}
                        {module !== "audit" && (
                          <>
                            <button
                              title="Edit"
                              onClick={() => open(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => remove(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={cfg.cols.length + 1}
                    className="py-16 text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Icon size={21} />
                    </div>
                    <p className="font-bold text-sm mt-4">
                      No {cfg.title.toLowerCase()} found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {q
                        ? "Try a different search."
                        : "Create your first record to get started."}
                    </p>
                    {module !== "audit" && !q && (
                      <button
                        onClick={() => open()}
                        className="btn btn-primary mt-4"
                      >
                        <Plus size={14} /> Add {cfg.singular}
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <span>
            Showing {items.length ? (page - 1) * 50 + 1 : 0}–
            {(page - 1) * 50 + items.length} of {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={page * 50 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-lg">
                  {editing ? "Edit" : "Create"} {cfg.singular}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the details below. Required fields are marked.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              {cfg.fields.map((f: any) => {
                const [key, label, type, requiredRaw, optionsRaw] = f;
                const required =
                  typeof requiredRaw === "boolean" ? requiredRaw : false;
                const options = Array.isArray(requiredRaw)
                  ? requiredRaw
                  : optionsRaw;
                return (
                  <label
                    key={key}
                    className={`text-xs font-bold text-slate-600 ${type === "textarea" ? "sm:col-span-2" : ""}`}
                  >
                    {label}
                    {required && <span className="text-rose-500"> *</span>}
                    {type === "select" ? (
                      <select
                        className="field mt-2"
                        required={
                          !!required && !(editing && key === "password")
                        }
                        value={form[key] ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      >
                        <option value="">Select…</option>
                        {options.map((o: any) => (
                          <option key={String(o)} value={o}>
                            {typeof o === "boolean"
                              ? o
                                ? "Active"
                                : "Inactive"
                              : o}
                          </option>
                        ))}
                      </select>
                    ) : type === "textarea" ? (
                      <textarea
                        className="field mt-2 min-h-24"
                        value={form[key] ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      />
                    ) : (
                      <input
                        className="field mt-2"
                        type={type}
                        required={
                          !!required && !(editing && key === "password")
                        }
                        min={
                          type === "number"
                            ? key === "probability"
                              ? 0
                              : 0
                            : undefined
                        }
                        max={key === "probability" ? 100 : undefined}
                        value={form[key] ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      />
                    )}
                  </label>
                );
              })}
            </div>
            {error && (
              <p className="mx-6 mb-3 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">
                {error}
              </p>
            )}
            <div className="p-6 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button disabled={busy} className="btn btn-primary">
                {busy
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : `Create ${cfg.singular}`}
              </button>
            </div>
          </form>
        </div>
      )}
      {history && (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 flex items-center justify-center p-4">
          <section className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                  Customer timeline
                </p>
                <h2 className="text-xl font-extrabold mt-1">
                  {history.customer?.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {history.customer?.company || history.customer?.email}
                </p>
              </div>
              <button
                onClick={() => setHistory(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
              {Object.entries(history.history || {}).map(([key, rows]: any) => (
                <div key={key}>
                  <h3 className="font-bold text-sm capitalize mb-3">{key}</h3>
                  {rows.length ? (
                    rows.map((row: any) => (
                      <div
                        key={row._id}
                        className="border-b border-slate-100 py-2 text-xs"
                      >
                        <p className="font-semibold">
                          {row.subject || row.name}
                        </p>
                        <p className="text-slate-400 mt-1">
                          {row.status || row.stage || row.type} ·{" "}
                          {row.date || row.createdAt
                            ? new Date(
                                row.date || row.createdAt,
                              ).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No records</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function Reports() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setData);
  }, []);
  const cards = [
    ["Customers", data?.customers || 0],
    ["Leads", data?.leads || 0],
    ["Opportunities", data?.opportunities || 0],
    ["Won deals", data?.won || 0],
  ];
  return (
    <div>
      <div className="mb-7">
        <p className="text-xs font-bold tracking-[.18em] uppercase text-indigo-600">
          Insights
        </p>
        <h1 className="text-2xl font-extrabold mt-2">Reports & insights</h1>
        <p className="text-sm text-slate-500 mt-2">
          A consolidated view of your sales performance.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(([l, v]: any) => (
          <div className="panel p-5" key={l}>
            <p className="text-xs text-slate-500">{l}</p>
            <p className="text-3xl font-extrabold mt-3">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        {[
          ["Pipeline by stage", data?.pipeline],
          ["Lead conversion", data?.conversion],
        ].map(([title, rows]: any) => (
          <section className="panel p-5" key={title}>
            <h2 className="font-extrabold">{title}</h2>
            <div className="mt-4 space-y-3">
              {(rows || []).map((x: any) => (
                <div
                  className="flex justify-between text-sm border-b border-slate-50 pb-2"
                  key={x._id}
                >
                  <span className="text-slate-500">{x._id}</span>
                  <b>
                    {x.amount != null
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(x.amount)
                      : x.count}
                  </b>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-5">
        Report totals respect your role's record visibility.
      </p>
    </div>
  );
}
