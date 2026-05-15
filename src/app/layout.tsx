import type { Metadata } from 'next'
import { Inter, Noto_Sans_Balinese, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { AdminProvider } from '@/context/AdminContext'
import Header from '@/components/Header'

/* ── Google Fonts via next/font (auto-optimised, no layout shift) ── */
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const notoBalinese = Noto_Sans_Balinese({
  weight:   '400',
  subsets:  ['balinese'],
  variable: '--font-balinese',
  display:  'swap',
})

const cormorant = Cormorant_Garamond({
  weight:   ['300', '400', '600'],
  style:    ['normal', 'italic'],
  subsets:  ['latin'],
  variable: '--font-cormorant',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'Banjar Adat Sental Kawan',
  description: 'Platform administrasi digital Banjar Adat Sental Kawan, Desa Adat Ped, Nusa Penida, Klungkung, Bali.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${notoBalinese.variable} ${cormorant.variable} antialiased`}>
        <AdminProvider>

          {/* ── Rich ambient background with #5ebc67 green ── */}
          <div className="fixed inset-0 -z-10" aria-hidden="true"
            style={{ background: "linear-gradient(135deg, #f0faf1 0%, #fefce8 35%, #f0f4ff 70%, #faf5ff 100%)" }}>
            {/* Top-left green glow */}
            <div className="absolute -top-24 -left-24 w-145 h-145 rounded-full opacity-55"
              style={{ background: "radial-gradient(circle, #5ebc67 0%, #86efac 40%, transparent 70%)", filter: "blur(65px)" }} />
            {/* Top-right amber glow */}
            <div className="absolute -top-10 right-0 w-105 h-105 rounded-full opacity-45"
              style={{ background: "radial-gradient(circle, #fbbf24 0%, #fde68a 45%, transparent 70%)", filter: "blur(60px)" }} />
            {/* Bottom-right indigo glow */}
            <div className="absolute -bottom-20 -right-20 w-130 h-130 rounded-full opacity-35"
              style={{ background: "radial-gradient(circle, #818cf8 0%, #c7d2fe 45%, transparent 70%)", filter: "blur(65px)" }} />
            {/* Bottom-left green-teal glow */}
            <div className="absolute bottom-10 left-10 w-95 h-95 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, #5ebc67 0%, #a7f3d0 50%, transparent 70%)", filter: "blur(60px)" }} />
            {/* Center soft warm glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-90 h-90 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #fca5a5 0%, #fde68a 50%, transparent 70%)", filter: "blur(70px)" }} />
          </div>

          {/* ── Sticky header ── */}
          <Header />

          {/* ── Page content ── */}
          <main className="max-w-5xl mx-auto px-5 py-8 pb-24">
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="text-center pb-8">
            <span className="font-balinese text-slate-300 text-base">ᬒᬁ ᬰᬦ᭄ᬢᬶ ᬰᬦ᭄ᬢᬶ ᬰᬦ᭄ᬢᬶ</span><br />
            <span className="font-balinese text-slate-300 text-base">ᬓᬓᬃᬃᬬᬦᬶᬦ᭄​ ᬳᭀᬮᬶᬄ​ ᬳᬶ​ ᬕᭂᬤᬾ​ ᬲᬸᬢ​ ᬧᬶᬦᬢᬶᬄ</span>
          </footer>

        </AdminProvider>
      </body>
    </html>
  )
}