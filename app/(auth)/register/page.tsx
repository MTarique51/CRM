"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChartNoAxesCombined, ArrowRight } from "lucide-react";
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-5">
      <form onSubmit={submit} className="panel w-full max-w-md p-9">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <ChartNoAxesCombined />
          </div>
          <b className="text-xl">
            ACXIOM<span className="text-indigo-600">CRM</span>
          </b>
        </div>
        <h1 className="text-2xl font-extrabold mt-8">
          Create your workspace account
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          The first registered account becomes the Admin.
        </p>
        {error && (
          <p className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {error}
          </p>
        )}
        {[
          ["name", "Full name", "text"],
          ["email", "Work email", "email"],
          ["password", "Password (minimum 8 characters)", "password"],
        ].map(([key, label, type]: any) => (
          <label key={key} className="block mt-5 text-sm font-semibold">
            {label}
            <input
              className="field mt-2"
              type={type}
              required
              minLength={key === "password" ? 8 : undefined}
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <button disabled={busy} className="btn btn-primary w-full mt-7">
          {busy ? "Creating…" : "Create account"} <ArrowRight size={16} />
        </button>
        <p className="text-sm text-center text-slate-500 mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-indigo-600 font-bold">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
