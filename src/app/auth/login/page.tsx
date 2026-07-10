"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import AuthHowItWorks from "@/components/auth-how-it-works";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
        className="bg-harp text-cream font-bold py-3.5 rounded-xl disabled:opacity-50 transition-opacity mt-1 text-sm tracking-wide"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-center min-h-full">

      {/* Left — how it works */}
      <div className="lg:flex-1 lg:max-w-md px-8 pt-12 pb-8 lg:py-16 lg:pl-16 lg:pr-12">
        <AuthHowItWorks />
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-malt self-stretch mx-4" />
      <div className="lg:hidden h-px bg-malt mx-8" />

      {/* Right — form */}
      <div className="lg:flex-1 lg:max-w-md flex flex-col gap-7 px-8 py-10 lg:py-16 lg:pl-12 lg:pr-16">
        <div>
          <h2 className="text-xl font-bold text-cream">Welcome back</h2>
          <p className="text-foam text-sm mt-1">Sign in to share your pints.</p>
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
      </div>
    </main>
  );
}
