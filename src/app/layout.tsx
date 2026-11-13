import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F4C5C",
};

export const metadata: Metadata = {
  title: "ZiL — Komşunun Ziline Bas",
  description:
    "Paylaş, Tanış, Mahalleni Yaşat. Ring Your Neighbor's Bell — Give, Share, Connect Locally.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZiL",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={plusJakarta.variable}>
      <body className="min-h-dvh bg-[#EFECE6] font-sans text-[#1F2937] antialiased">
        {children}
      </body>
    </html>
  );
}
