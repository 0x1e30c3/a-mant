"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, ScrollText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppBackdrop, A, LiveDot } from "@/components/app/ui";

const NAV = [
  { href: "/app", label: "Portfolio", icon: Wallet },
  { href: "/app/chronicle", label: "Chronicle", icon: ScrollText },
  { href: "/app/chat", label: "Ask Axiom", icon: Sparkles },
];

// Same centered column as the landing page so the dashboard fills wide screens
// instead of sitting in a narrow tablet-width strip.
const SHELL = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen text-foreground">
      <AppBackdrop />

      {/* Single top nav (logo · tabs · status) — no more duplicate bottom bar */}
      <header className="sticky top-0 z-40 pt-3">
        <div className={SHELL}>
          <div
            className="flex items-center justify-between gap-3 px-3 sm:px-4 h-14 rounded-xl"
            style={{ background: "rgba(8,8,16,0.82)", backdropFilter: "blur(16px)", border: `1px solid ${A.hairline}` }}
          >
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.3)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: A.accent }} />
              </span>
              <span className="text-[13px] font-semibold tracking-tight hidden sm:inline">a-MANT</span>
            </Link>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all active:scale-95",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    style={active ? { background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.18)" } : { border: "1px solid transparent" }}
                  >
                    <Icon size={15} style={active ? { color: A.accent } : undefined} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: "rgba(64,200,120,0.07)", border: "1px solid rgba(64,200,120,0.18)" }}
            >
              <LiveDot />
              <span className="text-[11px] font-medium" style={{ color: "hsl(var(--positive))" }}>Axiom active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={cn(SHELL, "pb-16")}>{children}</main>
    </div>
  );
}
