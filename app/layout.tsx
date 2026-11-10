import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Dental Hub Family Dental Hospital | Advanced Dental Care",
  description: "Comprehensive, gentle family dental care designed around your comfort with modern technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-warm-beige text-deep-navy">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
