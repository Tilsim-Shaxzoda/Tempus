import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppDataProvider } from '@/hooks/useAppData';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Ayriliq Vaqti',
  description: 'Ayriliq vaqti — countdown, kontaktlar va tug\'ilgan kunlar'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">
        <AppDataProvider>{children}</AppDataProvider>
      </body>
    </html>
  );
}
