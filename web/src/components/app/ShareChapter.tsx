"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X as XIcon } from "lucide-react";
import { A } from "@/components/app/ui";
import { Chapter } from "@/types";

export function ShareChapter({
  chapter,
  onClose,
}: {
  chapter: Chapter;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/chapter/${chapter.chapterType}-${chapter.timestamp}`
    : "";

  const ogImageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/og/chapter?title=${encodeURIComponent(chapter.title)}&type=${chapter.chapterType}&impact=${chapter.impactAmount.toString()}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTwitterShare = () => {
    const impact = chapter.impactAmount > 0n ? `+$${(Number(chapter.impactAmount) / 1e18).toFixed(4)}` : "";
    const text = `My AI just made a move on @MantleNetwork. ${impact ? `${impact} in savings.` : ""} #MantleAI #aMant`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleWarpcastShare = () => {
    const text = `My AI guardian just ${chapter.title.toLowerCase()} on a-MANT`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  return (
    <AnimatePresence>
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
          style={{ background: "rgba(14,13,11,0.5)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
          style={{
            background: "hsl(var(--background))",
            border: `1px solid ${A.cardBorder}`,
            boxShadow: "0 32px 80px rgba(14,13,11,0.25)",
          }}
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-2.5">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.3)" }}
              >
                <Share2 size={15} style={{ color: A.accent }} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-foreground">Share Chapter</p>
                <p className="text-[11px]" style={{ color: "rgba(20,20,30,0.5)" }}>
                  Spread the word
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "rgba(20,20,30,0.06)" }}
            >
              <XIcon size={14} style={{ color: "rgba(20,20,30,0.5)" }} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-3">
            {/* Twitter */}
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98]"
              style={{ background: "rgba(29,155,240,0.1)", border: "1px solid rgba(29,155,240,0.3)" }}
            >
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgb(29,155,240)", color: "#fff" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span className="text-[13px] font-semibold" style={{ color: "rgb(29,155,240)" }}>
                Share on 𝕏 (Twitter)
              </span>
            </button>

            {/* Warpcast */}
            <button
              onClick={handleWarpcastShare}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98]"
              style={{ background: "rgba(133,89,255,0.1)", border: "1px solid rgba(133,89,255,0.3)" }}
            >
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgb(133,89,255)", color: "#fff" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.5C23.5 5.67 22.83 5 22 5h-4.5v13.5h2.5v-5h2c.83 0 1.5-.67 1.5-1.5v-5.5zM21 11h-1.5V7H21v4zm-6.5-6H10v13.5h2.5V13h2c.83 0 1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5zm-1.5 6.5v-4h1.5v4H13zm-5-6.5H3.5c-.83 0-1.5.67-1.5 1.5v12h2.5V13H8v5.5h2.5v-12c0-.83-.67-1.5-1.5-1.5zM8 11H4.5V7H8v4z" />
                </svg>
              </span>
              <span className="text-[13px] font-semibold" style={{ color: "rgb(133,89,255)" }}>
                Share on Farcaster
              </span>
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-[0.98]"
              style={{ background: "rgba(194,138,30,0.08)", border: "1px solid rgba(194,138,30,0.22)" }}
            >
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(194,138,30,0.15)", border: "1px solid rgba(194,138,30,0.3)" }}
              >
                {copied ? (
                  <Check size={15} style={{ color: A.accent }} />
                ) : (
                  <Copy size={15} style={{ color: A.accent }} />
                )}
              </span>
              <span className="text-[13px] font-semibold" style={{ color: A.accent }}>
                {copied ? "Copied!" : "Copy link"}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
