import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = { title: "Clothing Shop" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} antialiased app-bg`}>
        <ToastProvider>
          <Nav />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
