'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDots, Megaphone, CurrencyCircleDollar, UsersThree,
} from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import type { BanjarEvent } from '@/lib/types'
import KalenderBali from '@/components/KalenderBali'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(n)

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

const TYPE_COLOR: Record<string, string> = {
  upacara: 'badge-upacara', ngaben: 'badge-ngaben',
  seni: 'badge-seni',       rapat:  'badge-rapat',
}
const TYPE_LABEL: Record<string, string> = {
  upacara: 'Upacara', ngaben: 'Ngaben', seni: 'Kesenian', rapat: 'Rapat',
}

interface FinanceRow { type: string; amount: number }

export default function HomePage() {
  const [stats, setStats] = useState({
    members: 0, events: 0, balance: 0, announcements: 0,
  })
  const [upcoming, setUpcoming] = useState<BanjarEvent[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    /* ── Wrap everything in try/catch/finally so loading ALWAYS ends ── */
    ;(async () => {
      try {
        const today = new Date().toISOString().split('T')[0]

        const [
          { count: memberCount },
          { data: upcomingEvents },
          { count: eventCount },
          { data: finances },
          { count: announcementCount },
        ] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*').gte('date', today).order('date').limit(3),
          supabase.from('events').select('*', { count: 'exact', head: true }).gte('date', today),
          supabase.from('finance').select('type, amount'),
          supabase.from('announcements').select('*', { count: 'exact', head: true }),
        ])

        const balance = (finances as FinanceRow[] ?? []).reduce(
          (sum: number, f: FinanceRow) =>
            sum + (f.type === 'pemasukan' ? f.amount : -f.amount),
          0,
        )

        setStats({
          members:       memberCount       ?? 0,
          events:        eventCount        ?? 0,
          balance,
          announcements: announcementCount ?? 0,
        })
        setUpcoming((upcomingEvents as BanjarEvent[]) ?? [])
      } catch (err) {
        console.error('Homepage data fetch error:', err)
        /* Stats stay at 0 — page still renders correctly */
      } finally {
        /* This ALWAYS runs, even if Promise.all throws */
        setLoading(false)
      }
    })()
  }, [])

  const STAT_CARDS = [
    {
      icon:  UsersThree,
      label: 'Total Krama',
      value: stats.members,
      unit:  'orang',
      bali:  'ᬓ᭄ᬭᬫ',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon:  CalendarDots,
      label: 'Kegiatan Mendatang',
      value: stats.events,
      unit:  'agenda',
      bali:  'ᬓᬕᬶᬬᬢᬦ᭄',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon:  CurrencyCircleDollar,
      label: 'Saldo Kas',
      value: fmt(stats.balance),
      unit:  '',
      bali:  'ᬲᬮ᭄ᬤᭀ',
      color: stats.balance >= 0
        ? 'text-emerald-600 bg-emerald-50'
        : 'text-red-500 bg-red-50',
    },
    {
      icon:  Megaphone,
      label: 'Pengumuman',
      value: stats.announcements,
      unit:  'info',
      bali:  'ᬧᬗᬸᬫᬸᬫᬦ᭄',
      color: 'text-violet-600 bg-violet-50',
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <span className="font-balinese text-5xl text-amber-400 animate-pulse">ᬒᬁ</span>
    </div>
  )

  return (
    <div className="space-y-8 fade-up">

      {/* ── Hero card ── */}
      <div className="glass-card text-center relative overflow-hidden">

        {/* ── Gate + Logo section ── */}
        <div className="relative flex items-end justify-center w-full" style={{ minHeight: 220 }}>

          {/* Subtle background glow behind gates (Keeps full width) */}
          <div className="absolute inset-0 bg-linear-to-b from-green-50/60 via-amber-50/30 to-transparent pointer-events-none" />

          {/* ── NEW WRAPPER: Constrains the gates and logo to max-w-xl ── */}
          <div className="relative w-full max-w-xl flex items-end justify-center" style={{ minHeight: 220 }}>
            
            {/* Left gate */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bali-gate-left.png"
              alt="Candi bentar khas Bali di sisi kiri"
              aria-hidden="true"
              className="absolute left-0 bottom-0 w-auto select-none pointer-events-none"
              style={{ height: 210, objectFit: 'contain', objectPosition: 'bottom left' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />

            {/* Right gate */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bali-gate-right.png"
              alt="Candi bentar khas Bali di sisi kanan"
              aria-hidden="true"
              className="absolute right-0 bottom-0 w-auto select-none pointer-events-none"
              style={{ height: 210, objectFit: 'contain', objectPosition: 'bottom right' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />

            {/* Logo centered between the gates */}
            <div className="relative z-10 flex flex-col items-center pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo Banjar Adat Sental Kawan"
                className="object-contain drop-shadow-lg"
                style={{ width: 100, height: 100 }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          </div>
        </div>

        {/* ── Text content ── */}
        <div className="px-6 sm:px-12 pb-10 pt-5">
          <h1 className="font-inter font-bold text-slate-800 text-3xl sm:text-4xl mb-2">
            Banjar Adat Sental Kawan
          </h1>
          <div className="font-balinese text-amber-500 text-sm mb-5" style={{ opacity: 0.85 }}>
            ᬩᬜ᭄ᬚᬃ ᬆᬤᬢ᭄ ᬲᭂᬦ᭄ᬢᬮ᭄ ᬓᬯᬦ᭄
          </div>
          <p className="font-garamond text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
            Organisasi adat di dalam naungan Desa Adat Ped yang berperan menjaga
            keharmonisan, melaksanakan upacara adat Hindu, dan memberikan dukungan
            kepada seluruh krama Banjar Adat Sental Kawan.
          </p>
          <p className="font-garamond text-slate-400 text-sm mt-4">
            Desa Adat Ped · Kecamatan Nusa Penida · Kabupaten Klungkung · Provinsi Bali
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="glass-card p-5 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}>
              <s.icon size={20} weight="fill" />
            </div>
            <div className="font-balinese text-amber-600 text-xs mb-1" style={{ opacity: 0.75 }}>
              {s.bali}
            </div>
            <div className="font-inter font-bold text-slate-800 text-xl mb-0.5 break-all">
              {s.value}
            </div>
            <div className="font-garamond text-slate-600 text-sm">
              {s.label}{s.unit ? ` (${s.unit})` : ''}
            </div>
          </div>
        ))}
      </div>

      {/* ── Upcoming events ── */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-inter font-bold text-slate-800 text-lg">
              Kegiatan Mendatang
            </h2>
            <Link
              href="/events"
              className="font-inter text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {upcoming.map((e) => (
              <div key={e.id} className="glass-card p-5">
                <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                  <span className={`text-xs font-inter font-semibold px-2.5 py-1 rounded-full ${TYPE_COLOR[e.type] ?? 'badge-rapat'}`}>
                    {TYPE_LABEL[e.type] ?? e.type}
                  </span>
                  <span className="font-garamond text-slate-400 text-sm">
                    {fmtDate(e.date)}
                  </span>
                </div>
                {e.balinese && (
                  <div className="font-balinese text-amber-600 text-xs mb-1" style={{ opacity: 0.8 }}>
                    {e.balinese}
                  </div>
                )}
                <h3 className="font-inter font-semibold text-slate-800 text-sm mb-2 leading-snug">
                  {e.title}
                </h3>
                <p className="font-garamond text-slate-600 text-sm leading-relaxed line-clamp-2">
                  {e.description}
                </p>
                <p className="font-garamond text-slate-500 text-xs mt-2">📍 {e.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Green divider ── */}
      <div className="h-px bg-linear-to-r from-transparent via-green-300 to-transparent" />

      {/* ── Kalender Bali ── */}
      <KalenderBali />

    </div>
  )
}