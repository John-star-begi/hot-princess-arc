"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] flex items-center">
      <div className="px-4 w-full">
        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-pink-200 shadow-sm p-5">
          <div className="text-center mb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-princess-rose to-princess-peach flex items-center justify-center shadow-inner">
              <span className="text-2xl">🌙</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold">Welcome back</h2>
            <p className="text-sm text-gray-600">Your sanctuary is waiting</p>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3">
            {error ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            ) : null}

            <input
              className="h-11 rounded-xl border border-pink-200 bg-white/80 px-3 text-[15px] outline-none focus:ring-2 focus:ring-pink-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              inputMode="email"
              autoComplete="email"
            />
            <input
              className="h-11 rounded-xl border border-pink-200 bg-white/80 px-3 text-[15px] outline-none focus:ring-2 focus:ring-pink-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              autoComplete="current-password"
            />

            {/* Log in button */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-2xl bg-gradient-to-r from-princess-peach to-princess-rose text-gray-800 font-medium shadow-sm active:scale-[.99] transition-transform disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>

            {/* Sign up button */}
            <Link
              href="/signup"
              className="block h-11 rounded-2xl bg-gradient-to-r from-princess-cream to-princess-blush text-gray-800 font-medium text-center leading-[44px] shadow-sm active:scale-[.99] transition-transform"
            >
              Create new account
            </Link>

            {/* Forgot password link */}
            <div className="text-center text-sm mt-1">
              <Link href="/reset-password" className="text-pink-700 underline underline-offset-2">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
