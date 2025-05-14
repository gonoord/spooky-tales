import type { Metadata } from 'next';
import { medievalSharp, geistSans, geistMono } from '@/lib/fonts';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Spooky Tales Prompt',
  description: 'Generate spooky story prompts from creepy cards.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`${medievalSharp.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
