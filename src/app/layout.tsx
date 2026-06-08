import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGate from "@/components/AuthGate";
import { SessionProvider } from "@/lib/supabase/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thunder League — Official War Thunder Esports Championship",
  description:
    "The premier War Thunder esports tournament platform. Compete in the Thunder League championship, climb the leaderboard, and earn your place among the elite.",
  openGraph: {
    title: "Thunder League — War Thunder Esports",
    description: "The official War Thunder esports championship platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-white`}>
        <SessionProvider>
          <AuthGate>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </div>
          </AuthGate>
        </SessionProvider>
      </body>
    </html>
  );
}
