"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadPintPhoto } from "@/lib/cloudinary";
import { useSession } from "@/lib/auth-client";
import { Camera } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pubName, setPubName] = useState("");
  const [city, setCity] = useState("");
  const [settleSeconds, setSettleSeconds] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Please select a photo.");
    if (!session) return router.push("/auth/login");
    setError("");
    setLoading(true);
    try {
      const imageUrl = await uploadPintPhoto(file);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          pubName: pubName || null,
          city: city || null,
          settleSeconds: settleSeconds ? parseInt(settleSeconds) : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save post");
      router.push("/feed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col p-6 pb-24 gap-6 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-black text-amber-400">Post your pint</h1>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative aspect-[3/4] w-full rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden"
      >
        {preview ? (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <Camera size={40} />
            <span className="text-sm">Tap to add photo</span>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Pub name (optional)"
          value={pubName}
          onChange={(e) => setPubName(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
        <input
          type="text"
          placeholder="City (optional)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
        <input
          type="number"
          placeholder="Settle time in seconds (optional)"
          value={settleSeconds}
          onChange={(e) => setSettleSeconds(e.target.value)}
          min={0}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-full"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !file}
          className="bg-amber-400 text-black font-bold py-3 rounded-xl disabled:opacity-40 mt-2"
        >
          {loading ? "Posting…" : "Post pint 🍺"}
        </button>
      </form>
    </main>
  );
}
