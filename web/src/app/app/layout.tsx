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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen text-foreground">
      <AppBackdrop />

      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-2xl px-4 pt-3">
          <div
            className="flex items-center justify-between px-4 h-12 rounded-xl"
            style={{ background: "rgba(8,8,16,0.82)", backdropFilter: "blur(16px)", border: `1px solid ${A.hairline}` }}
          >
            <Link href="/" className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.3)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: A.accent }} />
              </span>
              <span className="text-[13px] font-semibold tracking-tight">a-MANT</span>
            </Link>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(64,200,120,0.07)", border: "1px solid rgba(64,200,120,0.18)" }}
            >
              <LiveDot />
              <span className="text-[11px] font-medium" style={{ color: "hsl(var(--positive))" }}>Axiom active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl pb-28">{children}</main>

      {/* Floating bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 pb-4 pt-2 pointer-events-none">
        <div className="mx-auto max-w-2xl px-4">
          <div
            className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-2xl"
            style={{ background: "rgba(12,12,20,0.9)", backdropFilter: "blur(16px)", border: `1px solid ${A.hairline}`, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition-all active:scale-95",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  style={active ? { background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.18)" } : { border: "1px solid transparent" }}
                >
                  <Icon size={15} style={active ? { color: A.accent } : undefined} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
