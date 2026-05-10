"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Camera, X, Trash2, Pin, PinOff } from "lucide-react";
import Image from "next/image";
import { uploadPintPhoto } from "@/lib/cloudinary";

interface PostActionsProps {
  postId: string;
  imageUrl: string;
  pubName: string | null;
  city: string | null;
  isPinned?: boolean;
}

export default function PostActions({ postId, imageUrl, pubName, city, isPinned = false }: PostActionsProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "delete">("edit");
  const [pinned, setPinned] = useState(isPinned);
  const [pinLoading, setPinLoading] = useState(false);

  const [preview, setPreview] = useState<string>(imageUrl);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [editPub, setEditPub] = useState(pubName ?? "");
  const [editCity, setEditCity] = useState(city ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setPreview(imageUrl);
    setNewFile(null);
    setEditPub(pubName ?? "");
    setEditCity(city ?? "");
    setError("");
    setMode("edit");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setNewFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let finalImageUrl = imageUrl;
      if (newFile) {
        finalImageUrl = await uploadPintPhoto(newFile);
      }
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          pubName: editPub || null,
          city: editCity || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.refresh();
      closeModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePin() {
    setPinLoading(true);
    const newPinned = !pinned;
    try {
      const res = await fetch("/api/profile/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: newPinned ? postId : null }),
      });
      if (!res.ok) throw new Error("Failed to pin");
      setPinned(newPinned);
      router.refresh();
    } finally {
      setPinLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      router.refresh();
      closeModal();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="p-1.5 rounded-lg bg-stout/60 backdrop-blur-sm text-cream hover:bg-stout/80 transition-colors"
        aria-label="Edit post"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stout/80 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Sheet — slides up on mobile, centered on desktop */}
          <div className="relative bg-porter border border-malt rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-xl">

            {mode === "edit" && (
              <form onSubmit={handleSave}>
                {/* Photo — tappable to replace */}
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={preview}
                    alt="Post photo"
                    fill
                    className="object-cover rounded-t-2xl sm:rounded-t-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stout/50 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity rounded-t-2xl"
                  >
                    <Camera size={32} className="text-cream" />
                    <span className="text-cream text-sm font-medium">Change photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="absolute top-3 right-3 bg-stout/60 rounded-full p-1.5 text-cream hover:bg-stout transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Fields */}
                <div className="p-5 flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Pub name"
                    value={editPub}
                    onChange={(e) => setEditPub(e.target.value)}
                    className="bg-stout border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="bg-stout border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors text-sm"
                  />
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-harp text-stout font-bold py-3 rounded-xl disabled:opacity-50 text-sm tracking-wide"
                  >
                    {loading ? "Saving…" : "Save changes"}
                  </button>

                  {/* Pin / Unpin */}
                  <button
                    type="button"
                    onClick={handlePin}
                    disabled={pinLoading}
                    className="w-full flex items-center justify-center gap-2 text-sm text-foam hover:text-cream py-2 transition-colors disabled:opacity-50"
                  >
                    {pinned ? <><PinOff size={14} /> Unpin from profile</> : <><Pin size={14} /> Pin to profile</>}
                  </button>

                  {/* Delete — at the bottom, clearly destructive */}
                  <button
                    type="button"
                    onClick={() => setMode("delete")}
                    className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 transition-colors"
                  >
                    <Trash2 size={14} /> Delete post
                  </button>
                </div>
              </form>
            )}

            {mode === "delete" && (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-cream">Delete post?</h2>
                  <button onClick={closeModal} className="text-foam hover:text-cream transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-foam text-sm">This can't be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 text-sm"
                  >
                    {loading ? "Deleting…" : "Delete"}
                  </button>
                  <button
                    onClick={() => setMode("edit")}
                    className="flex-1 border border-malt text-foam py-3 rounded-xl hover:text-cream transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
