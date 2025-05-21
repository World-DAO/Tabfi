import type { Metadata } from "next";
import "./globals.css";
import Navbar from '@/components/Navbar';
import { SuiProvider } from '../components/WalletProvider';
import '@mysten/dapp-kit/dist/index.css';

export const metadata: Metadata = {
  title: "Tabfi",
  description: "Demo of Tabfi for SuiOverflow",
  icons: {
    icon: "/images/logo2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SuiProvider>
          <Navbar />
          <main className="container mx-auto p-4 mt-22 ">
            {children}
          </main>
        </SuiProvider>
      </body>
    </html>
  );
}
