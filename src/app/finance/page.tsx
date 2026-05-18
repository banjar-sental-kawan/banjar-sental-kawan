'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash, ArrowUp, ArrowDown, Scales } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'
import EditModal, { type FieldConfig } from '@/components/EditModal'
import type { FinanceRecord } from '@/lib/types'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(n)

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

const FIELDS: FieldConfig[] = [
  { key: 'date',        label: 'Tanggal',    type: 'date' },
  { key: 'description', label: 'Keterangan', type: 'text', placeholder: 'Deskripsi transaksi' },
  {
    key: 'category', label: 'Kategori', type: 'select',
    options: [
      { value: 'Iuran',         label: 'Iuran'         },
      { value: 'Upacara',       label: 'Upacara'       },
      { value: 'Donasi',        label: 'Donasi'        },
      { value: 'Infrastruktur', label: 'Infrastruktur' },
      { value: 'Kesenian',      label: 'Kesenian'      },
      { value: 'Lainnya',       label: 'Lainnya'       },
    ],
  },
  {
    key: 'type', label: 'Jenis', type: 'select',
    options: [
      { value: 'pemasukan',   label: '▲ Pemasukan (Masuk)'    },
      { value: 'pengeluaran', label: '▼ Pengeluaran (Keluar)' },
    ],
  },
  { key: 'amount', label: 'Jumlah (Rp)', type: 'number', placeholder: '0' },
]

const EMPTY: Partial<FinanceRecord> = {
  date: '', description: '', category: 'Iuran', type: 'pemasukan', amount: 0,
}

type Tab = 'semua' | 'pemasukan' | 'pengeluaran'

export default function FinancePage() {
  const { isAdmin } = useAdmin()
  const [records, setRecords] = useState<FinanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<Partial<FinanceRecord> | null>(null)
  const [tab,     setTab]     = useState<Tab>('semua')

  const load = async () => {
    const { data } = await supabase
      .from('finance')
      .select('*')
      .order('date', { ascending: false })
    setRecords(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (form: Record<string, unknown>) => {
    const { id, ...fields } = form
    if (id) await supabase.from('finance').update(fields).eq('id', id)
    else    await supabase.from('finance').insert([fields])
    setModal(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Hapus catatan ini?')) return
    await supabase.from('finance').delete().eq('id', id)
    load()
  }

  const totalIn  = records.filter(r => r.type === 'pemasukan').reduce((s, r) => s + r.amount, 0)
  const totalOut = records.filter(r => r.type === 'pengeluaran').reduce((s, r) => s + r.amount, 0)
  const balance  = totalIn - totalOut

  const displayed =
    tab === 'semua'     ? records :
    tab === 'pemasukan' ? records.filter(r => r.type === 'pemasukan') :
                          records.filter(r => r.type === 'pengeluaran')

  const tabTotal =
    tab === 'semua'     ? null :
    tab === 'pemasukan' ? totalIn : totalOut

  const TABS: { key: Tab; label: string; color: string; active: string }[] = [
    {
      key:    'semua',
      label:  'Semua',
      color:  'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300',
      active: 'text-amber-700 border-amber-500 bg-amber-50',
    },
    {
      key:    'pemasukan',
      label:  '▲ Pemasukan',
      color:  'text-slate-500 border-transparent hover:text-emerald-700 hover:border-emerald-300',
      active: 'text-emerald-700 border-emerald-500 bg-emerald-50',
    },
    {
      key:    'pengeluaran',
      label:  '▼ Pengeluaran',
      color:  'text-slate-500 border-transparent hover:text-red-600 hover:border-red-300',
      active: 'text-red-600 border-red-500 bg-red-50',
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <span className="font-balinese text-5xl text-amber-400 animate-pulse">ᬒᬁ</span>
    </div>
  )

  return (
    <> {/* <--- ADD THIS EMPTY FRAGMENT HERE */}
    <div className="fade-up">
      {/* Page header */}
      <div className="flex justify-between items-end mb-7">
        <div>
          <div className="font-balinese text-amber-500 text-sm opacity-55 mb-1">ᬳᬶᬦ᭄ᬤᬶᬓ᭄​&nbsp;ᬚᬶᬦᬄ​᭟​&nbsp;</div>
          <h1 className="font-inter font-bold text-slate-800 text-2xl">Keuangan Banjar</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModal(EMPTY)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-inter font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <Plus size={15} weight="bold" /> Catat Transaksi
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ArrowDown size={18} weight="bold" className="text-emerald-600" />
            </div>
            <span className="font-inter text-sm font-semibold text-slate-500">Total Pemasukan</span>
          </div>
          <div className="font-inter font-bold text-emerald-600 text-xl break-all">{fmt(totalIn)}</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ArrowUp size={18} weight="bold" className="text-red-500" />
            </div>
            <span className="font-inter text-sm font-semibold text-slate-500">Total Pengeluaran</span>
          </div>
          <div className="font-inter font-bold text-red-500 text-xl break-all">{fmt(totalOut)}</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-amber-50' : 'bg-red-50'}`}>
              <Scales size={18} weight="fill" className={balance >= 0 ? 'text-amber-600' : 'text-red-500'} />
            </div>
            <span className="font-inter text-sm font-semibold text-slate-500">Saldo Kas</span>
          </div>
          <div className={`font-inter font-bold text-xl break-all ${balance >= 0 ? 'text-amber-600' : 'text-red-500'}`}>
            {fmt(balance)}
          </div>
        </div>
      </div>

      {/* ── Tabs + Table ── */}
      <div className="glass-card overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-inter font-semibold text-sm px-4 sm:px-5 py-3.5 border-b-2 transition-all whitespace-nowrap ${
                tab === t.key ? t.active : t.color
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {/*
                  MOBILE RESPONSIVE COLUMNS:
                  - Tanggal    → always visible
                  - Keterangan → always visible (Kategori shown as sub-text on mobile)
                  - Kategori   → hidden on mobile (sm:table-cell)
                  - Jenis      → always visible, whitespace-nowrap badge
                  - Jumlah     → always visible
                  - Delete     → always visible (admin only)
                */}
                <th className="px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Tanggal
                </th>
                <th className="px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="hidden sm:table-cell px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Kategori
                </th>
                <th className="px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Jenis
                </th>
                <th className="px-3 py-3 text-right font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Jumlah
                </th>
                <th className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {displayed.map((r) => (
                <tr key={r.id} className="row-hover border-b border-slate-50">

                  {/* Tanggal */}
                  <td className="px-3 py-3 font-garamond text-slate-400 text-sm whitespace-nowrap align-top">
                    {fmtDate(r.date)}
                  </td>

                  {/* Keterangan — Kategori shown as sub-text on mobile */}
                  <td className="px-3 py-3 align-top">
                    <div className="font-garamond text-slate-700 text-sm">
                      {r.description}
                    </div>
                    {/* Kategori sub-text, only on mobile */}
                    <div className="sm:hidden font-garamond text-slate-400 text-xs mt-0.5">
                      {r.category}
                    </div>
                  </td>

                  {/* Kategori — hidden on mobile */}
                  <td className="hidden sm:table-cell px-3 py-3 font-garamond text-slate-400 text-sm align-top">
                    {r.category}
                  </td>

                  {/* Jenis badge — whitespace-nowrap prevents wrap */}
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-block text-xs font-inter font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      r.type === 'pemasukan' ? 'badge-seni' : 'badge-ngaben'
                    }`}>
                      {/* Short labels on mobile, full on sm+ */}
                      <span className="sm:hidden">
                        {r.type === 'pemasukan' ? '▲' : '▼'}
                      </span>
                      <span className="hidden sm:inline">
                        {r.type === 'pemasukan' ? '▲ Masuk' : '▼ Keluar'}
                      </span>
                    </span>
                  </td>

                  {/* Jumlah */}
                  <td className={`px-3 py-3 font-inter font-semibold text-sm text-right whitespace-nowrap align-top ${
                    r.type === 'pemasukan' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {r.type === 'pengeluaran' && '− '}{fmt(r.amount)}
                  </td>

                  {/* Delete */}
                  <td className="px-3 py-3 text-center align-top">
                    {isAdmin && (
                      <button
                        onClick={() => remove(r.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total row — Pemasukan / Pengeluaran tab */}
            {tabTotal !== null && displayed.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/60">
                  <td colSpan={2} className="px-3 py-3 font-inter font-semibold text-slate-600 text-sm text-right">
                    <span className="hidden sm:inline">Total {tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</span>
                    <span className="sm:hidden">Total</span>
                  </td>
                  {/* Skip Kategori column on desktop */}
                  <td className="hidden sm:table-cell" />
                  <td />
                  <td className={`px-3 py-3 font-inter font-bold text-base text-right whitespace-nowrap ${
                    tab === 'pemasukan' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {fmt(tabTotal)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}

            {/* Total row — Semua tab (Saldo Kas) */}
            {tab === 'semua' && records.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/60">
                  <td colSpan={2} className="px-3 py-3 font-inter font-semibold text-slate-600 text-sm text-right">
                    Saldo Kas
                  </td>
                  <td className="hidden sm:table-cell" />
                  <td />
                  <td className={`px-3 py-3 font-inter font-bold text-base text-right whitespace-nowrap ${
                    balance >= 0 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {fmt(balance)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {displayed.length === 0 && (
          <p className="font-garamond text-slate-400 text-center py-16 text-xl">
            Belum ada catatan {tab === 'semua' ? 'keuangan' : tab}.
          </p>
        )}
      </div>
</div> {/* <--- CLOSE THE FADE-UP DIV HERE */}
      {modal && (
        <EditModal
          title="Catat Transaksi"
          fields={FIELDS}
          initialData={modal as Record<string, unknown>}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </> /* <--- CLOSE THE FRAGMENT HERE */
  )
}