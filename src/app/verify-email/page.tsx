"use client";

import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-primary mb-2">Check Your Email</h1>
          <p className="text-sm text-primary/60 mb-6">
            We sent a one-time verification code to your email. Enter the code to complete sign in.
          </p>

          <div className="space-y-2 text-sm">
            <p className="text-primary/50">
              <Link href="/login" className="text-secondary hover:underline font-medium">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
