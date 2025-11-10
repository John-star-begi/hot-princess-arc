"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

/* ✅ Modern feminine drawer — full-height left panel with soft colors.
   ✅ Vercel-safe: typed routes handled with `as Route`.
*/

export default function NavigatorDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Small circular menu button */}
      <button
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-200/70 hover:bg-rose-300 border border-rose-100 shadow-sm backdrop-blur-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-rose-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12M6 6h12M6 18h12" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — closes drawer when clicked */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Left-side sliding drawer */}
            <motion.div
              className="fixed top-0 left-0 h-full w-[70%] max-w-xs bg-[#FFF9F8] shadow-xl border-r border-rose-100 z-50 flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="text-rose-500 hover:text-rose-700 text-base"
                >
                  x
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col space-y-2 px-6 pb-6">
                <Link
                  href={"/dashboard" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-100 transition"
                >
                  Dashboard
                </Link>

                <Link
                  href={"/phase/overview" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-100 transition"
                >
                  Phase Overview
                </Link>

                <Link
                  href={"/nutrition" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-100 transition"
                >
                  Nutrition
                </Link>

                <Link
                  href={"/movement" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-100 transition"
                >
                  Movement
                </Link>

                <Link
                  href={"/journal" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-100 transition"
                >
                  Journal
                </Link>

                <Link
                  href={"/settings" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-100 transition"
                >
                  Settings
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
