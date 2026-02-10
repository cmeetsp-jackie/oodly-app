import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cirql - 애정템이 모이는 곳",
  description: "친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에. 옷장의 아끼는 옷부터 애정하는 액자까지.",
  keywords: ["애정템", "중고거래", "패션", "옷장", "커뮤니티", "cirql"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cirql",
  },
  openGraph: {
    title: "Cirql - 애정템이 모이는 곳",
    description: "친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에.",
    url: "https://cirql.dev",
    siteName: "Cirql",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://cirql.dev/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Cirql - 애정템이 모이는 곳",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cirql - 애정템이 모이는 곳",
    description: "친구의 애정템, 셀럽의 애정템 그리고 나의 애정템이 한곳에.",
    images: ["https://cirql.dev/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
