"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      router.replace(`/search?${params.toString()}`);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, router]);

  return (
    <div className="relative flex items-center w-full">
      <Search size={15} className="absolute left-3 text-foam/60 pointer-events-none" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search pubs or cities…"
        className="w-full bg-malt/40 border border-malt rounded-xl pl-9 pr-9 py-2.5 text-sm text-cream placeholder-foam/50 focus:outline-none focus:border-harp/50 transition-colors"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 text-foam/60 hover:text-cream transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
