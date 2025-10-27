"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export default function NavigatorDrawer() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Today", href: "/dashboard" },
    { name: "Phase Overview", href: "/phase/menstrual" },
    { name: "Nutrition", href: "/phase/menstrual#nutrition" },
    { name: "Movement", href: "/phase/menstrual#movement" },
    { name: "Mindset", href: "/phase/menstrual#mindset" },
    { name: "Journal", href: "/journal" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Top-left three-dot button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-700 rounded-full hover:bg-pink-100"
      >
        <MoreHorizontal size={22} />
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

            {/* Drawer */}
            <motion.div
              className="fixed top-0 left-0 w-64 h-full bg-pink-50 shadow-2xl z-50 p-6 flex flex-col"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 280, damping: 25 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-semibold text-lg text-gray-800">Navigator</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-3">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-pink-100"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
