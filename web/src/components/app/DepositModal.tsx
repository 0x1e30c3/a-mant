"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, Check, X, Droplets, AlertCircle, ShieldCheck } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { A } from "@/components/app/ui";
import { useTokenBalances } from "@/hooks/useVault";
import { ADDRESSES, VAULT_ABI, ERC20_ABI, IS_TESTNET } from "@/lib/contracts";
import { parseUnits } from "viem";

type Token = "USDY" | "mETH";

const TOKENS: Record<Token, { address: `0x${string}`; label: string; color: string; decimals: number; desc: string }> = {
  USDY:  { address: ADDRESSES.USDY, label: "USDY",  color: A.accent,                    decimals: 18, desc: "Treasury · 4.5% APY" },
  "mETH":{ address: ADDRESSES.METH, label: "mETH",  color: "hsl(var(--protective))",    decimals: 18, desc: "Staking · 3.8% APY"  },
};

const QUICK_AMOUNTS = [100, 500, 1_000];

type Status = "input" | "approving" | "depositing" | "done" | "fauceting";

function fmtBal(raw: string) {
  const n = parseFloat(raw);
  if (isNaN(n)) return "0.00";
  if (n >= 100_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1_000)   return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toFixed(4);
}

export function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { address }           = useAccount();
  const chainId               = useChainId();
  const { switchChainAsync }  = useSwitchChain();

  const [token,  setToken]  = useState<Token>("USDY");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("input");
  const [hash,   setHash]   = useState<`0x${string}` | undefined>();
  const [error,  setError]  = useState<string | null>(null);

  const { usdyFormatted, methFormatted } = useTokenBalances();
  const balance    = token === "USDY" ? usdyFormatted : methFormatted;
  const tokenInfo  = TOKENS[token];

  const { writeContractAsync } = useWriteContract();
  const { isLoading: txPending } = useWaitForTransactionReceipt({ hash });

  const wrongChain  = IS_TESTNET ? chainId !== 5003 : chainId !== 5000;
  const value       = parseFloat(amount);
  const valid       = !isNaN(value) && value > 0;
  const insufficient = valid && value > parseFloat(balance);
  const parsedAmount = valid ? parseUnits(amount, tokenInfo.decimals) : 0n;
  const canConfirm   = valid && status === "input" && !insufficient;

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setAmount(""); setStatus("input"); setHash(undefined); setError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function ensureChain() {
    if (!wrongChain) return true;
    try {
      await switchChainAsync({ chainId: IS_TESTNET ? 5003 : 5000 });
      return true;
    } catch {
      setError("Please switch to Mantle in MetaMask");
      return false;
    }
  }

  async function handleFaucet() {
    if (!address) return;
    setError(null);
    if (!(await ensureChain())) return;
    try {
      setStatus("fauceting");
      const h = await writeContractAsync({
        address: tokenInfo.address,
        abi: ["function mint(address to, uint256 amount) external"],
        functionName: "mint",
        args: [address, parseUnits("1000", tokenInfo.decimals)],
      });
      setHash(h);
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? "Transaction failed";
      setError(msg.includes("User rejected") ? "Transaction rejected" : msg.slice(0, 100));
    } finally {
      setStatus("input");
    }
  }

  async function handleDeposit() {
    if (!canConfirm || !address) return;
    setError(null);
    if (!(await ensureChain())) return;
    try {
      setStatus("approving");
      const approveHash = await writeContractAsync({
        address: tokenInfo.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ADDRESSES.VAULT, parsedAmount],
      });
      setHash(approveHash);
      await new Promise((r) => setTimeout(r, 2000));

      setStatus("depositing");
      const depositHash = await writeContractAsync({
        address: ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [tokenInfo.address, parsedAmount],
      });
      setHash(depositHash);
      setStatus("done");
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? "Transaction failed";
      setError(msg.includes("User rejected") ? "Transaction rejected" : msg.slice(0, 100));
      setStatus("input");
      setHash(undefined);
    }
  }

  const isProcessing = status === "approving" || status === "depositing" || status === "fauceting";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(14,13,11,0.45)", backdropFilter: "blur(6px)" }}
            onClick={!isProcessing ? onClose : undefined}
          />

          {/* Sheet */}
          <motion.div
            className="relative w-full sm:max-w-[420px] rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
            style={{
              background: "hsl(var(--background))",
              border: `1px solid ${A.cardBorder}`,
              boxShadow: "0 32px 80px rgba(14,13,11,0.22), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,  opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ambient top glow */}
            <div
              className="absolute inset-x-0 top-0 h-48 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 80% 100% at 50% -10%, rgba(255,205,90,0.15) 0%, transparent 65%)" }}
            />

            <AnimatePresence mode="wait">

              {/* ── DONE STATE ── */}
              {status === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex flex-col items-center px-8 pt-10 pb-8 text-center"
                >
                  {/* X top-right */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: "rgba(20,20,30,0.06)" }}
                    aria-label="Close"
                  >
                    <X size={14} style={{ color: "rgba(20,20,30,0.5)" }} />
                  </button>

                  {/* Success icon */}
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(64,200,120,0.12)", border: "1.5px solid rgba(64,200,120,0.3)" }}
                  >
                    <Check size={28} style={{ color: "hsl(var(--positive))" }} strokeWidth={2.5} />
                  </motion.span>

                  <p className="text-[18px] font-semibold text-foreground mb-2">Deposit confirmed</p>
                  <p className="text-[13.5px] leading-relaxed mb-1" style={{ color: "rgba(20,20,30,0.55)" }}>
                    <span className="font-semibold text-foreground">
                      {value.toLocaleString("en-US", { minimumFractionDigits: 2 })} {token}
                    </span>{" "}
                    is now working with Axiom.
                  </p>
                  <p className="text-[12px] mb-8" style={{ color: "rgba(20,20,30,0.4)" }}>
                    Axiom will allocate and rebalance automatically.
                  </p>

                  <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl text-[14px] font-semibold transition-all active:scale-[0.98]"
                    style={{ background: A.accent, color: A.onAccent }}
                  >
                    Done
                  </button>
                </motion.div>
              )}

              {/* ── INPUT STATE ── */}
              {status !== "done" && (
                <motion.div key="input" exit={{ opacity: 0 }} className="relative">

                  {/* ── Header ── */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-5" style={{ borderBottom: `1px solid ${A.hairline}` }}>
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.28)" }}
                      >
                        <ArrowDownToLine size={15} style={{ color: A.accent }} />
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-foreground leading-tight">Add deposit</p>
                        <p className="text-[11.5px] mt-0.5" style={{ color: "rgba(20,20,30,0.45)" }}>
                          Axiom rebalances across USDY &amp; mETH
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      disabled={isProcessing}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
                      style={{ background: "rgba(20,20,30,0.06)" }}
                      aria-label="Close"
                    >
                      <X size={14} style={{ color: "rgba(20,20,30,0.5)" }} />
                    </button>
                  </div>

                  {/* ── Body ── */}
                  <div className="px-6 py-5 space-y-4">

                    {/* Wrong chain */}
                    {wrongChain && (
                      <div
                        className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-[12.5px]"
                        style={{ background: "rgba(255,180,50,0.08)", border: "1px solid rgba(255,180,50,0.22)" }}
                      >
                        <AlertCircle size={14} style={{ color: "#c49000", flexShrink: 0 }} />
                        <span style={{ color: "#9a6e00" }} className="flex-1">Switch to Mantle {IS_TESTNET ? "Testnet" : "Mainnet"}</span>
                        <button
                          onClick={async () => { try { await switchChainAsync({ chainId: IS_TESTNET ? 5003 : 5000 }); } catch {} }}
                          className="font-semibold text-[12px] px-2.5 py-1 rounded-lg transition-colors"
                          style={{ background: "rgba(255,180,50,0.18)", color: "#9a6e00" }}
                        >
                          Switch
                        </button>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div
                        className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-[12.5px]"
                        style={{ background: "rgba(220,60,60,0.07)", border: "1px solid rgba(220,60,60,0.18)" }}
                      >
                        <AlertCircle size={14} style={{ color: "hsl(var(--destructive))", flexShrink: 0, marginTop: 1 }} />
                        <span className="flex-1 leading-snug" style={{ color: "hsl(var(--destructive))" }}>{error}</span>
                        <button onClick={() => setError(null)} className="shrink-0 mt-0.5 opacity-60 hover:opacity-100">
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {/* Token selector */}
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(TOKENS) as Token[]).map((t) => {
                        const info     = TOKENS[t];
                        const selected = t === token;
                        const bal      = t === "USDY" ? usdyFormatted : methFormatted;
                        return (
                          <button
                            key={t}
                            onClick={() => { setToken(t); setAmount(""); }}
                            disabled={isProcessing}
                            className="flex flex-col gap-2 p-3.5 rounded-2xl text-left transition-all active:scale-[0.97] disabled:opacity-50"
                            style={{
                              background: selected ? `${info.color}12` : "rgba(20,20,30,0.03)",
                              border: `1.5px solid ${selected ? `${info.color}45` : "rgba(20,20,30,0.07)"}`,
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: info.color }} />
                                <span className="text-[13px] font-semibold" style={{ color: selected ? "rgb(20,20,30)" : "rgba(20,20,30,0.45)" }}>
                                  {info.label}
                                </span>
                              </div>
                              {selected && (
                                <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: info.color }}>
                                  <Check size={9} color="white" strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] mb-0.5" style={{ color: "rgba(20,20,30,0.4)" }}>{info.desc}</p>
                              <p className="text-[11px] font-mono font-medium" style={{ color: "rgba(20,20,30,0.55)" }}>
                                {fmtBal(bal)} {info.label}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Amount input */}
                    <div
                      className="rounded-2xl px-4 py-3.5"
                      style={{ background: "rgba(20,20,30,0.03)", border: `1.5px solid ${insufficient ? "rgba(220,60,60,0.35)" : valid ? `${tokenInfo.color}35` : "rgba(20,20,30,0.08)"}` }}
                    >
                      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(20,20,30,0.38)" }}>Amount</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[1.5rem] font-light" style={{ color: "rgba(20,20,30,0.3)" }}>$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          disabled={isProcessing}
                          className="flex-1 bg-transparent text-[2.2rem] font-light text-foreground outline-none placeholder:opacity-20 disabled:opacity-50 min-w-0"
                          autoFocus
                        />
                        <button
                          onClick={() => setAmount(parseFloat(balance).toFixed(2))}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
                          style={{ background: `${tokenInfo.color}14`, color: tokenInfo.color }}
                        >
                          MAX
                        </button>
                      </div>

                      {/* Quick chips */}
                      <div className="flex gap-1.5 mt-3">
                        {QUICK_AMOUNTS.map((a) => (
                          <button
                            key={a}
                            onClick={() => setAmount(String(a))}
                            disabled={isProcessing}
                            className="flex-1 py-1.5 rounded-lg text-[11.5px] font-medium transition-all active:scale-95 disabled:opacity-40"
                            style={{
                              background: parseFloat(amount) === a ? `${tokenInfo.color}15` : "rgba(20,20,30,0.05)",
                              border: `1px solid ${parseFloat(amount) === a ? `${tokenInfo.color}40` : "rgba(20,20,30,0.08)"}`,
                              color: parseFloat(amount) === a ? tokenInfo.color : "rgba(20,20,30,0.5)",
                            }}
                          >
                            ${a.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Balance row */}
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-[11.5px]" style={{ color: "rgba(20,20,30,0.45)" }}>
                        Balance:{" "}
                        <span className="font-medium" style={{ color: insufficient ? "hsl(var(--destructive))" : "rgba(20,20,30,0.65)" }}>
                          {fmtBal(balance)} {token}
                        </span>
                        {insufficient && (
                          <span className="ml-1.5 text-[11px]" style={{ color: "hsl(var(--destructive))" }}>· Insufficient</span>
                        )}
                      </p>
                      {IS_TESTNET && (
                        <button
                          onClick={handleFaucet}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 disabled:opacity-40"
                          style={{ color: "hsl(var(--protective))", background: "rgba(100,160,255,0.08)", border: "1px solid rgba(100,160,255,0.2)" }}
                        >
                          {status === "fauceting"
                            ? <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin" />
                            : <Droplets size={11} />
                          }
                          Get 1000 {token}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Footer ── */}
                  <div className="px-6 pb-6 space-y-3" style={{ borderTop: `1px solid ${A.hairline}` }}>
                    <div className="pt-4">
                      <button
                        onClick={handleDeposit}
                        disabled={!canConfirm || isProcessing}
                        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                        style={{ background: A.accent, color: A.onAccent }}
                      >
                        {status === "approving" && (
                          <><span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />Approving {token}…</>
                        )}
                        {status === "depositing" && (
                          <><span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />Depositing…</>
                        )}
                        {status === "input" && (
                          <><ArrowDownToLine size={15} />Confirm deposit</>
                        )}
                      </button>
                    </div>

                    {/* Trust line */}
                    <div className="flex items-center justify-center gap-1.5">
                      <ShieldCheck size={11} style={{ color: "rgba(20,20,30,0.3)" }} />
                      <p className="text-[11px]" style={{ color: "rgba(20,20,30,0.38)" }}>
                        No lock-up · Axiom allocates automatically
                      </p>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
