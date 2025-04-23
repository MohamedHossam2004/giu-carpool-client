'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApolloProvider } from "@apollo/client";
import { userClient } from "@/lib/apollo-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}> <div className="flex h-screen">>
        <ApolloProvider client={userClient}>
          <Sidebar /    <AuthProvider>
              <main className="flex-1 overflow-auto">{children}</main>
        </div>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  )
}
