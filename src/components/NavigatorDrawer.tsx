"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

/* Drawer: solid pastel, left-side only, sits below header, no pill "x" */
export default function NavigatorDrawer() {
  const [open, setOpen] = useState(false);

  // Approx header height: adjust if you tweak header padding later
  const HEADER_PX = 60; // matches sticky header height

  return (
    <div className="relative">
      {/* Small circular trigger */}
      <button
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-200 hover:bg-rose-300 border border-rose-100 shadow-sm"
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
            {/* Backdrop (click to close) */}
            <motion.div
              className="fixed inset-0 bg-black/30 z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Left drawer: below header only, solid background */}
            <motion.div
              className="fixed left-0 z-[9999] bg-[#FFF5F3] shadow-2xl border-r border-rose-100 flex flex-col"
              style={{
                top: HEADER_PX,
                height: `calc(100% - ${HEADER_PX}px)`,
                width: "70%",
                maxWidth: "18rem",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              {/* Close control: span (not button) so global button CSS won't style it */}
              <div className="flex justify-end p-3">
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(false)}
                  className="text-rose-500 hover:text-rose-700 text-sm cursor-pointer select-none"
                >
                  x
                </span>
              </div>

              {/* Links */}
              <nav className="flex flex-col space-y-3 px-5 pb-6">
                <Link
                  href={"/dashboard" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-200/40 transition"
                >
                  Dashboard
                </Link>
                <Link
                  href={"/phase/overview" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-200/40 transition"
                >
                  Phase Overview
                </Link>
                <Link
                  href={"/nutrition" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-200/40 transition"
                >
                  Nutrition
                </Link>
                <Link
                  href={"/movement" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-200/40 transition"
                >
                  Movement
                </Link>
                <Link
                  href={"/journal" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-200/40 transition"
                >
                  Journal
                </Link>
                <Link
                  href={"/settings" as Route}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 rounded-md text-rose-900 text-lg hover:bg-rose-200/40 transition"
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
