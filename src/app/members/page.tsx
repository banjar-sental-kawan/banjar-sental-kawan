'use client'

import { useEffect, useState, useMemo } from 'react'
import { Plus, PencilSimple, Trash, MagnifyingGlass, UploadSimple } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'
import EditModal, { type FieldConfig } from '@/components/EditModal'
import type { KramaMember } from '@/lib/types'

/* ── All 127 krama from the official PDF ── */
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
  { key: 'name',    label: 'Nama Lengkap', type: 'text', placeholder: 'Nama krama' },
  { key: 'kk',      label: 'Nomor KK',    type: 'text', placeholder: 'KK-001' },
  {
    key: 'status', label: 'Status Krama', type: 'select',
    options: [
      { value: 'Krama Ngarep', label: 'Krama Ngarep' },
      { value: 'Krama Tamiu',  label: 'Krama Tamiu'  },
      { value: 'Tamiu',        label: 'Tamiu'         },
    ],
  },
  { key: 'address', label: 'Alamat', type: 'text', placeholder: 'Br. Sental Kawan No. …' },
]

const EMPTY: Partial<KramaMember> = { name: '', kk: '', status: 'Krama Ngarep', address: '' }

const STATUS_BADGE: Record<string, string> = {
  'Krama Ngarep': 'badge-seni',
  'Krama Tamiu':  'badge-rapat',
  'Tamiu':        'badge-rapat',
}

export default function MembersPage() {
  const { isAdmin } = useAdmin()
  const [members,   setMembers]   = useState<KramaMember[]>([])
  const [loading,   setLoading]   = useState(true)
  const [seeding,   setSeeding]   = useState(false)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState<Partial<KramaMember> | null>(null)

  const load = async () => {
    const { data } = await supabase.from('members').select('*').order('id')
    setMembers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  /* ── Import all 127 krama from PDF into Supabase ── */
  const seedMembers = async () => {
    if (!confirm(`Import ${SEED_MEMBERS.length} data krama ke Supabase? Pastikan tabel masih kosong.`)) return
    setSeeding(true)
    const rows = SEED_MEMBERS.map((name, i) => ({
      name,
      kk:      `KK-${String(i + 1).padStart(3, '0')}`,
      status:  'Krama Ngarep',
      address: 'Br. Sental Kawan',
    }))
    await supabase.from('members').insert(rows)
    await load()
    setSeeding(false)
  }

  const save = async (form: Record<string, unknown>) => {
    if (form.id) await supabase.from('members').update(form).eq('id', form.id)
    else         await supabase.from('members').insert([form])
    setModal(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Hapus data krama ini?')) return
    await supabase.from('members').delete().eq('id', id)
    load()
  }

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter((m) =>
      [m.name, m.kk, m.status, m.address].join(' ').toLowerCase().includes(q)
    )
  }, [members, search])

  /* ── Status counts ── */
  const counts = useMemo(
    () => members.reduce<Record<string, number>>(
      (acc, m) => { acc[m.status] = (acc[m.status] ?? 0) + 1; return acc }, {}
    ),
    [members]
  )

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <span className="font-balinese text-5xl text-amber-400 animate-pulse">ᬒᬁ</span>
    </div>
  )

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="font-balinese text-amber-500 text-sm opacity-55 mb-1">ᬓ᭄ᬭᬫ ᬩᬜ᭄ᬚᬃ</div>
          <h1 className="font-inter font-bold text-slate-800 text-2xl">Anggota Krama</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Seed button — only when table is empty */}
          {isAdmin && members.length === 0 && (
            <button
              onClick={seedMembers}
              disabled={seeding}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-inter font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <UploadSimple size={15} weight="bold" />
              {seeding ? 'Mengimpor…' : 'Import 127 Krama'}
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

      {/* Stat pills */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <span className="font-inter font-bold text-slate-800 text-lg">{members.length}</span>
          <span className="font-garamond text-slate-400 text-sm">Total Krama</span>
        </div>
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="glass-card px-4 py-2 flex items-center gap-2">
            <span className="font-inter font-bold text-slate-800 text-lg">{count}</span>
            <span className="font-garamond text-slate-400 text-sm">{status}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <MagnifyingGlass
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, No. KK, atau status krama…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white font-inter text-sm text-slate-800 shadow-sm transition-all"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {['No.', 'Nama Lengkap', 'No. KK', 'Status', 'Alamat', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left font-inter text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} className="row-hover border-b border-slate-50">
                  <td className="px-4 py-3 font-inter text-slate-300 text-sm">{i + 1}</td>
                  <td className="px-4 py-3 font-inter font-semibold text-slate-800 text-sm">
                    {m.name}
                  </td>
                  <td className="px-4 py-3 font-garamond text-slate-400 text-sm">{m.kk}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-inter font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[m.status] ?? 'badge-rapat'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-garamond text-slate-400 text-sm">{m.address}</td>
                  <td className="px-4 py-3">
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal(m)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <PencilSimple size={13} />
                        </button>
                        <button
                          onClick={() => remove(m.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
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

      {modal && (
        <EditModal
          title={modal.id ? 'Edit Anggota Krama' : 'Tambah Anggota Krama'}
          fields={FIELDS}
          initialData={modal as Record<string, unknown>}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
