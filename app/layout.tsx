import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumina Dental | Premium Dental Care",
  description: "Crafting confident smiles with precision. Experience modern dentistry designed around your comfort.",
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
      </body>
    </html>
  );
}
