import type { Metadata } from "next";
import { Inter, Noto_Sans_Balinese } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Integrating the Balinese script
const notoBalinese = Noto_Sans_Balinese({ 
  weight: "400",
  subsets: ["balinese"],
  variable: "--font-balinese"
});

export const metadata: Metadata = {
  title: "Banjar Adat Sental Kawan",
  description: "Digital Administration platform for Banjar Adat Sental Kawan, Nusa Penida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoBalinese.variable} font-sans antialiased p-6`}>
        {children}
      </body>
    </html>
  );
}