import '@/styles/globals.css';
import '@/styles/theme.css';
import { ReactQueryProvider } from '@/lib/react-query';
import { ToasterClient } from '@/components/ui/ToasterClient';

export const metadata = { title: 'Hot Princess Arc' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-princess-cream">
        <ReactQueryProvider>
          <div className="mx-auto max-w-md p-4">{children}</div>
          <ToasterClient />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
