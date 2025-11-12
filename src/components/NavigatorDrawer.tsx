"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

export default function NavigatorDrawer() {
  const [open, setOpen] = useState(false);

  const DrawerContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[99998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Solid drawer panel */}
          <motion.div
            className="fixed top-0 left-0 h-full w-[80%] max-w-xs z-[99999] shadow-2xl border-r border-rose-100 flex flex-col"
            style={{
              backgroundColor: "#fff7f5",
              WebkitBackdropFilter: "none",
              backdropFilter: "none",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-rose-500 hover:text-rose-700 text-sm"
              >
                x
              </button>
            </div>

            <nav className="flex flex-col space-y-4 px-6 pb-6 text-rose-900">
              <Link
                href={"/dashboard" as Route}
                onClick={() => setOpen(false)}
                className="text-lg hover:bg-rose-200/40 px-2 py-2 rounded-md transition"
              >
                Dashboard
              </Link>

              <Link
                href={"/phase-overview" as Route}
                onClick={() => setOpen(false)}
                className="text-lg hover:bg-rose-200/40 px-2 py-2 rounded-md transition"
              >
                Phase Overview
              </Link>

              <Link
                href={"/nutrition" as Route}
                onClick={() => setOpen(false)}
                className="text-lg hover:bg-rose-200/40 px-2 py-2 rounded-md transition"
              >
                Nutrition
              </Link>

              <Link
                href={"/movement" as Route}
                onClick={() => setOpen(false)}
                className="text-lg hover:bg-rose-200/40 px-2 py-2 rounded-md transition"
              >
                Movement
              </Link>

              <Link
                href={"/journal" as Route}
                onClick={() => setOpen(false)}
                className="text-lg hover:bg-rose-200/40 px-2 py-2 rounded-md transition"
              >
                Journal
              </Link>

              <Link
                href={"/settings" as Route}
                onClick={() => setOpen(false)}
                className="text-lg hover:bg-rose-200/40 px-2 py-2 rounded-md transition"
              >
                Settings
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Menu button (always visible) */}
      <div className="relative z-[10000]">
        <button
          aria-label="Open navigation menu"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-200 hover:bg-rose-300 border border-rose-100 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-rose-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12M6 6h12M6 18h12" />
          </svg>
        </button>
      </div>

      {/* Render drawer in portal */}
      {typeof window !== "undefined" && createPortal(DrawerContent, document.body)}
    </>
  );
}
