import '../styles/globals.css';

export const metadata = {
  title: 'Hot Princess Arc',
  description: 'Private cycle wellness app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
