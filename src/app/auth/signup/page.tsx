"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import AuthHowItWorks from "@/components/auth-how-it-works";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (signUp.email as any)({
        email,
        password,
        name: username,
        username,
      });
      if (result?.error) throw new Error(result.error.message ?? "Sign up failed");
      router.push("/feed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setLoading(false);
    }
  }

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
          <h2 className="text-xl font-bold text-cream">Create your account</h2>
          <p className="text-foam text-sm mt-1">Join the challenge. Document your splits.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-porter border border-malt rounded-xl px-4 py-3.5 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
          />
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
            placeholder="Password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="bg-porter border border-malt rounded-xl px-4 py-3.5 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-harp text-stout font-bold py-3.5 rounded-xl disabled:opacity-50 transition-opacity mt-1 text-sm tracking-wide"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-foam text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-harp font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
