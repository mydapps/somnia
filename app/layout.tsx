import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dapps.co - Somnia community network",
  description: "Build Your Community Economy on Somnia",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
  },
};

import UsernameSetup from "@/components/UsernameSetup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <UsernameSetup />
          {children}
        </Providers>
      </body>
    </html>
  );
}
