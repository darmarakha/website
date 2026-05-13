import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin", "japanese"],
  weight: ["400", "700", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://gemu-nihongo.app"),
  title: {
    default: "Gemu Nihongo - JLPT N5 Practice",
    template: "%s | Gemu Nihongo",
  },
  description:
    "Platform belajar bahasa Jepang JLPT N5 dengan AI - Kaiwa (Percakapan) dan Choukai (Listening). 19 modul belajar interaktif.",
  keywords: ["JLPT N5", "Bahasa Jepang", "Kaiwa", "Choukai", "Japanese Learning", "Belajar Jepang"],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Gemu Nihongo",
    title: "Gemu Nihongo - JLPT N5 Practice",
    description:
      "Platform belajar bahasa Jepang JLPT N5 dengan AI - Kaiwa (Percakapan) dan Choukai (Listening). 19 modul belajar interaktif.",
  },
  twitter: {
    card: "summary",
    title: "Gemu Nihongo - JLPT N5 Practice",
    description:
      "Platform belajar bahasa Jepang JLPT N5 dengan AI - Kaiwa (Percakapan) dan Choukai (Listening).",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Gemu Nihongo",
              description:
                "Platform belajar bahasa Jepang JLPT N5 dengan AI - Kaiwa (Percakapan) dan Choukai (Listening)",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
