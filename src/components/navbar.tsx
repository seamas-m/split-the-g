"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/upload", label: "Post", icon: PlusCircle },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-porter/95 backdrop-blur border-t border-malt flex justify-around items-center h-16 z-50">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center gap-0.5 text-xs font-medium transition-colors",
            pathname === href ? "text-harp" : "text-foam hover:text-cream"
          )}
        >
          <Icon size={22} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
