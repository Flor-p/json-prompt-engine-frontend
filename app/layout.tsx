import './globals.css';
import type { Metadata } from 'next';
import { Inter, Bungee } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const bungee = Bungee({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bungee',
});

export const metadata: Metadata = {
  title: 'JSON Prompt Engine',
  description: 'Schema-driven prompt builder for AI models',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${bungee.variable}`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
