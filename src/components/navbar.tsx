"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, PlusCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/upload", label: "Post", icon: PlusCircle },
  { href: "/leaderboard", label: "Top Pubs", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center h-16 z-50">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center gap-0.5 text-xs",
            pathname === href ? "text-amber-400" : "text-zinc-500 hover:text-zinc-200"
          )}
        >
          <Icon size={22} />
          {label}
        </Link>
      ))}
      <Link
        href="/auth/login"
        className="flex flex-col items-center gap-0.5 text-xs text-zinc-500 hover:text-zinc-200"
      >
        <LogIn size={22} />
        Login
      </Link>
    </nav>
  );
}
