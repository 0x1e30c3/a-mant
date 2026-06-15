"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, X, Sparkles } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { A } from "@/components/app/ui";
import { ADDRESSES, CHRONICLE_ABI } from "@/lib/contracts";
import { Chapter } from "@/types";

export function MilestoneNFT({
  chapter,
  onClose,
}: {
  chapter: Chapter;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const [step, setStep] = useState<"celebrate" | "mint" | "minting" | "done">("celebrate");

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = async () => {
    if (!address) return;

    try {
      setStep("minting");
      writeContract({
        address: ADDRESSES.CHRONICLE,
        abi: CHRONICLE_ABI,
        functionName: "mintChronicleNFT",
        args: [address],
      });
    } catch (err) {
      console.error("Mint failed:", err);
      setStep("mint");
    }
  };

  // Update step when transaction succeeds
  if (isSuccess && step === "minting") {
    setStep("done");
  }

  const isMilestone = chapter.chapterType === 2;

  if (!isMilestone) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(194,138,30,0.2) 0%, rgba(14,13,11,0.8) 60%)",
            backdropFilter: "blur(12px)",
          }}
          onClick={step === "done" ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg rounded-[32px] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #14141a 0%, #0a0a0f 100%)",
            border: `2px solid ${A.accent}`,
            boxShadow: `0 0 60px ${A.accent}40, 0 40px 100px rgba(14,13,11,0.6)`,
          }}
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 100% 60% at 50% 0%, ${A.accent}30 0%, transparent 70%)`,
            }}
          />

          {/* Content */}
          <div className="relative px-8 py-10 text-center">
            {step === "celebrate" && (
              <>
                {/* Celebration animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mx-auto mb-6"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "30px",
                    background: `linear-gradient(135deg, ${A.accent}20, ${A.accent}10)`,
                    border: `3px solid ${A.accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 40px ${A.accent}60`,
                  }}
                >
                  <Award size={60} style={{ color: A.accent }} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h2 className="text-[32px] font-light mb-3 leading-tight" style={{ color: "#faf8f3" }}>
                    Goal Reached!
                  </h2>
                  <p className="text-[15px] mb-8 leading-relaxed max-w-md mx-auto" style={{ color: "rgba(250,248,243,0.6)" }}>
                    Your AI guardian successfully navigated the journey. This milestone deserves to be remembered.
                  </p>

                  <button
                    onClick={() => setStep("mint")}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98]"
                    style={{
                      background: A.accent,
                      color: A.onAccent,
                      boxShadow: `0 8px 24px ${A.accent}40`,
                    }}
                  >
                    <Sparkles size={18} />
                    Claim Your Chronicle NFT
                  </button>
                </motion.div>
              </>
            )}

            {step === "mint" && (
              <>
                <div
                  className="mx-auto mb-6"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "24px",
                    background: `${A.accent}20`,
                    border: `2px solid ${A.accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Award size={50} style={{ color: A.accent }} />
                </div>

                <h2 className="text-[28px] font-light mb-3" style={{ color: "#faf8f3" }}>
                  Mint Your Chronicle
                </h2>
                <p className="text-[14px] mb-6 leading-relaxed" style={{ color: "rgba(250,248,243,0.5)" }}>
                  This NFT will include all your chapter titles, total yield earned, and goal achieved. Forever on Mantle.
                </p>

                <div className="space-y-3 mb-8">
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(250,248,243,0.05)", border: "1px solid rgba(250,248,243,0.1)" }}
                  >
                    <span className="text-[13px]" style={{ color: "rgba(250,248,243,0.6)" }}>
                      Network
                    </span>
                    <span className="text-[13px] font-semibold" style={{ color: "#faf8f3" }}>
                      Mantle
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(250,248,243,0.05)", border: "1px solid rgba(250,248,243,0.1)" }}
                  >
                    <span className="text-[13px]" style={{ color: "rgba(250,248,243,0.6)" }}>
                      Gas Fee
                    </span>
                    <span className="text-[13px] font-semibold" style={{ color: "#faf8f3" }}>
                      ~$0.10
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleMint}
                  disabled={isPending}
                  className="w-full px-6 py-4 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: A.accent,
                    color: A.onAccent,
                    boxShadow: `0 8px 24px ${A.accent}40`,
                  }}
                >
                  {isPending ? "Confirm in wallet..." : "Mint NFT"}
                </button>

                <button
                  onClick={onClose}
                  className="mt-3 text-[13px] transition-opacity hover:opacity-70"
                  style={{ color: "rgba(250,248,243,0.5)" }}
                >
                  Maybe later
                </button>
              </>
            )}

            {step === "minting" && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-6"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "24px",
                    background: `${A.accent}20`,
                    border: `2px solid ${A.accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={50} style={{ color: A.accent }} />
                </motion.div>

                <h2 className="text-[28px] font-light mb-3" style={{ color: "#faf8f3" }}>
                  Minting...
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: "rgba(250,248,243,0.5)" }}>
                  Your Chronicle NFT is being written to the blockchain. This may take a moment.
                </p>
              </>
            )}

            {step === "done" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mx-auto mb-6"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "24px",
                    background: `linear-gradient(135deg, rgba(64,200,120,0.2), rgba(64,200,120,0.1))`,
                    border: `2px solid #40c878`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 40px rgba(64,200,120,0.4)",
                  }}
                >
                  <Award size={50} style={{ color: "#40c878" }} />
                </motion.div>

                <h2 className="text-[28px] font-light mb-3" style={{ color: "#faf8f3" }}>
                  NFT Minted!
                </h2>
                <p className="text-[14px] mb-8 leading-relaxed" style={{ color: "rgba(250,248,243,0.5)" }}>
                  Your Chronicle is now immortalized on Mantle. View it on the explorer.
                </p>

                {hash && (
                  <a
                    href={`https://explorer.mantle.xyz/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold mb-4 transition-all hover:opacity-80"
                    style={{
                      background: "rgba(250,248,243,0.1)",
                      border: "1px solid rgba(250,248,243,0.2)",
                      color: "#faf8f3",
                    }}
                  >
                    View on Explorer
                    <ExternalLink size={14} />
                  </a>
                )}

                <button
                  onClick={onClose}
                  className="w-full px-6 py-4 rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98]"
                  style={{
                    background: A.accent,
                    color: A.onAccent,
                    boxShadow: `0 8px 24px ${A.accent}40`,
                  }}
                >
                  Close
                </button>
              </>
            )}
          </div>

          {/* Close button (only show on celebrate/done) */}
          {(step === "celebrate" || step === "done") && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: "rgba(250,248,243,0.1)" }}
            >
              <X size={16} style={{ color: "rgba(250,248,243,0.6)" }} />
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
