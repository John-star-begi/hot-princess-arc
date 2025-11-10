import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header"; // new client header

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
      <body className="text-rose-900 antialiased bg-gradient-to-b from-[#FFF6E5] to-[#FFECEF] min-h-screen">
        <AuthProvider>
          <Header />
          <main className="section px-4 pb-8 pt-20 sm:pt-24">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

