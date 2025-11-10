"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NavigatorDrawer from "@/components/NavigatorDrawer";

export default function Header() {
  const pathname = usePathname();
  const hideHeader = [
    "/login",
    "/signup",
    "/reset-password",
    "/update-password",
    "/verify-email",
  ].includes(pathname);

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

  if (hideHeader) return null;

  return (
    <motion.header
      animate={{ y: visible ? 0 : -80 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-[1000] backdrop-blur-md bg-rose-50/80 border-b border-rose-100 shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <NavigatorDrawer />
        <h1 className="font-serif text-lg sm:text-xl text-rose-900 tracking-wide select-none flex items-center gap-1">
          <span role="img" aria-label="crown">
            👑
          </span>
          Hot Princess Arc
        </h1>
        <div className="w-9 h-9" />
      </div>
    </motion.header>
  );
}
