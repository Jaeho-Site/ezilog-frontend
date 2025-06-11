import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Lora } from "next/font/google";
import { ThemeProvider } from 'next-themes';
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: '%s | EziLog',
    default: 'EziLog - 개발 블로그',
  },
  description: "프론트엔드, 백엔드, 풀스택 개발 경험과 지식을 공유하는 기술 블로그입니다.",
  keywords: ["개발 블로그", "프론트엔드", "백엔드", "풀스택", "Next.js", "React", "TypeScript"],
  authors: [{ name: "EziLog" }],
  creator: "EziLog",
  publisher: "EziLog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') ? 'https://' + process.env.NEXT_PUBLIC_SITE_URL : process.env.NEXT_PUBLIC_SITE_URL) || 'https://yourdomain.com'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') ? 'https://' + process.env.NEXT_PUBLIC_SITE_URL : process.env.NEXT_PUBLIC_SITE_URL) || 'https://yourdomain.com',
    title: 'EziLog - 개발 블로그',
    description: "프론트엔드, 백엔드, 풀스택 개발 경험과 지식을 공유하는 기술 블로그입니다.",
    siteName: 'EziLog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EziLog - 개발 블로그',
    description: "프론트엔드, 백엔드, 풀스택 개발 경험과 지식을 공유하는 기술 블로그입니다.",
  },
  alternates: {
    canonical: (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') ? 'https://' + process.env.NEXT_PUBLIC_SITE_URL : process.env.NEXT_PUBLIC_SITE_URL) || 'https://yourdomain.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${lora.variable} 
        font-sans antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
