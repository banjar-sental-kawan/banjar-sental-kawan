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

          {/* ── Ambient background blobs ── */}
          <div className="fixed inset-0 -z-10 bg-slate-50" aria-hidden="true">
            <div className="absolute top-0     left-0   w-120 h-120 rounded-full bg-amber-50  opacity-90 blur-3xl" />
            <div className="absolute bottom-0  right-0  w-110 h-110 rounded-full bg-indigo-50 opacity-80 blur-3xl" />
            <div className="absolute top-1/2   left-1/2 w-85 h-85 rounded-full bg-emerald-50 opacity-60 blur-3xl -translate-x-1/2 -translate-y-1/2" />
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
