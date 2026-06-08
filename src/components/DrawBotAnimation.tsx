"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DrawBotStep } from "@/types";

interface Props {
  steps: DrawBotStep[];
  onComplete?: () => void;
}

export default function DrawBotAnimation({ steps, onComplete }: Props) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= steps.length) {
      const timer = setTimeout(() => onComplete?.(), 1500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisible((v) => v + 1), 600);
    return () => clearTimeout(timer);
  }, [visible, steps.length, onComplete]);

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-slate-50 to-white shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-sm font-bold text-primary">Generating Matchups...</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {steps.slice(0, visible).map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                step.done ? "bg-emerald-50 text-emerald-700" : "bg-surface text-primary/50"
              }`}
            >
              <span className="text-base">{step.icon}</span>
              <span className="font-medium">{step.label}</span>
              {i === visible - 1 && step.done && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto text-emerald-500 text-xs font-semibold">
                  Done
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
