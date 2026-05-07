"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

function SplitGMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M25 8.2C22.5 5.8 19.4 4.5 16 4.5C9.1 4.5 3.5 10.1 3.5 16C3.5 21.9 9.1 27.5 16 27.5C22.3 27.5 27.5 22.8 27.5 17V15H16V18.5H23.5C22.2 21.6 19.3 23.5 16 23.5C11.2 23.5 7.5 20.1 7.5 16C7.5 11.9 11.2 8.5 16 8.5C18.3 8.5 20.4 9.4 22 10.9L25 8.2Z"
        fill="#c9a454"
      />
      <line x1="3" y1="16" x2="27" y2="16" stroke="#0e0c0b" strokeWidth="2" strokeLinecap="round" />
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
