"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp, signIn } from "@/lib/services/authService";
import { logger } from "@/lib/logger";

export default function VerifyLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    const e = sessionStorage.getItem("pending_verification_email");
    setStoredEmail(e);
    if (!e) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    setError("");

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length === 6) {
      document.getElementById("code-5")?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtp(storedEmail!, fullCode);
      sessionStorage.removeItem("pending_verification_email");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
      logger.error("verify-login: verification failed", err);
    } finally {
      setLoading(false);
    }
  }, [code, storedEmail]);

  const handleResend = async () => {
    setResendLoading(true);
    setError("");

    try {
      await signIn(storedEmail!);
      setCode(["", "", "", "", "", ""]);
      setCountdown(600);
      setCanResend(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      setError(message);
    } finally {
      setResendLoading(false);
    }
  };

  if (!storedEmail) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Checking session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-primary mb-2">Verify Login</h1>
          <p className="text-sm text-primary/60 mb-2">
            We&apos;ve sent a verification code to your email.
          </p>
          <p className="text-xs text-primary/40 mb-6">
            Enter the 6-digit code to complete sign in.
          </p>

          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-border bg-white text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || code.join("").length !== 6}
            className="w-full py-2.5 rounded-xl bg-secondary text-white font-medium text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mb-4"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <div className="text-sm text-primary/50 space-y-2">
            {!canResend ? (
              <p>Code expires in <span className="font-mono font-medium text-primary">{formatTime(countdown)}</span></p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-secondary hover:underline font-medium disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
