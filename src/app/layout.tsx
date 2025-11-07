import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import NavigatorDrawer from "@/components/NavigatorDrawer";
import Link from "next/link";

export const metadata = {
  title: "Hot Princess Arc",
  description: "Private cycle wellness app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-princess-cream text-gray-800 antialiased">
        <AuthProvider>
          {/* Top bar is STICKY not fixed, so it does not cover content and it releases space while scrolling */}
          <header className="sticky top-0 z-30 bg-pink-100/90 backdrop-blur-md border-b border-pink-200">
            <div className="flex items-center justify-between px-3 py-2 max-w-screen-sm mx-auto">
              <NavigatorDrawer />

              <Link href="/dashboard" className="shrink-0">
                <h1 className="text-base font-semibold tracking-tight text-gray-800">
                  👑 Hot Princess Arc
                </h1>
              </Link>

              {/* Right spacer for symmetry */}
              <div className="w-6" />
            </div>
          </header>

          {/* Constrain width for comfy reading on mobile and tablets */}
          <main className="mx-auto max-w-screen-sm w-full">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
