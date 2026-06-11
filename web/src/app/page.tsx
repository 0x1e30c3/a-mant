"use client";

import { SmoothScroll } from "@/components/SmoothScroll";
import {
  Container,
  Navbar,
  Hero,
  Marquee,
  Problem,
  HowItWorks,
  Pillars,
  SignalFeed,
  TechStack,
  FooterCTA,
} from "@/components/landing";

// ─── Landing page ──────────────────────────────────────────────────────────────
//   Every section lives inside one centered <Container> (max-w-6xl) so nothing
//   sprawls edge-to-edge on wide screens. Lenis drives smooth scroll.
export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className="text-foreground overflow-x-hidden min-h-screen" style={{ background: "#080810" }}>
        <Navbar />
        {/* Full-height sections; the fixed navbar floats over the hero's top */}
        <Container>
          <Hero />
          <Marquee />
          <Problem />
          <HowItWorks />
          <Pillars />
          <SignalFeed />
          <TechStack />
          <FooterCTA />
        </Container>
      </div>
    </SmoothScroll>
  );
}
