import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlowUp - Collect & Display Customer Reviews",
  description: "The easiest way for small businesses to collect, manage, and showcase customer testimonials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-white text-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
