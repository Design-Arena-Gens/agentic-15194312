import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Web Design Lead Gen Agent',
  description: 'AI-powered conversational agent to qualify and capture web design leads.',
  metadataBase: new URL('https://agentic-15194312.vercel.app'),
  openGraph: {
    title: 'Web Design Lead Gen Agent',
    description: 'Qualify and capture web design leads via a smart conversation.',
    url: 'https://agentic-15194312.vercel.app',
    siteName: 'Web Design Lead Gen Agent',
    type: 'website',
  },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container mx-auto px-4 py-12">{children}</main>
      </body>
    </html>
  );
}
