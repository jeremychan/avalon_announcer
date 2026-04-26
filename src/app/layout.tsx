import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Avalon Narrator',
  description: 'A mobile-first webapp for narrating The Resistance: Avalon using native text-to-speech.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body>{children}</body>
    </html>
  );
}
