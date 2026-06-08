import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create Account — Thunder League",
  description: "Register for Thunder League and compete in the War Thunder esports championship.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
