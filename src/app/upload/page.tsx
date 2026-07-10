"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadPintPhoto } from "@/lib/cloudinary";
import { useSession } from "@/lib/auth-client";
import { Camera, LocateFixed, Loader2, X } from "lucide-react";

// Reverse geocode coords → city name via Nominatim (OSM, free, no API key)
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  return (
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    data.address?.suburb ||
    ""
  );
}

// Nearby pubs via Overpass API (OSM, free, no API key)
async function fetchNearbyPubs(lat: number, lon: number): Promise<string[]> {
  const query = `[out:json];node(around:600,${lat},${lon})[amenity=pub];out body;`;
  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return (data.elements as Array<{ tags?: { name?: string } }>)
    .filter((e) => e.tags?.name)
    .map((e) => e.tags!.name!)
    .slice(0, 8);
}

// Pub name search via Nominatim
async function searchPubs(query: string, city: string): Promise<string[]> {
  if (query.length < 2) return [];
  const q = city ? `${query} pub ${city}` : `${query} pub`;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  return [...new Set(
    (data as Array<{ name: string }>)
      .filter((r) => r.name)
      .map((r) => r.name)
  )].slice(0, 5);
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pubName, setPubName] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Location
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [nearbyPubs, setNearbyPubs] = useState<string[]>([]);

  // Pub name autocomplete
  const [pubSuggestions, setPubSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Redirect to login if unauthenticated — prevents wasted Cloudinary uploads
  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace("/auth/login?redirect=/upload");
    }
  }, [sessionPending, session, router]);

  // Auto-open camera on mount — only once session is confirmed
  useEffect(() => {
    if (sessionPending || !session) return;
    const t = setTimeout(() => fileRef.current?.click(), 100);
    return () => clearTimeout(t);
  }, [sessionPending, session]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function useLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported on this device");
      return;
    }
    setLocating(true);
    setLocationError("");
    setNearbyPubs([]);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10_000,
          enableHighAccuracy: true,
        })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const [cityName, pubs] = await Promise.all([
        reverseGeocode(lat, lon),
        fetchNearbyPubs(lat, lon),
      ]);
      if (cityName) setCity(cityName);
      setNearbyPubs(pubs);
      if (!cityName && pubs.length === 0) {
        setLocationError("Couldn't find location details — try typing manually");
      }
    } catch {
      setLocationError("Location access denied — enable it in your browser settings");
    } finally {
      setLocating(false);
    }
  }

  const handlePubInput = useCallback(
    (value: string) => {
      setPubName(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (value.length < 2) {
        setPubSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      searchTimerRef.current = setTimeout(async () => {
        const results = await searchPubs(value, city);
        setPubSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 400);
    },
    [city]
  );

  function pickPub(name: string) {
    setPubName(name);
    setShowSuggestions(false);
    setPubSuggestions([]);
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

  // Show a loading state while session is pending or during redirect
  if (sessionPending || !session) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-foam" size={24} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-6 pb-24 gap-6 max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-bold text-cream">Post your pint</h2>

      {/* Photo picker */}
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

        {/* Pub name field + autocomplete */}
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Pub name (optional)"
              value={pubName}
              onChange={(e) => handlePubInput(e.target.value)}
              onFocus={() => pubSuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full bg-porter border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors"
            />
            {pubName && (
              <button
                type="button"
                onClick={() => { setPubName(""); setPubSuggestions([]); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foam/50 hover:text-foam transition-colors"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown suggestions */}
            {showSuggestions && pubSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-porter border border-malt rounded-xl overflow-hidden shadow-xl">
                {pubSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={() => pickPub(name)}
                    className="w-full text-left px-4 py-3 text-sm text-cream hover:bg-malt/30 transition-colors border-b border-malt/40 last:border-0"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nearby pub chips — shown after GPS, hidden once pub name is set */}
          {nearbyPubs.length > 0 && !pubName && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-foam/50 uppercase tracking-wide font-medium px-1">Nearby</p>
              <div className="flex flex-wrap gap-2">
                {nearbyPubs.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => pickPub(name)}
                    className="text-xs px-3 py-1.5 rounded-full bg-porter border border-malt text-foam hover:border-harp hover:text-harp transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* City field + GPS button */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="City (optional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 bg-porter border border-malt rounded-xl px-4 py-3 text-cream placeholder-foam/60 focus:outline-none focus:border-harp transition-colors"
            />
            <button
              type="button"
              onClick={useLocation}
              disabled={locating}
              title="Detect my location"
              className="flex items-center justify-center w-12 rounded-xl bg-porter border border-malt text-foam hover:border-harp hover:text-harp transition-colors disabled:opacity-50 shrink-0"
            >
              {locating
                ? <Loader2 size={18} className="animate-spin" />
                : <LocateFixed size={18} />
              }
            </button>
          </div>
          {locationError && (
            <p className="text-foam/50 text-xs px-1">{locationError}</p>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !file}
          className="bg-harp text-cream font-bold py-3 rounded-xl disabled:opacity-40 mt-2 tracking-wide transition-opacity"
        >
          {loading ? "Posting…" : "Post pint"}
        </button>
      </form>
    </main>
  );
}
