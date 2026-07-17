import type { Metadata } from "next";
import "@/env";
import "./globals.css";

const title = "StableLinq";
const description =
  "iMessage, RCS, and SMS via Linq. Pay with USDC. No API keys. No accounts.";
const prodUrl = "https://stablelinq.dev";
const url =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : prodUrl;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(url),
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
