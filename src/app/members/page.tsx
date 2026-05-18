'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Plus, PencilSimple, Trash,
  MagnifyingGlass, UploadSimple,
  CheckCircle, WarningCircle,
} from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'
import EditModal, { type FieldConfig } from '@/components/EditModal'
import type { KramaMember } from '@/lib/types'

const SEED_MEMBERS = [
  "Gede Soma","Gede Tawan","Gede Misna","Gede Karya","Gede Suastana",
  "Gede Kuasa","Gede Sulasta","Gede Jahendra","Gede Sunarya","Gede Sudarma",
  "Gede Nugara","Gede Arya W.","Gede Sugiantara","Gede Merte Jaya NP","Gede Parwata",
  "Gede Kartika","Gede Sugita","Gede Rawan","Gede Manca","Gede Suardana",
  "Gede Yustika","Wayan Mokir","Wayan Pon Wirasta","Wayan Mudita","Wayan Teguh S.",
  "Putu Dana","Putu Oka","Putu Darmawan","Putu Nela","Putu Suartika Bg.",
  "Putu Adi Kusuma","Putu Agus Yudiarta","Putu Roniarta","Putu Sidiasa","Putu Sunan Jaya",
  "Putu Juliarta","Putu Manik W.","Putu Dormaya","Made Kastawan","Made Jaya Wibawa",
  "Made Witra","Gede Dayuh Tanggan","Made Suartika","Made Caya","Made Dika",
  "Made Sukadarma","Made Wirtha","Made Sukedana","Made Kawiana","Kadek Suartika My.",
  "Kadek Guru Sumandia","Kadek Muliarsa","Kadek Kurman","Kadek Wiana","Kadek Suartika Jt.",
  "Kadek Sentana Jaya","Kadek Neda SP.","Kadek Warto","Kadek Mandra","Kadek Rawan",
  "Kadek Budiada","Kadek Epa","Kadek Wijaya","Kadek Wirta","Kadek Sumandia TR",
  "Kadek Ari","Kadek Widiana","Kadek Kleri Atmon D.","Kadek Merte Jaya","Kadek Yuda Pramana",
  "Agus Oka","Agus Sonendra","Nengah Latra","Nengah Merta","Komang Tri",
  "Komang Sukarta","Komang Pande","Komang Budiana","Komang Kurnata","Komang Ngurah Pinatih",
  "Nyoman Dana Klotok","Nyoman Murdita","Nyoman Santra","Nyoman Mokoh","Nyoman Binastra",
  "Nyoman Tastra","Nyoman Mare","Nyoman Kita Sanjaya","Nyoman Cirta","Nyoman Gria",
  "Nyoman Dalang","Ketut Darmawan","Ketut Royana","Ketut Mare Pandey","Ketut Sugelastra",
  "Ketut Binastrawan","Ketut Surya","Ketut Pandi","Ketut Parsana","Ketut Kurma",
  "Ketut Juliarta","Gede Merte Jaya Bo","Gede Jana","Gede Suta Pinatih","Gede Putu Sudarmawan",
  "Putu Wage MT","Putu Ngurah","Wayan Suardana","Wayan Karma","Wayan Marsa",
  "Wayan Sandiadnyana","Ketut Asli","Ketut Ari Wirawan","Ketut Semara Jaya","Nyoman Sujana",
  "Nyoman Sukedana","Made Awan","Agus Nopa","Made Putra Dwitya","Kadek Suartika Lili",
  "Kadek Kori A.","Kadek Naya","Kadek Eka Yoga","Kadek Nanda P.","Komang Mawan",
  "Putu Nusada","Ketut Suartika",
]

const FIELDS: FieldConfig[] = [
  { key: 'name',   label: 'Nama Lengkap', type: 'text',   placeholder: 'Nama krama' },
  { key: 'kk',     label: 'NIK',          type: 'text',   placeholder: '510501…' },
  {
    key: 'status', label: 'Status Krama', type: 'select',
    options: [
      { value: 'Krama Ngarep', label: 'Krama Ngarep' },
      { value: 'Krama Tamiu',  label: 'Krama Tamiu'  },
      { value: 'Tamiu',        label: 'Tamiu'         },
    ],
  },
  { key: 'address', label: 'Alamat', type: 'text', placeholder: 'Br. Sental Kawan' },
]

const EMPTY: Partial<KramaMember> = {
  name: '', kk: '', status: 'Krama Ngarep', address: '',
}

const STATUS_BADGE: Record<string, string> = {
  'Krama Ngarep': 'badge-seni',
  'Krama Tamiu':  'badge-rapat',
  'Tamiu':        'badge-rapat',
}

/* Shorter display label for mobile — avoids wrapping */
const STATUS_SHORT: Record<string, string> = {
  'Krama Ngarep': 'Ngarep',
  'Krama Tamiu':  'Tamiu',
  'Tamiu':        'Tamiu',
}

type ToastType = 'success' | 'error'
interface Toast { type: ToastType; message: string }

export default function MembersPage() {
  const { isAdmin }            = useAdmin()
  const [members,  setMembers] = useState<KramaMember[]>([])
  const [loading,  setLoading] = useState(true)
  const [seeding,  setSeeding] = useState(false)
  const [search,   setSearch]  = useState('')
  const [modal,    setModal]   = useState<Partial<KramaMember> | null>(null)
  const [toast,    setToast]   = useState<Toast | null>(null)

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const load = async () => {
    const { data, error } = await supabase
      .from('members').select('*').order('id')
    if (error) showToast('error', `Gagal memuat data: ${error.message}`)
    else setMembers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const seedMembers = async () => {
    if (!confirm(`Import ${SEED_MEMBERS.length} data krama ke Supabase?\nPastikan tabel masih kosong.`)) return
    setSeeding(true)
    const rows = SEED_MEMBERS.map((name, i) => ({
      name,
      kk:      `KK-${String(i + 1).padStart(3, '0')}`,
      status:  'Krama Ngarep',
      address: 'Br. Sental Kawan',
    }))
    const BATCH = 50
    for (let i = 0; i < rows.length; i += BATCH) {
      const { error } = await supabase.from('members').insert(rows.slice(i, i + BATCH))
      if (error) {
        setSeeding(false)
        showToast('error', `Import gagal: ${error.message}. Periksa RLS policy di Supabase.`)
        return
      }
    }
    await load()
    setSeeding(false)
    showToast('success', `Berhasil mengimpor ${SEED_MEMBERS.length} krama! 🙏`)
  }

  const save = async (form: Record<string, unknown>) => {
    const { id, ...fields } = form
    const { error } = id
      ? await supabase.from('members').update(fields).eq('id', id)
      : await supabase.from('members').insert([fields])
    if (error) {
      showToast('error', `Gagal menyimpan: ${error.message}`)
    } else {
      setModal(null)
      showToast('success', 'Data berhasil disimpan.')
      load()
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Hapus data krama ini?')) return
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) showToast('error', `Gagal menghapus: ${error.message}`)
    else { showToast('success', 'Data krama dihapus.'); load() }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter(m =>
      [m.name, m.kk, m.status, m.address].join(' ').toLowerCase().includes(q)
    )
  }, [members, search])

  const counts = useMemo(
    () => members.reduce<Record<string, number>>(
      (acc, m) => { acc[m.status] = (acc[m.status] ?? 0) + 1; return acc }, {}
    ), [members]
  )

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <span className="font-balinese text-5xl text-amber-400 animate-pulse">ᬒᬁ</span>
    </div>
  )

  return (
    <>
    <div className="fade-up">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-5 py-4 rounded-xl shadow-xl max-w-sm fade-up ${
          toast.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle   size={20} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
            : <WarningCircle size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
          }
          <p className="font-inter text-sm font-medium leading-snug">{toast.message}</p>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="font-balinese text-amber-500 text-sm opacity-55 mb-1">ᬓ᭄ᬭᬫ ᬩᬜ᭄ᬚᬃ</div>
          <h1 className="font-inter font-bold text-slate-800 text-2xl">Anggota Krama</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isAdmin && members.length === 0 && (
            <button
              onClick={seedMembers}
              disabled={seeding}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-inter font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <UploadSimple size={15} weight="bold" />
              {seeding ? 'Mengimpor…' : `Import ${SEED_MEMBERS.length} Krama`}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setModal(EMPTY)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-inter font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Plus size={15} weight="bold" /> Tambah
            </button>
          )}
        </div>
      </div>

      {/* ── Stat pills ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <span className="font-inter font-bold text-slate-800 text-lg">{members.length}</span>
          <span className="font-garamond text-slate-500 text-sm">Total Krama</span>
        </div>
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="font-inter font-bold text-slate-800 text-lg">{count}</span>
            <span className="font-garamond text-slate-500 text-sm">{status}</span>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, NIK, atau status krama…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white font-inter text-sm text-slate-800 shadow-sm transition-all"
        />
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {/*
                  MOBILE LAYOUT:
                  - No.          → always visible, narrow
                  - Nama Lengkap → always visible, takes up remaining space
                  - NIK          → hidden on mobile (sm:table-cell)
                  - Status       → always visible, whitespace-nowrap badge
                  - Alamat       → hidden on mobile (sm:table-cell)
                  - Actions      → always visible
                */}
                <th className="px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider w-8">
                  No.
                </th>
                <th className="px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="hidden sm:table-cell px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  NIK
                </th>
                <th className="px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="hidden md:table-cell px-3 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-3 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} className="row-hover border-b border-slate-50">
                  {/* No. */}
                  <td className="px-3 py-3 font-inter text-slate-300 text-sm">
                    {i + 1}
                  </td>

                  {/* Nama — on mobile also shows NIK + Alamat as sub-text */}
                  <td className="px-3 py-3">
                    <div className="font-inter font-semibold text-slate-800 text-sm">
                      {m.name}
                    </div>
                    {/* Sub-text visible only on mobile */}
                    <div className="sm:hidden font-garamond text-slate-400 text-xs mt-0.5">
                      {m.kk}
                    </div>
                    <div className="md:hidden sm:hidden font-garamond text-slate-400 text-xs">
                      {m.address}
                    </div>
                  </td>

                  {/* NIK — hidden on mobile */}
                  <td className="hidden sm:table-cell px-3 py-3 font-garamond text-slate-500 text-sm">
                    {m.kk}
                  </td>

                  {/* Status — whitespace-nowrap prevents wrapping */}
                  <td className="px-3 py-3">
                    {/* Full label on sm+, short label on mobile */}
                    <span className={`hidden sm:inline-block text-xs font-inter font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[m.status] ?? 'badge-rapat'}`}>
                      {m.status}
                    </span>
                    <span className={`sm:hidden text-xs font-inter font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[m.status] ?? 'badge-rapat'}`}>
                      {STATUS_SHORT[m.status] ?? m.status}
                    </span>
                  </td>

                  {/* Alamat — hidden on mobile */}
                  <td className="hidden md:table-cell px-3 py-3 font-garamond text-slate-500 text-sm">
                    {m.address}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3">
                    {isAdmin && (
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setModal(m)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Edit"
                        >
                          <PencilSimple size={13} />
                        </button>
                        <button
                          onClick={() => remove(m.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
                          title="Hapus"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="font-garamond text-slate-400 text-center py-20 text-xl">
            {search ? 'Tidak ada krama ditemukan.' : 'Belum ada anggota krama terdaftar.'}
          </p>
        )}
      </div>
</div>
      {modal && (
        <EditModal
          title={modal.id ? 'Edit Anggota Krama' : 'Tambah Anggota Krama'}
          fields={FIELDS}
          initialData={modal as Record<string, unknown>}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
      </>
  )
}