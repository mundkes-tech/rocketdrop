// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { AuthProvider } from '@/app/contexts/AuthContext';
import ConditionalNavigation from '@/components/ConditionalNavigation';
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          {/* Header (conditional navigation) */}
          <ConditionalNavigation />

          {/* Main content fills available space */}
          <main className="flex-grow">{children}</main>

          {/* Sticky Footer at bottom */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
