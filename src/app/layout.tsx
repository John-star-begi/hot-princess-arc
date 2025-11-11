import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hot Princess Arc",
  description: "Private cycle wellness app",
  manifest: "/manifest.webmanifest",
  themeColor: "#FFD1C2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-rose-900 antialiased bg-gradient-to-b from-[#FFF6E5] to-[#FFECEF] min-h-screen">
        <AuthProvider>
          <Header />
          <main className="section px-4 pb-8 pt-20 sm:pt-24">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
