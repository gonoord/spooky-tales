import { MedievalSharp as FontMedievalSharp } from 'next/font/google';

export const medievalSharp = FontMedievalSharp({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-medieval-sharp',
});

// Fallback for Geist Sans as it's not a Google Font
// This provides the .variable property expected by layout.tsx
// The actual font stack will be defined in globals.css
export const geistSans = {
  variable: '--font-geist-sans',
};

// Fallback for Geist Mono
export const geistMono = {
  variable: '--font-geist-mono',
};
