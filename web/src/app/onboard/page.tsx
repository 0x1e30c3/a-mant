"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { injected } from "wagmi/connectors";
import { cn } from "@/lib/utils";
import { RiskMode, OnboardingData } from "@/types";

const STEPS = ["goal", "duration", "risk", "connect", "activate"] as const;
type Step = (typeof STEPS)[number];

const DURATION_OPTIONS = [3, 6, 12, 24];
const RISK_OPTIONS: { mode: RiskMode; label: string; desc: string }[] = [
  { mode: 0, label: "Safe", desc: "Prioritize capital protection, steady yield" },
  { mode: 1, label: "Balanced", desc: "Mix of safety and growth" },
  { mode: 2, label: "Aggressive", desc: "Maximize growth, higher risk tolerance" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, isPending: connecting } = useConnect();
  const [step, setStep] = useState<Step>("goal");
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const stepIndex = STEPS.indexOf(step);
  const progress = (stepIndex / (STEPS.length - 1)) * 100;

  function next(update?: Partial<OnboardingData>) {
    if (update) setData((d) => ({ ...d, ...update }));
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  }

  function handleConnect() {
    connect({ connector: injected() });
  }

  function handleActivate() {
    router.push("/app");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-px w-full bg-border">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-center px-6 pt-6">
        <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
          a-MANT
        </span>
        {step !== "activate" && (
          <button
            onClick={() =>
              stepIndex === 0
                ? router.push("/")
                : setStep(STEPS[stepIndex - 1])
            }
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {stepIndex === 0 ? "← Back" : "Back"}
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-sm space-y-10"
          >
            {step === "goal" && (
              <GoalStep onNext={(amount) => next({ goalAmount: amount })} />
            )}
            {step === "duration" && (
              <DurationStep onNext={(months) => next({ durationMonths: months })} />
            )}
            {step === "risk" && (
              <RiskStep onNext={(mode) => next({ riskMode: mode })} />
            )}
            {step === "connect" && (
              <ConnectStep
                isConnected={isConnected}
                address={address}
                connecting={connecting}
                onConnect={handleConnect}
                onNext={() => next()}
              />
            )}
            {step === "activate" && (
              <ActivateStep address={address} onActivate={handleActivate} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function GoalStep({ onNext }: { onNext: (amount: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-light text-foreground leading-tight">
          How much do you
          <br />
          want to protect?
        </h1>
        <p className="text-sm text-muted-foreground">
          The amount your AI will shield from inflation and currency risk.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <span className="text-muted-foreground text-lg">$</span>
          <input
            type="number"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 bg-transparent text-3xl font-light text-foreground outline-none placeholder:text-border"
            autoFocus
          />
        </div>
        <p className="text-xs text-muted-foreground">USD equivalent. Minimum $100.</p>
      </div>

      <Button
        size="xl"
        className="w-full"
        disabled={!value || parseFloat(value) < 100}
        onClick={() => onNext(value)}
      >
        Continue
      </Button>
    </div>
  );
}

function DurationStep({ onNext }: { onNext: (months: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-light text-foreground leading-tight">
          For how long?
        </h1>
        <p className="text-sm text-muted-foreground">
          Your AI works around the clock for this entire period.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DURATION_OPTIONS.map((months) => (
          <button
            key={months}
            onClick={() => setSelected(months)}
            className={cn(
              "p-4 rounded-lg border text-left transition-all duration-150",
              selected === months
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-surface-elevated text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="text-2xl font-light">{months}</div>
            <div className="text-xs mt-1">months</div>
          </button>
        ))}
      </div>

      <Button
        size="xl"
        className="w-full"
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
      >
        Continue
      </Button>
    </div>
  );
}

function RiskStep({ onNext }: { onNext: (mode: RiskMode) => void }) {
  const [selected, setSelected] = useState<RiskMode | null>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-light text-foreground leading-tight">
          How aggressive?
        </h1>
        <p className="text-sm text-muted-foreground">
          Your AI adapts its strategy to match your risk preference.
        </p>
      </div>

      <div className="space-y-3">
        {RISK_OPTIONS.map(({ mode, label, desc }) => (
          <button
            key={mode}
            onClick={() => setSelected(mode)}
            className={cn(
              "w-full p-4 rounded-lg border text-left transition-all duration-150",
              selected === mode
                ? "border-accent bg-accent/10"
                : "border-border bg-surface-elevated hover:border-border/80"
            )}
          >
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground mt-1">{desc}</div>
          </button>
        ))}
      </div>

      <Button
        size="xl"
        className="w-full"
        disabled={selected === null}
        onClick={() => selected !== null && onNext(selected)}
      >
        Continue
      </Button>
    </div>
  );
}

function ConnectStep({
  isConnected,
  address,
  connecting,
  onConnect,
  onNext,
}: {
  isConnected: boolean;
  address?: string;
  connecting: boolean;
  onConnect: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-light text-foreground leading-tight">
          Connect your
          <br />
          wallet
        </h1>
        <p className="text-sm text-muted-foreground">
          Your AI needs wallet access to manage and grow your savings on-chain.
        </p>
      </div>

      {isConnected ? (
        <div className="space-y-6">
          <div className="p-4 bg-surface-elevated rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">Connected</p>
            <p className="text-sm font-medium text-foreground mt-1 font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <Button size="xl" className="w-full" onClick={onNext}>
            Continue
          </Button>
        </div>
      ) : (
        <Button
          size="xl"
          className="w-full"
          loading={connecting}
          onClick={onConnect}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

function ActivateStep({
  onActivate,
}: {
  address?: string;
  onActivate: () => void;
}) {
  const [activating, setActivating] = useState(false);

  async function handleActivate() {
    setActivating(true);
    await new Promise((r) => setTimeout(r, 2200));
    onActivate();
  }

  return (
    <div className="space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-accent/10 border border-accent/20" />
          <div
            className="absolute inset-2 rounded-full bg-accent/20 animate-pulse"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-accent" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-light text-foreground">Your AI is ready</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Axiom will start protecting and growing your savings autonomously. You don&apos;t need to do anything.
          </p>
        </div>
      </motion.div>

      <Button
        size="xl"
        className="w-full"
        loading={activating}
        onClick={handleActivate}
      >
        {activating ? "Waking Axiom..." : "Activate Axiom"}
      </Button>
    </div>
  );
}
