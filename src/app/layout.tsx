import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import OnboardingModal from "@/components/onboarding-modal";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Split the G",
  description: "Share your perfectly poured pints",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-stout text-cream flex flex-col">
        {children}
        <OnboardingModal />
      </body>
    </html>
  );
}
