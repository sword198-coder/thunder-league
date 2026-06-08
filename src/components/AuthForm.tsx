"use client";

import { useState } from "react";
import Link from "next/link";
import { logger } from "@/lib/logger";
import { signUp, signIn } from "@/lib/services/authService";
import type { AuthFormProps } from "@/types";

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username && !isLogin) {
      setError("Username is required");
      return;
    }
    if (!formData.email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    logger.info(`${isLogin ? "Login" : "Register"} attempt`, { email: formData.email });

    try {
      if (isLogin) {
        await signIn(formData.email);
      } else {
        await signUp(formData.email, formData.username);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      logger.error(`${isLogin ? "Login" : "Registration"} failed`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-primary/60 mt-1">
              {isLogin ? "Sign in to your Thunder League account" : "Join the Thunder League championship"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-primary mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all text-sm"
                  placeholder="Your in-game name"
                  autoComplete="username"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all text-sm"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-secondary text-white font-medium text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>

          <p className="text-center text-sm text-primary/50 mt-6">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-secondary hover:underline font-medium">
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-secondary hover:underline font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
