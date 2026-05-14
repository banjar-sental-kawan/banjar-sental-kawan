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

          {/* ── Rich ambient background ── */}
          <div className="fixed inset-0 -z-10" aria-hidden="true"
            style={{ background: "linear-gradient(135deg, #fdf6e3 0%, #fef9f0 30%, #f0f4ff 65%, #f5f0ff 100%)" }}>
            {/* Top-left warm amber glow */}
            <div className="absolute -top-20 -left-20 w-150 h-150 rounded-full opacity-60"
              style={{ background: "radial-gradient(circle, #fde68a 0%, #fbbf24 30%, transparent 70%)", filter: "blur(60px)" }} />
            {/* Bottom-right cool indigo glow */}
            <div className="absolute -bottom-20 -right-20 w-140 h-140nded-full opacity-40"
              style={{ background: "radial-gradient(circle, #c7d2fe 0%, #818cf8 30%, transparent 70%)", filter: "blur(60px)" }} />
            {/* Center emerald accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 rounded-full opacity-25"
              style={{ background: "radial-gradient(circle, #6ee7b7 0%, #10b981 40%, transparent 70%)", filter: "blur(70px)" }} />
            {/* Top-right terracotta */}
            <div className="absolute top-10 right-10 w-[320px] h-80 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, #fca5a5 0%, #f87171 40%, transparent 70%)", filter: "blur(55px)" }} />
          </div>

          {/* ── Sticky header ── */}
          <Header />

          {/* ── Page content ── */}
          <main className="max-w-5xl mx-auto px-5 py-8 pb-24">
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="text-center pb-8">
            <span className="font-balinese text-slate-300 text-base">ᬒᬁ ᬰᬦ᭄ᬢᬶ ᬰᬦ᭄ᬢᬶ ᬰᬦ᭄ᬢᬶ</span>
          </footer>

        </AdminProvider>
      </body>
    </html>
  )
}