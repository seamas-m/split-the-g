"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LocateFixed, Loader2, X } from "lucide-react";

async function reverseGeocodeCity(lat: number, lon: number): Promise<string> {
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

interface SearchFiltersProps {
  topCities: string[];
  activeCity: string;
}

export default function SearchFilters({ topCities, activeCity }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  function setCity(city: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (city) {
      params.set("city", city);
    } else {
      params.delete("city");
    }
    router.replace(`/search?${params.toString()}`);
  }

  async function useNearMe() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    setLocating(true);
    setLocationError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const city = await reverseGeocodeCity(lat, lon);
      if (city) {
        setCity(city);
      } else {
        setLocationError("Couldn't detect your city");
      }
    } catch {
      setLocationError("Location access denied");
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Active city filter pill */}
      {activeCity && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-foam/50">Filtering by</span>
          <span className="flex items-center gap-1.5 text-xs bg-harp/20 border border-harp/40 text-harp rounded-full px-3 py-1 font-medium">
            {activeCity}
            <button onClick={() => setCity("")} className="hover:text-cream transition-colors">
              <X size={11} />
            </button>
          </span>
        </div>
      )}

      {/* Near me + city chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={useNearMe}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-malt text-foam hover:border-harp hover:text-harp transition-colors disabled:opacity-50 font-medium"
        >
          {locating
            ? <Loader2 size={12} className="animate-spin" />
            : <LocateFixed size={12} />
          }
          Near me
        </button>

        {topCities.filter((c) => c !== activeCity).map((city) => (
          <button
            key={city}
            onClick={() => setCity(city)}
            className="text-xs px-3 py-1.5 rounded-full border border-malt text-foam hover:border-harp hover:text-harp transition-colors font-medium"
          >
            {city}
          </button>
        ))}
      </div>

      {locationError && (
        <p className="text-foam/50 text-xs">{locationError}</p>
      )}
    </div>
  );
}
