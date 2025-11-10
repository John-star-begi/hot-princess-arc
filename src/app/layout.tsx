"use client";

import "../styles/globals.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AuthProvider } from "@/components/AuthProvider";
import NavigatorDrawer from "@/components/NavigatorDrawer";

export const metadata = {
  title: "Hot Princess Arc",
  description: "Private cycle wellness app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide header on public routes
  const hideHeader = [
    "/login",
    "/signup",
    "/reset-password",
    "/update-password",
    "/verify-email",
  ].includes(pathname);

  // Scroll hide/show animation
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      setVisible(current < lastScroll || current < 10);
      lastScroll = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <html lang="en">
      <body className="text-rose-900 antialiased bg-gradient-to-b from-[#FFF6E5] to-[#FFECEF] min-h-screen">
        <AuthProvider>
          {/* Header */}
          {!hideHeader && (
            <motion.header
              animate={{ y: visible ? 0 : -80 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 left-0 w-full z-[1000] backdrop-blur-md bg-rose-50/80 border-b border-rose-100 shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-3">
                {/* Left: Navigator */}
                <NavigatorDrawer />

                {/* Center: Title */}
                <h1 className="font-serif text-lg sm:text-xl text-rose-900 tracking-wide select-none flex items-center gap-1">
                  <span role="img" aria-label="crown">
                    👑
                  </span>
                  Hot Princess Arc
                </h1>

                {/* Right: spacer for balance */}
                <div className="w-9 h-9" />
              </div>
            </motion.header>
          )}

          {/* Main */}
          <main
            className={`section pt-${hideHeader ? "0" : "20"} sm:pt-${
              hideHeader ? "0" : "24"
            } px-4 pb-8`}
          >
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
