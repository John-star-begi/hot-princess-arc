"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export default function NavigatorDrawer() {
  const [open, setOpen] = useState(false);

  const links: { name: string; href: string }[] = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Phases Overview", href: "/phase/menstrual" },
    { name: "Nutrition", href: "/phase/menstrual#nutrition" },
    { name: "Movement", href: "/phase/menstrual#movement" },
    { name: "Journal", href: "/journal" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Small circular menu button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-200/70 hover:bg-rose-300/80 border border-rose-100 shadow-sm backdrop-blur-sm text-rose-700 transition"
      >
        <MoreHorizontal size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              className="fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-rose-50 to-pink-100 shadow-2xl z-50 p-6 flex flex-col"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-semibold text-lg text-rose-900">Navigator</h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="text-rose-700 hover:text-rose-900"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 px-3 rounded-lg text-rose-900 hover:bg-white/70 hover:text-rose-800 transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Footer spacing for iOS safe area */}
              <div className="mt-auto pt-6 text-xs text-rose-700 opacity-60">
                Hot Princess Arc © {new Date().getFullYear()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

