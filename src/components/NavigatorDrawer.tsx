"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export default function NavigatorDrawer() {
  const [open, setOpen] = useState(false);

  const links: { name: string; href: string }[] = [
    { name: "Today", href: "/dashboard" },
    { name: "Journal", href: "/journal" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-gray-700 rounded-full hover:bg-pink-100 active:scale-[.98]"
        aria-label="Open menu"
      >
        <MoreHorizontal size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-[84%] max-w-[360px] bg-white rounded-r-3xl border-r border-pink-200 shadow-xl z-50 p-5"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <button
                  className="text-gray-500 text-xl -mr-2"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>

              <nav className="mt-4 grid gap-2">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-2xl px-4 py-3 bg-pink-50 border border-pink-200 hover:bg-pink-100 active:scale-[.99]"
                    onClick={() => setOpen(false)}
                  >
                    {l.name}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
