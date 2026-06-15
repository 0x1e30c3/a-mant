"use client";

import { Toaster as Sonner } from "sonner";
import { A } from "@/components/app/ui";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: A.cardBg,
          border: `1px solid ${A.cardBorder}`,
          color: "hsl(var(--foreground))",
          fontFamily: "var(--font-manrope)",
          fontSize: "13px",
          borderRadius: "16px",
          padding: "14px 16px",
          boxShadow: "0 4px 16px rgba(20,20,30,0.12), 0 0 0 1px rgba(255,255,255,0.05) inset",
        },
      }}
    />
  );
}
