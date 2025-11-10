import "../styles/globals.css";
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
  return (
    <html lang="en">
      <body className="text-rose-900 antialiased bg-gradient-to-b from-[#FFF6E5] to-[#FFECEF]">
        <AuthProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-white/40">
            <div className="section flex items-center justify-between py-3 px-3">
              {/* Left: Menu */}
              <NavigatorDrawer />

              {/* Center: Title */}
              <h1 className="text-base sm:text-lg font-semibold text-rose-900 flex items-center gap-1">
                <span role="img" aria-label="crown">
                  👑
                </span>
                Hot Princess Arc
              </h1>

              {/* Spacer for symmetry */}
              <div className="w-9 h-9" />
            </div>
          </header>

          {/* Main */}
          <main className="section py-6 sm:py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
