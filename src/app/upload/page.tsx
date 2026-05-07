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
      <h2 className="text-2xl font-bold text-cream">Post your pint</h2>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative aspect-[3/4] w-full rounded-2xl bg-porter border-2 border-dashed border-malt flex items-center justify-center overflow-hidden hover:border-harp transition-colors"
      >
        {preview ? (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-foam">
            <Camera size={40} />
            <span className="text-sm tracking-wide">Tap to add photo</span>
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
          className="bg-porter border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam focus:outline-none focus:border-harp transition-colors"
        />
        <input
          type="text"
          placeholder="City (optional)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-porter border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam focus:outline-none focus:border-harp transition-colors"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !file}
          className="bg-harp text-stout font-bold py-3 rounded-xl disabled:opacity-40 mt-2 tracking-wide transition-opacity"
        >
          {loading ? "Posting…" : "Post pint"}
        </button>
      </form>
    </main>
  );
}
