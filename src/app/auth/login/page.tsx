"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
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
      router.push("/feed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-10">
      <div className="text-center">
        <h1 className="text-5xl font-display font-bold text-harp">Split the G</h1>
        <p className="text-foam mt-2 text-sm tracking-wide">Sign in to share your pints</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-porter border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam focus:outline-none focus:border-harp transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-porter border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam focus:outline-none focus:border-harp transition-colors"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-harp text-stout font-bold py-3 rounded-xl disabled:opacity-50 transition-opacity mt-1 tracking-wide"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-foam text-sm">
        No account?{" "}
        <Link href="/auth/signup" className="text-harp font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
