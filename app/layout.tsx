import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrocTrade - Premium Crypto Trading Platform",
  description: "Trade cryptocurrencies with leverage. Bitcoin, Ethereum, Solana and more.",
  keywords: ["crypto", "trading", "bitcoin", "ethereum", "solana", "leverage"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#0a0a0f] text-white`}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
