'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, CalendarDots, ArrowRight } from '@phosphor-icons/react'

/* ═══════════════════════════════════════════════════════════════════
   DATA TABLES
═══════════════════════════════════════════════════════════════════ */
const SAPTA_WARA = ['Redite','Soma','Anggara','Buda','Wraspati','Sukra','Saniscara']
const PANCA_WARA = ['Umanis','Paing','Pon','Wage','Keliwon']
const TRI_WARA   = ['Pasah','Beteng','Kajeng']
const WUKU       = [
  'Sinta','Landep','Ukir','Kulantir','Tolu','Gumbreg',
  'Wariga','Warigadean','Julungwangi','Sungsang','Dungulan','Kuningan',
  'Langkir','Medangsia','Pujut','Pahang','Krulut','Merakih',
  'Tambir','Medangkungan','Matal','Uye','Menail','Prangbakat',
  'Bala','Ugu','Wayang','Klawu','Dukut','Watugunung',
]
const SASIH      = [
  'Kasa','Karo','Katiga','Kapat','Kalima','Kanem',
  'Kapitu','Kaulu','Kasanga','Kadasa','Jiyestha','Sadha',
]
const MONTH_ID   = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

/* ═══════════════════════════════════════════════════════════════════
   REFERENCE ANCHOR  — verified against kalenderbali.com
   May 16 2026 = Sukra Wage Kulantir, Tilem Jiyestha
═══════════════════════════════════════════════════════════════════ */
const REF        = new Date(2026, 4, 16)   // May 16, 2026
const REF_PW     = 3   // Wage   (Panca Wara index)
const REF_TW     = 0   // Pasah  (Tri Wara index)
const REF_WUKU   = 3   // Kulantir (Wuku index 0-based)
const REF_WUKU_D = 5   // Day within wuku: Sukra = day 5 (0=Redite)

const MS_DAY     = 86_400_000
const SYNODIC    = 29.53059

// Tilem reference for lunar phase
const TILEM_REF  = new Date(2026, 4, 16)   // Tilem Jiyestha
const TILEM_SASIH = 10  // Jiyestha = index 10

/* ═══════════════════════════════════════════════════════════════════
   CALCULATE BALI DATE
═══════════════════════════════════════════════════════════════════ */
interface BaliDay {
  sapta: number   // 0–6
  panca: number   // 0–4
  tri:   number   // 0–2
  wuku:  number   // 0–29
  sasih: number   // 0–11
  lunar: number   // 0=Tilem, 15=Purnama
  saka:  number
}

function calcBaliDay(date: Date): BaliDay {
  const diff = Math.round((date.getTime() - REF.getTime()) / MS_DAY)

  const panca    = ((REF_PW   + diff) % 5  + 5)  % 5
  const tri      = ((REF_TW   + diff) % 3  + 3)  % 3
  const sapta    = date.getDay()  // 0=Sunday=Redite ✓

  // Wuku: advance by diff days within 210-day cycle
  const wukuDay  = ((REF_WUKU * 7 + REF_WUKU_D + diff) % 210 + 210) % 210
  const wuku     = Math.floor(wukuDay / 7)

  // Lunar phase
  const phase    = ((date.getTime() - TILEM_REF.getTime()) / MS_DAY % SYNODIC + SYNODIC) % SYNODIC
  const lunar    = Math.round(phase) % 30

  // Sasih: advances every ~29.5 days from the tilem reference
  const months   = Math.floor((date.getTime() - TILEM_REF.getTime()) / MS_DAY / SYNODIC)
  const sasih    = ((TILEM_SASIH + 1 + months) % 12 + 12) % 12

  const saka     = date.getMonth() >= 2
    ? date.getFullYear() - 78
    : date.getFullYear() - 79

  return { sapta, panca, tri, wuku, sasih, lunar, saka }
}

/* ═══════════════════════════════════════════════════════════════════
   SACRED DAY DETECTION
═══════════════════════════════════════════════════════════════════ */
interface Sacred { name: string; color: string; emoji: string; major: boolean }

function getSacred(b: BaliDay): Sacred[] {
  const out: Sacred[] = []
  const K = b.panca === 4           // Keliwon
  const S = b.sapta === 6           // Saniscara
  const W = b.sapta === 3           // Buda (Wednesday)

  if (b.lunar === 15)
    out.push({ name: 'Purnama', color: 'bg-amber-100 text-amber-800 border-amber-300',   emoji: '🌕', major: true })
  if (b.lunar === 0)
    out.push({ name: 'Tilem',   color: 'bg-slate-100 text-slate-700 border-slate-300',   emoji: '🌑', major: true })

  if (b.tri === 2 && K)
    out.push({ name: 'Kajeng Keliwon', color: 'bg-orange-100 text-orange-800 border-orange-300', emoji: '🔥', major: true })
  else if (K)
    out.push({ name: 'Keliwon',        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  emoji: '✨', major: false })

  // Galungan — Buda Keliwon Dungulan (wuku 10)
  if (W && K && b.wuku === 10)
    out.push({ name: 'Galungan', color: 'bg-green-100 text-green-800 border-green-300', emoji: '🎋', major: true })

  // Kuningan — Saniscara Keliwon Kuningan (wuku 11)
  if (S && K && b.wuku === 11)
    out.push({ name: 'Kuningan', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', emoji: '🌾', major: true })

  // Tumpek (Saniscara Keliwon on specific wuku)
  const TUMPEK: Record<number, string> = {
    1: 'Tumpek Landep', 6: 'Tumpek Uduh', 16: 'Tumpek Klurut',
    21: 'Tumpek Kandang', 26: 'Tumpek Wayang',
  }
  if (S && K && TUMPEK[b.wuku])
    out.push({ name: TUMPEK[b.wuku], color: 'bg-violet-100 text-violet-800 border-violet-300', emoji: '🛕', major: true })

  return out
}

/* ═══════════════════════════════════════════════════════════════════
   LUNAR LABEL
═══════════════════════════════════════════════════════════════════ */
function lunarLabel(n: number): string {
  if (n === 15) return 'Purnama'
  if (n === 0)  return 'Tilem'
  if (n < 15)   return `Penanggal ${n}`
  return `Pangelong ${n - 15}`
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function KalenderBali() {
  const [today,  setToday]  = useState<Date | null>(null)
  const [bali,   setBali]   = useState<BaliDay | null>(null)
  const [error,  setError]  = useState(false)

  useEffect(() => {
    try {
      const d = new Date()
      setToday(d)
      setBali(calcBaliDay(d))
    } catch {
      setError(true)
    }
  }, [])

  /* Upcoming sacred days — next 60 days */
  const upcoming: { date: Date; b: BaliDay; sacred: Sacred[] }[] = []
  if (today && bali && !error) {
    for (let i = 1; i <= 60; i++) {
      try {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const b  = calcBaliDay(d)
        const sacred = getSacred(b).filter(s => s.major)
        if (sacred.length) upcoming.push({ date: d, b, sacred })
      } catch { /* skip bad dates */ }
    }
  }

  /* ── Loading ── */
  if (!today || !bali) return (
    <div className="flex justify-center py-10">
      {error
        ? <p className="font-garamond text-slate-400 text-base">Kalender tidak tersedia saat ini.</p>
        : <span className="font-balinese text-4xl text-amber-400 animate-pulse">ᬒᬁ</span>
      }
    </div>
  )

  const sacred  = getSacred(bali)
  const lunarIc = bali.lunar === 15 ? '🌕' : bali.lunar === 0 ? '🌑' : bali.lunar < 15 ? '🌒' : '🌘'

  return (
    <section className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-balinese text-amber-500 text-sm mb-1" style={{ opacity: 0.8 }}>
            ᬤᬶᬦ​&nbsp;ᬮᬦ᭄​&nbsp;ᬯᬭᬶᬕ
          </div>
          <h2 className="font-inter font-bold text-slate-800 text-xl">Kalender Bali</h2>
        </div>
        <a
          href="https://kalenderbali.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-inter text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          kalenderbali.com <ArrowRight size={11} />
        </a>
      </div>

      {/* ── Today card ── */}
      <div className="glass-card p-6 sm:p-8">

        {/* Main wewaran */}
        <div className="text-center mb-6">
          <p className="font-inter text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            {['Min','Sen','Sel','Rab','Kam','Jum','Sab'][today.getDay()]},&nbsp;
            {today.getDate()} {MONTH_ID[today.getMonth()]} {today.getFullYear()}
          </p>
          <div className="font-inter font-bold text-slate-800 text-2xl sm:text-3xl leading-tight">
            {SAPTA_WARA[bali.sapta]}&ensp;
            <span className="text-amber-600">{PANCA_WARA[bali.panca]}</span>
          </div>
          <p className="font-garamond text-slate-500 text-lg mt-1">
            Wuku <span className="font-semibold text-slate-700">{WUKU[bali.wuku]}</span>
          </p>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { icon: <Sun  size={14} weight="fill" className="text-amber-500" />, label: 'Tri Wara', value: TRI_WARA[bali.tri]     },
            { icon: <Sun  size={14} weight="fill" className="text-green-500" />, label: 'Wuku',     value: WUKU[bali.wuku]         },
            { icon: <Moon size={14} weight="fill" className="text-slate-500" />, label: 'Sasih',    value: SASIH[bali.sasih]       },
            { icon: <span className="text-sm">{lunarIc}</span>,                  label: 'Tanggal',  value: lunarLabel(bali.lunar)  },
          ].map((item, i) => (
            <div key={i} className="bg-white/70 rounded-xl p-3 text-center border border-slate-100">
              <div className="flex items-center justify-center gap-1 mb-1">
                {item.icon}
                <span className="font-inter text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {item.label}
                </span>
              </div>
              <p className="font-inter font-semibold text-slate-700 text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Saka year */}
        <p className="text-center font-garamond text-slate-400 text-sm mb-4">
          Tahun Çaka {bali.saka}
        </p>

        {/* Sacred day badges */}
        {sacred.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <p className="font-inter text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">
              Hari Suci Hari Ini
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {sacred.map((s, i) => (
                <span key={i} className={`flex items-center gap-1.5 text-xs font-inter font-semibold px-3 py-1.5 rounded-full border ${s.color}`}>
                  {s.emoji} {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Upcoming rerainan ── */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <CalendarDots size={15} weight="fill" className="text-amber-500" />
          <h3 className="font-inter font-semibold text-slate-700 text-sm">Rerainan Mendatang</h3>
          <span className="font-garamond text-slate-400 text-xs ml-auto">60 hari ke depan</span>
        </div>

        <div className="divide-y divide-slate-50">
          {upcoming.slice(0, 12).map(({ date, b, sacred: s }, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
              {/* Date badge */}
              <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center">
                <span className="font-inter font-bold text-amber-700 text-lg leading-none">
                  {date.getDate()}
                </span>
                <span className="font-inter text-[10px] text-amber-500 font-semibold uppercase">
                  {MONTH_ID[date.getMonth()].slice(0, 3)}
                </span>
              </div>

              {/* Wewaran info */}
              <div className="flex-1 min-w-0">
                <p className="font-inter font-semibold text-slate-700 text-sm">
                  {SAPTA_WARA[b.sapta]}, {PANCA_WARA[b.panca]}
                </p>
                <p className="font-garamond text-slate-400 text-sm">
                  Wuku {WUKU[b.wuku]} · {SASIH[b.sasih]}
                </p>
              </div>

              {/* Sacred badges */}
              <div className="flex flex-wrap gap-1.5 justify-end shrink-0 max-w-40">
                {s.map((x, j) => (
                  <span key={j} className={`text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${x.color}`}>
                    {x.emoji} {x.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {upcoming.length === 0 && (
          <p className="font-garamond text-slate-400 text-center py-8 text-base">
            Tidak ada rerainan dalam 60 hari ke depan.
          </p>
        )}

        <div className="px-5 py-3 border-t border-slate-100 text-center">
          <a
            href="https://kalenderbali.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Lihat kalender lengkap di kalenderbali.com →
          </a>
        </div>
      </div>

    </section>
  )
}