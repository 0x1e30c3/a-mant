"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, Check, X, Droplets, AlertCircle } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { A } from "@/components/app/ui";
import { useTokenBalances } from "@/hooks/useVault";
import { ADDRESSES, VAULT_ABI, ERC20_ABI, IS_TESTNET } from "@/lib/contracts";
import { mantleTestnet } from "@/lib/wagmi";
import { formatUnits, parseUnits } from "viem";

type Token = "USDY" | "mETH";

const TOKENS: Record<Token, { address: `0x${string}`; label: string; color: string; decimals: number }> = {
  USDY: { address: ADDRESSES.USDY, label: "USDY", color: A.accent, decimals: 18 },
  "mETH": { address: ADDRESSES.METH, label: "mETH", color: "hsl(var(--protective))", decimals: 18 },
};

const QUICK_AMOUNTS = [100, 500, 1000];

type Status = "input" | "approving" | "depositing" | "done" | "fauceting";

export function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { address, chain } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [token, setToken] = useState<Token>("USDY");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("input");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { usdyFormatted, methFormatted } = useTokenBalances();
  const balance = token === "USDY" ? usdyFormatted : methFormatted;

  const { writeContractAsync } = useWriteContract();
  const { isLoading: txPending } = useWaitForTransactionReceipt({ hash });

  const wrongChain = IS_TESTNET ? chainId !== 5003 : chainId !== 5000;

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setAmount("");
        setStatus("input");
        setHash(undefined);
        setError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const value = parseFloat(amount);
  const valid = !isNaN(value) && value > 0;
  const tokenInfo = TOKENS[token];
  const parsedAmount = valid ? parseUnits(amount, tokenInfo.decimals) : 0n;

  async function ensureCorrectChain() {
    if (wrongChain) {
      try {
        await switchChainAsync({ chainId: IS_TESTNET ? 5003 : 5000 });
        return true;
      } catch {
        setError("Please switch to Mantle Testnet in MetaMask");
        return false;
      }
    }
    return true;
  }

  async function handleFaucet() {
    if (!address) return;
    setError(null);

    const ok = await ensureCorrectChain();
    if (!ok) return;

    try {
      setStatus("fauceting");
      const hash = await writeContractAsync({
        address: tokenInfo.address,
        abi: ["function mint(address to, uint256 amount) external"],
        functionName: "mint",
        args: [address, parseUnits("1000", tokenInfo.decimals)],
      });
      setHash(hash);
    } catch (err: any) {
      console.error("Faucet error:", err);
      const msg = err?.shortMessage ?? err?.message ?? "Transaction failed";
      setError(msg.includes("User rejected") ? "Transaction rejected" : msg.slice(0, 100));
      setStatus("input");
    }
  }

  async function handleDeposit() {
    if (!valid || !address) return;
    setError(null);

    const ok = await ensureCorrectChain();
    if (!ok) return;

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
      console.error("Deposit error:", err);
      const msg = err?.shortMessage ?? err?.message ?? "Transaction failed";
      setError(msg.includes("User rejected") ? "Transaction rejected" : msg.slice(0, 100));
      setStatus("input");
      setHash(undefined);
    }
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
          <div
            className="absolute inset-0"
            style={{ background: "rgba(20,20,30,0.35)", backdropFilter: "blur(4px)" }}
            onClick={status === "input" ? onClose : undefined}
          />

          <motion.div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{ background: "#FFFFFF", border: `1px solid ${A.cardBorder}`, boxShadow: "0 -8px 60px rgba(20,20,30,0.18)" }}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
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
                    {value.toLocaleString("en-US", { minimumFractionDigits: 2 })} {token} is now working with Axiom.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="input" exit={{ opacity: 0 }} className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.28)" }}
                      >
                        <ArrowDownToLine size={16} style={{ color: A.accent }} />
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-foreground leading-tight">Add deposit</p>
                        <p className="text-[11.5px] text-muted-foreground">Axiom rebalances across USDY &amp; mETH</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      disabled={status !== "input"}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Wrong chain warning */}
                  {wrongChain && (
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-[12.5px]"
                      style={{ background: "rgba(255,180,50,0.1)", border: "1px solid rgba(255,180,50,0.25)", color: "#b48a00" }}
                    >
                      <AlertCircle size={14} />
                      <span>Switch to Mantle Testnet in MetaMask</span>
                      <button
                        onClick={async () => {
                          try { await switchChainAsync({ chainId: 5003 }); } catch {}
                        }}
                        className="ml-auto font-semibold underline"
                      >
                        Switch
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-[12.5px]"
                      style={{ background: "rgba(220,60,60,0.08)", border: "1px solid rgba(220,60,60,0.2)", color: "hsl(var(--destructive))" }}
                    >
                      <AlertCircle size={14} />
                      <span className="flex-1 truncate">{error}</span>
                      <button onClick={() => setError(null)} className="shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {/* Token selector */}
                  <div className="flex gap-2 mb-4">
                    {(Object.keys(TOKENS) as Token[]).map((t) => {
                      const info = TOKENS[t];
                      const selected = t === token;
                      const bal = t === "USDY" ? usdyFormatted : methFormatted;
                      return (
                        <button
                          key={t}
                          onClick={() => setToken(t)}
                          disabled={status !== "input"}
                          className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                          style={{
                            background: selected ? `${info.color}10` : A.subtle,
                            border: `1px solid ${selected ? `${info.color}40` : A.hairline}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: info.color }} />
                            <span className="text-[12.5px] font-medium" style={{ color: selected ? "foreground" : "rgba(20,20,30,0.6)" }}>
                              {info.label}
                            </span>
                          </div>
                          <span className="text-[10.5px] text-muted-foreground font-mono">
                            {parseFloat(bal).toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
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
                      disabled={status !== "input"}
                      className="flex-1 bg-transparent text-[2.4rem] font-light text-foreground outline-none placeholder:text-black/15 disabled:opacity-60"
                      autoFocus
                    />
                  </div>

                  {/* Quick chips */}
                  <div className="flex gap-2 mb-2">
                    {QUICK_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(String(a))}
                        disabled={status !== "input"}
                        className="flex-1 py-2 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-all active:scale-95 disabled:opacity-40"
                        style={{ background: A.subtle, border: `1px solid ${A.hairline}` }}
                      >
                        ${a.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Balance info */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-5 px-0.5">
                    <span>
                      Wallet balance: {parseFloat(balance).toFixed(4)} {token}
                    </span>
                    <div className="flex items-center gap-2">
                      {valid && parseFloat(amount) > parseFloat(balance) && (
                        <span style={{ color: "hsl(var(--destructive))" }}>Insufficient</span>
                      )}
                      {IS_TESTNET && (
                        <button
                          onClick={handleFaucet}
                          disabled={status !== "input"}
                          className="flex items-center gap-1 px-2 py-1 rounded-md transition-all hover:bg-blue-50 active:scale-95 disabled:opacity-40"
                          style={{ color: "hsl(var(--protective))", border: "1px solid rgba(100,160,255,0.25)" }}
                        >
                          <Droplets size={11} />
                          <span className="font-medium">Get 1000 {token}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Confirm */}
                  <button
                    onClick={handleDeposit}
                    disabled={!valid || status !== "input" || parseFloat(amount) > parseFloat(balance)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                    style={{ background: A.accent, color: A.onAccent }}
                  >
                    {status === "approving" && (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Approving {token}...
                      </>
                    )}
                    {status === "depositing" && (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Depositing...
                      </>
                    )}
                    {status === "fauceting" && (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Minting test tokens...
                      </>
                    )}
                    {status === "input" && "Confirm deposit"}
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center mt-3">No lock-up · Axiom allocates automatically</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
