"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

/* ✅ This version avoids type errors on routes that don't exist yet
   by marking them explicitly with "as Route".
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
            {/* Dim background overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Solid dropdown panel */}
            <motion.div
              className="absolute left-0 top-12 w-60 rounded-xl bg-[#FFF9F8] shadow-lg border border-rose-100 z-50"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Menu header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-rose-100">
                <h3 className="text-rose-800 font-semibold">Navigator</h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="text-rose-500 hover:text-rose-700 font-bold text-lg"
                >
                  ×
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col p-2">
                <Link
                  href={"/dashboard" as Route}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-rose-800 hover:bg-rose-100 text-left transition"
                >
                  Dashboard
                </Link>

                <Link
                  href={"/phase/overview" as Route}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-rose-800 hover:bg-rose-100 text-left transition"
                >
                  Phase Overview
                </Link>

                <Link
                  href={"/nutrition" as Route}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-rose-800 hover:bg-rose-100 text-left transition"
                >
                  Nutrition
                </Link>

                <Link
                  href={"/movement" as Route}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-rose-800 hover:bg-rose-100 text-left transition"
                >
                  Movement
                </Link>

                <Link
                  href={"/journal" as Route}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-rose-800 hover:bg-rose-100 text-left transition"
                >
                  Journal
                </Link>

                <Link
                  href={"/settings" as Route}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-rose-800 hover:bg-rose-100 text-left transition"
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
