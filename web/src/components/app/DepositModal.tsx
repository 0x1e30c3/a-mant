"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, Check, X } from "lucide-react";
import { A } from "@/components/app/ui";

const QUICK_AMOUNTS = [100, 500, 1000];

type Status = "input" | "processing" | "done";

// ─── DepositModal — add funds without leaving the dashboard ───────────────────
//   Replaces the old "Deposit → /onboard" jump (which restarted the whole
//   onboarding flow). Stays in /app, takes an amount, confirms, then closes.
export function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("input");

  // Reset whenever the sheet is dismissed.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setAmount("");
        setStatus("input");
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const value = parseFloat(amount);
  const valid = !isNaN(value) && value >= 100;

  async function confirm() {
    if (!valid) return;
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 1800));
    setStatus("done");
    await new Promise((r) => setTimeout(r, 1400));
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Scrim */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(20,20,30,0.35)", backdropFilter: "blur(4px)" }}
            onClick={status === "processing" ? undefined : onClose}
          />

          {/* Sheet */}
          <motion.div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{ background: "#FFFFFF", border: `1px solid ${A.cardBorder}`, boxShadow: "0 -8px 60px rgba(20,20,30,0.18)" }}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* glow */}
            <div
              className="absolute inset-x-0 top-0 h-40 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(255,205,90,0.18) 0%, transparent 70%)" }}
            />

            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative px-6 py-14 text-center"
                >
                  <span
                    className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(64,200,120,0.12)", border: "1px solid rgba(64,200,120,0.28)" }}
                  >
                    <Check size={24} style={{ color: "hsl(var(--positive))" }} strokeWidth={2.5} />
                  </span>
                  <p className="text-[17px] font-medium text-foreground mb-1.5">Deposit confirmed</p>
                  <p className="text-[13px] text-muted-foreground">
                    ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })} is now working with Axiom.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="input" exit={{ opacity: 0 }} className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.28)" }}
                      >
                        <ArrowDownToLine size={16} style={{ color: A.accent }} />
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-foreground leading-tight">Add deposit</p>
                        <p className="text-[11.5px] text-muted-foreground">Funds Axiom can allocate instantly</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      disabled={status === "processing"}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Amount field */}
                  <div className="flex items-center gap-2 border-b pb-3 mb-3" style={{ borderColor: A.cardBorder }}>
                    <span className="text-[1.6rem] font-light" style={{ color: "rgba(20,20,30,0.35)" }}>$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={status === "processing"}
                      className="flex-1 bg-transparent text-[2.4rem] font-light text-foreground outline-none placeholder:text-black/15 disabled:opacity-60"
                      autoFocus
                    />
                  </div>

                  {/* Quick chips */}
                  <div className="flex gap-2 mb-7">
                    {QUICK_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(String(a))}
                        disabled={status === "processing"}
                        className="flex-1 py-2 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-all active:scale-95 disabled:opacity-40"
                        style={{ background: A.subtle, border: `1px solid ${A.hairline}` }}
                      >
                        ${a.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Confirm */}
                  <button
                    onClick={confirm}
                    disabled={!valid || status === "processing"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                    style={{ background: A.accent, color: A.onAccent }}
                  >
                    {status === "processing" ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Depositing…
                      </>
                    ) : (
                      "Confirm deposit"
                    )}
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center mt-3">Minimum $100 · No lock-up</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
