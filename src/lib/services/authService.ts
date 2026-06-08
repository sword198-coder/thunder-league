import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

export async function signIn(email: string) {
  const supabase = createBrowserClient();

  logger.info("authService: signIn attempt", { email });

  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    console.error("FULL SUPABASE ERROR (signIn):", error);
    logger.error("authService: signIn failed", error);
    throw new Error(error.message || "Failed to send verification code");
  }

  logger.info("authService: signIn success");

  sessionStorage.setItem("pending_verification_email", email);

  logger.info("authService: OTP sent, redirecting to verification", { email });
  window.location.href = "/verify-login";
}

export async function signUp(email: string, username: string) {
  const supabase = createBrowserClient();

  logger.info("authService: signUp attempt", { email, username });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: { username },
    },
  });

  if (error) {
    console.error("FULL SUPABASE ERROR (signUp):", error);
    logger.error("authService: signUp failed", error);
    throw new Error(error.message || "Failed to send verification code");
  }

  logger.info("authService: signUp success");

  sessionStorage.setItem("pending_verification_email", email);

  logger.info("authService: OTP sent for signup, redirecting to verification", { email });
  window.location.href = "/verify-login";
}

export async function verifyOtp(email: string, token: string) {
  const supabase = createBrowserClient();

  logger.info("authService: verifyOtp attempt", { email, tokenLength: token.length });

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("FULL SUPABASE ERROR (verifyOtp):", error);
    logger.error("authService: verifyOtp failed", error);
    throw new Error(error.message || "Verification failed");
  }

  logger.info("authService: OTP verified, session created", { email, session: !!data.session });
}

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("FULL SUPABASE ERROR (signOut):", error);
    logger.error("authService: signOut failed", error);
    throw new Error(error.message);
  }
  logger.info("authService: signOut success");
}

export async function getCurrentSession() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("FULL SUPABASE ERROR (getSession):", error);
    logger.error("authService: getSession failed", error);
    return null;
  }
  return data.session;
}

export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("FULL SUPABASE ERROR (getCurrentUser):", error);
    logger.error("authService: getCurrentUser failed", error);
    return null;
  }
  return data.user;
}
