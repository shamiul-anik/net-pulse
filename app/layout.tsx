import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "NetPulse | Real-time Network Diagnostics & Speed Test",
  description: "Professional real-time network diagnostics, speed testing, and connection intelligence. Verify your download, upload, and latency with fiber-grade precision.",
  keywords: ["speed test", "network diagnostics", "ping", "jitter", "ip info", "isp lookup", "real-time speed test"],
  authors: [{ name: "Shamiul Islam" }],
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "NetPulse | Premium Network Intelligence",
    description: "Professional real-time network diagnostics and speed intelligence.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NetPulse | Premium Network Intelligence",
    description: "Professional real-time network diagnostics and speed intelligence.",
  },
};

export const viewport: Viewport = {
  themeColor: "#38bdf8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
