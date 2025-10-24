import '../styles/globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'Hot Princess Arc',
  description: 'Private cycle wellness app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Ensures the site is fully responsive on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#F9C6B0" />
      </head>
      <body className="bg-princess-cream text-gray-800 antialiased">
        {/* Wraps everything in the authentication context */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
