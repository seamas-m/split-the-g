"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PlusCircle, LogIn, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";

const links = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/upload", label: "Post", icon: PlusCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/auth/login");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-porter border-t border-malt flex justify-around items-center h-16 z-50">
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

      {session ? (
        <>
          <div className="flex flex-col items-center gap-0.5 text-xs font-medium text-foam">
            <User size={22} />
            <span className="max-w-[60px] truncate">{session.user.name}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-0.5 text-xs font-medium text-foam hover:text-cream transition-colors"
          >
            <LogOut size={22} />
            Sign out
          </button>
        </>
      ) : (
        <Link
          href="/auth/login"
          className="flex flex-col items-center gap-0.5 text-xs font-medium text-foam hover:text-cream transition-colors"
        >
          <LogIn size={22} />
          Login
        </Link>
      )}
    </nav>
  );
}
