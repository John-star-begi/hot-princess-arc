'use client';

import { useEffect, useState } from 'react';

export function Toaster({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-princess-peach text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}
