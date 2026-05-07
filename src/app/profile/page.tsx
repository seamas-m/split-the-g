"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/auth/login");
  }

  async function handleUsernameUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setUsernameLoading(true);
    setUsernameError("");
    setUsernameSuccess(false);
    try {
      const { error } = await (authClient.updateUser as Function)({ username: username.trim(), name: username.trim() });
      if (error) throw new Error(error.message);
      setUsernameSuccess(true);
      setUsername("");
    } catch (err: unknown) {
      setUsernameError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUsernameLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      const { error } = await (authClient.changePassword as Function)({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (isPending) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-foam text-sm">Loading…</div>
      </main>
    );
  }

  const displayName = session?.user?.name ?? session?.user?.email ?? "—";

  return (
    <main className="flex-1 p-6 pb-24 max-w-lg mx-auto w-full flex flex-col gap-8">
      {/* Account info */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-cream">Profile</h2>
        <p className="text-foam text-sm">{session?.user?.email}</p>
      </div>

      {/* Update username */}
      <section className="bg-porter border border-malt rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-cream font-semibold">Username</h3>
          <p className="text-foam text-xs mt-0.5">Current: @{displayName}</p>
        </div>
        <form onSubmit={handleUsernameUpdate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="New username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-stout border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
          />
          {usernameError && <p className="text-red-400 text-xs">{usernameError}</p>}
          {usernameSuccess && <p className="text-green-400 text-xs">Username updated.</p>}
          <button
            type="submit"
            disabled={usernameLoading}
            className="bg-harp text-stout font-bold py-3 rounded-xl disabled:opacity-40 transition-opacity text-sm tracking-wide"
          >
            {usernameLoading ? "Saving…" : "Update username"}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section className="bg-porter border border-malt rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-cream font-semibold">Change password</h3>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="bg-stout border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="bg-stout border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
          />
          {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-400 text-xs">Password changed.</p>}
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-harp text-stout font-bold py-3 rounded-xl disabled:opacity-40 transition-opacity text-sm tracking-wide"
          >
            {passwordLoading ? "Saving…" : "Change password"}
          </button>
        </form>
      </section>

      {/* Sign out */}
      <section className="bg-porter border border-malt rounded-2xl p-5">
        <button
          onClick={handleSignOut}
          className="w-full text-center text-sm font-semibold text-foam hover:text-cream transition-colors py-1"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
