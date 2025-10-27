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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#F9C6B0" />
      </head>

      <body className="bg-princess-cream text-gray-800 antialiased">
        <AuthProvider>
          {/* ---- Fixed top header ---- */}
          <header className="fixed top-0 left-0 right-0 z-30 bg-pink-100/90 backdrop-blur-md border-b border-pink-200">
            <div className="flex items-center justify-between px-4 py-3">
              {/* Three-dot navigator button */}
              <NavigatorDrawer />

              {/* App title */}
              <h1 className="text-lg font-semibold text-gray-800">
                Hot Princess Arc
              </h1>

              {/* Right spacer for symmetry */}
              <div className="w-6" />
            </div>
          </header>

          {/* ---- Main page area ---- */}
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
