"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ChartNoAxesCombined,
} from "lucide-react";
export default function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      <section className="hidden lg:flex flex-col justify-between bg-[#151c31] p-14 text-white relative overflow-hidden">
        <div className="absolute -right-32 -top-20 w-[480px] h-[480px] rounded-full border border-white/10" />
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full border border-white/10" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <ChartNoAxesCombined />
            </div>
            <span className="font-extrabold tracking-wide text-xl">
              ACXIOM<span className="text-indigo-400">CRM</span>
            </span>
          </div>
          <div className="mt-28 max-w-lg">
            <p className="text-indigo-300 text-xs font-bold tracking-[.25em] uppercase">
              Sales intelligence workspace
            </p>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight">
              Build stronger
              <br />
              customer relationships.
            </h1>
            <p className="mt-6 text-slate-400 leading-7">
              One workspace to manage customers, nurture leads and move every
              opportunity forward.
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 AcxiomCRM</span>
          <span>Secure business workspace</span>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-[390px]">
          <div className="lg:hidden flex items-center gap-3 mb-14">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <ChartNoAxesCombined />
            </div>
            <b className="text-xl">
              ACXIOM<span className="text-indigo-600">CRM</span>
            </b>
          </div>
          <p className="text-xs font-bold tracking-[.2em] text-indigo-600 uppercase">
            Welcome back
          </p>
          <h2 className="text-3xl font-extrabold mt-3">
            Sign in to your account
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Enter your details to access your workspace.
          </p>
          {error && (
            <div className="mt-6 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
              {error}
            </div>
          )}
          <label className="block mt-8 text-sm font-semibold">
            Email address
          </label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3 text-slate-400" size={17} />
            <input
              className="field pl-10"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <label className="block mt-5 text-sm font-semibold">Password</label>
          <div className="relative mt-2">
            <LockKeyhole
              className="absolute left-3 top-3 text-slate-400"
              size={17}
            />
            <input
              className="field pl-10"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={busy} className="btn btn-primary w-full mt-7 py-3">
            {busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
          </button>
          <p className="text-center text-sm text-slate-500 mt-7">
            New to AcxiomCRM?{" "}
            <Link href="/register" className="text-indigo-600 font-bold">
              Create account
            </Link>
          </p>
          <div className="mt-8 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
            <b className="text-slate-700">Demo credentials</b>
            <p className="mt-1">
              Run <b>npm run seed</b> to load demo accounts, or register the
              first Admin account.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
