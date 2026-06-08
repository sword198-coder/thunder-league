import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Login — Thunder League",
  description: "Sign in to your Thunder League account to track your tournament progress.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
