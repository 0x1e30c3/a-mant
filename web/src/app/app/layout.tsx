"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/logo.png";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { Wallet, ScrollText, Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppBackdrop, A, LiveDot } from "@/components/app/ui";
import { Toaster } from "@/components/app/Toaster";

const NAV = [
  { href: "/app", label: "Portfolio", icon: Wallet },
  { href: "/app/chronicle", label: "Chronicle", icon: ScrollText },
  { href: "/app/chat", label: "Ask Axiom", icon: Sparkles },
];

const SHELL = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="relative min-h-screen text-foreground">
      <Toaster />
      <AppBackdrop />

      <header className="sticky top-0 z-40 pt-3">
        <div className={SHELL}>
          <div
            className="flex items-center justify-between gap-3 px-3 sm:px-4 h-14 rounded-xl"
            style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", border: `1px solid ${A.hairline}`, boxShadow: "0 1px 3px rgba(20,20,30,0.05)" }}
          >
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image src={logo} alt="a-MANT" width={24} height={24} priority className="rounded-md" />
              <span className="text-[13px] font-semibold tracking-tight hidden sm:inline">a-MANT</span>
            </Link>

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
                    style={active ? { background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.3)" } : { border: "1px solid transparent" }}
                  >
                    <Icon size={15} style={active ? { color: A.accent } : undefined} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(36,160,90,0.1)", border: "1px solid rgba(36,160,90,0.25)" }}
              >
                <LiveDot />
                <span className="text-[11px] font-medium" style={{ color: "hsl(var(--positive))" }}>Axiom active</span>
              </div>

              {address && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: A.subtle, border: `1px solid ${A.hairline}` }}
                  >
                    <Wallet size={13} style={{ color: "rgba(20,20,30,0.5)" }} />
                    <span className="text-[11px] font-medium font-mono text-foreground">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="p-1.5 rounded-lg transition-all hover:bg-red-50 active:scale-95"
                    title="Disconnect"
                  >
                    <LogOut size={13} style={{ color: "rgba(20,20,30,0.4)" }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={cn(SHELL, "pb-16")}>{children}</main>
    </div>
  );
}
