import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import DarkModeWrapper from "@/components/DarkModeWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Perpustakaan SMK Taruna Bhakti - Sistem Manajemen Perpustakaan",
  description: "Sistem manajemen perpustakaan SMK Taruna Bhakti",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <DarkModeWrapper>
            {children}
          </DarkModeWrapper>
        </Providers>
      </body>
    </html>
  );
}
