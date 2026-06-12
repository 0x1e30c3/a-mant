"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { A, LiveDot } from "@/components/app/ui";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Why did you move my funds last night?",
  "What's the current yield on USDY?",
  "How is my portfolio doing?",
  "When will I reach my goal?",
];

export default function ChatPage() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], userAddress: address }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I encountered an issue retrieving that information. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] max-w-3xl mx-auto w-full">
      {/* Axiom identity strip */}
      <div className="pt-5 pb-3">
        <div className="flex items-center gap-3">
          <span
            className="relative w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.25)" }}
          >
            <Sparkles size={15} style={{ color: A.accent }} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-foreground leading-tight">Axiom</p>
            <div className="flex items-center gap-1.5">
              <LiveDot />
              <span className="text-[11px] text-muted-foreground">AI guardian · online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <span
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "rgba(255,239,197,0.08)", border: "1px solid rgba(255,239,197,0.2)" }}
            >
              <Sparkles size={20} style={{ color: A.accent }} />
            </span>
            <p className="text-[17px] font-light text-foreground mb-1.5">Ask Axiom anything</p>
            <p className="text-[12.5px] text-muted-foreground mb-7 max-w-[260px] leading-relaxed">
              Your AI guardian explains every decision it makes — in plain language.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 w-full max-w-md">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-left text-[12.5px] text-muted-foreground px-3.5 py-3 rounded-xl transition-all hover:text-foreground active:scale-[0.98]"
                  style={{ background: A.subtle, border: `1px solid ${A.hairline}` }}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"
                  style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.22)" }}
                >
                  <Sparkles size={12} style={{ color: A.accent }} />
                </span>
              )}
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2.5 text-[13.5px] leading-relaxed",
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-md text-background"
                    : "rounded-2xl rounded-bl-md text-foreground"
                )}
                style={
                  msg.role === "user"
                    ? { background: A.accent }
                    : { background: A.cardBg, border: `1px solid ${A.cardBorder}` }
                }
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0"
              style={{ background: "rgba(255,239,197,0.1)", border: "1px solid rgba(255,239,197,0.22)" }}
            >
              <Sparkles size={12} style={{ color: A.accent }} />
            </span>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: A.cardBg, border: `1px solid ${A.cardBorder}` }}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 p-1.5 rounded-2xl"
          style={{ background: A.cardBg, border: `1px solid ${A.cardBorder}` }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Axiom…"
            className="flex-1 bg-transparent px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
            style={{ background: A.accent, color: "hsl(var(--background))" }}
            aria-label="Send"
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
