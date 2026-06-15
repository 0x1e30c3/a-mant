"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/logo.png";
import { Container, T } from "./primitives";

// ─── Navbar — fixed, centered inside the same max-width column ─────────────────
export function Navbar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-3">
      <Container>
        <nav
          className="flex items-center justify-between px-4 h-12 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(20,20,30,0.1)",
            boxShadow: "0 4px 20px rgba(20,20,30,0.06)",
          }}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="a-MANT" width={22} height={22} priority className="rounded-md" />
            <span className="text-[13px] font-semibold tracking-tight">a-MANT</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-[12px] text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pillars" className="hover:text-foreground transition-colors">Layers</a>
            <a href="#signals" className="hover:text-foreground transition-colors">Signals</a>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/app"
              className="text-[12px] text-muted-foreground px-3 py-1.5 rounded-lg hover:text-foreground transition-colors hidden sm:block"
            >
              Dashboard
            </Link>
            {/* Nav CTA with corner brackets */}
            <Link
              href="/onboard"
              className="relative text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-all active:scale-95"
              style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.32)", color: T.accent }}
            >
              <span className="absolute top-0 left-0 w-2.5 h-2.5" style={{ borderTop: `1.5px solid ${T.bracket}`, borderLeft: `1.5px solid ${T.bracket}` }} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5" style={{ borderTop: `1.5px solid ${T.bracket}`, borderRight: `1.5px solid ${T.bracket}` }} />
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5" style={{ borderBottom: `1.5px solid ${T.bracket}`, borderLeft: `1.5px solid ${T.bracket}` }} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5" style={{ borderBottom: `1.5px solid ${T.bracket}`, borderRight: `1.5px solid ${T.bracket}` }} />
              Get started
            </Link>
          </div>
        </nav>
      </Container>
    </div>
  );
}
