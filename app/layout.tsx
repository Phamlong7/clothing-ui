import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
import ScrollPreserver from "@/components/ScrollPreserver";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = { title: "Clothing Shop" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} antialiased app-bg`}>
        <Suspense fallback={null}>
          <ScrollPreserver />
        </Suspense>
        <ToastProvider>
          <Nav />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
