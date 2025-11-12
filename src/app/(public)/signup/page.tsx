"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirects here after the user verifies their email
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Do not log in automatically — show clear instruction
    setMessage("Check your email to confirm your account before logging in.");
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] flex items-center justify-center">
      <div className="px-4 w-full max-w-sm">
        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-pink-200 shadow-sm p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-princess-rose to-princess-peach flex items-center justify-center shadow-inner mb-3">
            <span className="text-2xl">💌</span>
          </div>

          <h1 className="text-xl font-semibold mb-2">Create your account</h1>
          <p className="text-sm text-gray-600 mb-4">Join your Hot Princess Arc sanctuary</p>

          <form onSubmit={onSubmit} className="grid gap-3 text-left">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                {message}
              </div>
            )}

            <input
              className="h-11 rounded-xl border border-pink-200 bg-white/80 px-3 text-[15px] outline-none focus:ring-2 focus:ring-pink-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              inputMode="email"
              autoComplete="email"
              required
            />

            <input
              className="h-11 rounded-xl border border-pink-200 bg-white/80 px-3 text-[15px] outline-none focus:ring-2 focus:ring-pink-200"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-2xl bg-gradient-to-r from-princess-peach to-princess-rose text-gray-800 font-medium shadow-sm active:scale-[.99] transition-transform disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-sm mt-1 text-gray-700">
              Already have an account?{" "}
              <a href="/login" className="text-pink-700 underline underline-offset-2">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
