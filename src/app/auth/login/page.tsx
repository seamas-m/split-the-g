"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

function SplitGMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M 38,20.5833 L 47.5,20.5833
           C 49.0833,23.75 49.0833,28.5 49.0833,30.0833
           C 49.0833,42.75 45.9167,42.75 45.5208,49.0833
           L 45.9167,57
           C 45.9167,58.5833 44.3333,58.5833 44.3333,58.5833
           L 31.6667,58.5833
           C 31.6667,58.5833 30.0833,58.5833 30.0833,57
           L 30.4792,49.0833
           C 30.0833,42.75 26.9167,42.75 26.9167,30.0833
           C 26.9167,28.5 26.9167,23.75 28.5,20.5833
           L 38,20.5833 Z"
        stroke="#c9a454" strokeWidth="2" strokeLinejoin="round"
      />
      <path
        d="M 43.5416,56.2083 L 44.3333,55.4167 L 31.6667,55.4167 L 32.4583,56.2083 L 43.5416,56.2083 Z"
        stroke="#c9a454" strokeWidth="1.5" strokeLinejoin="round"
      />
      <line x1="26" y1="30.5" x2="50" y2="30.5" stroke="#c9a454" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/feed";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await signIn.email({ email, password });
      if (error) throw new Error(error.message);
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-porter border border-malt rounded-xl px-4 py-3.5 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="bg-porter border border-malt rounded-xl px-4 py-3.5 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-harp text-stout font-bold py-3.5 rounded-xl disabled:opacity-50 transition-opacity mt-1 text-sm tracking-wide"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-sm mx-auto w-full">
      <div className="text-center flex flex-col items-center gap-4">
        <SplitGMark />
        <div>
          <h1 className="font-display text-4xl font-bold text-cream tracking-tight">Split the G</h1>
          <p className="text-foam text-sm mt-1">Sign in to share your pints</p>
        </div>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="text-foam text-sm">
        No account?{" "}
        <Link href="/auth/signup" className="text-harp font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
