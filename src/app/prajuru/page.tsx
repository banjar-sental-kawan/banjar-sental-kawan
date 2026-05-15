'use client'

import { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, Phone } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'
import EditModal, { type FieldConfig } from '@/components/EditModal'
import type { Prajuru, Priest } from '@/lib/types'

/* ── Field configs ── */
const PRAJURU_FIELDS: FieldConfig[] = [
  {
    key: 'role', label: 'Jabatan', type: 'select',
    options: [
      { value: 'Kelian Banjar', label: 'Kelian Banjar (Ketua)'       },
      { value: 'Penyarikan',   label: 'Penyarikan (Sekretaris)'     },
      { value: 'Patengen',     label: 'Patengen (Bendahara)'        },
      { value: 'Kasinoman',    label: 'Kasinoman (Humas)'           },
      { value: 'Lainnya',      label: 'Lainnya'                     },
    ],
  },
  { key: 'balinese', label: 'Jabatan Aksara Bali (opsional)', type: 'text', placeholder: 'ᬓᬾᬮᬶᬬᬦ᭄…' },
  { key: 'name',     label: 'Nama Lengkap',                   type: 'text', placeholder: 'Nama prajuru' },
  { key: 'since',    label: 'Menjabat Sejak (Tahun)',         type: 'text', placeholder: '2023' },
  { key: 'contact',  label: 'Nomor Kontak',                   type: 'text', placeholder: '+62 8xx-xxxx-xxxx' },
  { key: 'note',     label: 'Catatan',                        type: 'textarea', placeholder: 'Keterangan tambahan…' },
]

const PRIEST_FIELDS: FieldConfig[] = [
  {
    key: 'title', label: 'Gelar', type: 'select',
    options: [
      { value: 'Pedanda',   label: 'Pedanda'   },
      { value: 'Pemangku',  label: 'Pemangku'  },
      { value: 'Pinandita', label: 'Pinandita' },
      { value: 'Lainnya',   label: 'Lainnya'   },
    ],
  },
  { key: 'name',      label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap' },
  { key: 'specialty', label: 'Spesialisasi / Pura', type: 'text', placeholder: 'Pura atau keahlian upacara' },
  { key: 'contact',   label: 'Nomor Kontak', type: 'text', placeholder: '+62 8xx-xxxx-xxxx' },
]

const EMPTY_PRAJURU: Partial<Prajuru> = { role: 'Kelian Banjar', balinese: '', name: '', since: '', contact: '', note: '' }
const EMPTY_PRIEST:  Partial<Priest>  = { title: 'Pemangku', name: '', specialty: '', contact: '' }

/* ── Prajuru avatar initial ── */
const initial = (name: string) => name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function PrajuruPage() {
  const { isAdmin } = useAdmin()
  const [prajuru,  setPrajuru]  = useState<Prajuru[]>([])
  const [priests,  setPriests]  = useState<Priest[]>([])
  const [loading,  setLoading]  = useState(true)
  const [pModal,   setPModal]   = useState<Partial<Prajuru> | null>(null)
  const [rModal,   setRModal]   = useState<Partial<Priest>  | null>(null)

  const load = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from('prajuru').select('*').order('id'),
      supabase.from('priests').select('*').order('id'),
    ])
    setPrajuru(p ?? [])
    setPriests(r ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const savePrajuru = async (form: Record<string, unknown>) => {
    if (form.id) await supabase.from('prajuru').update(form).eq('id', form.id)
    else         await supabase.from('prajuru').insert([form])
    setPModal(null); load()
  }

  const removePrajuru = async (id: number) => {
    if (!confirm('Hapus data prajuru ini?')) return
    await supabase.from('prajuru').delete().eq('id', id); load()
  }

  const savePriest = async (form: Record<string, unknown>) => {
    if (form.id) await supabase.from('priests').update(form).eq('id', form.id)
    else         await supabase.from('priests').insert([form])
    setRModal(null); load()
  }

  const removePriest = async (id: number) => {
    if (!confirm('Hapus data ini?')) return
    await supabase.from('priests').delete().eq('id', id); load()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <span className="font-balinese text-5xl text-amber-400 animate-pulse">ᬒᬁ</span>
    </div>
  )

  return (
    <div className="fade-up space-y-10">

      {/* ── Prajuru section ── */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="font-balinese text-amber-500 text-sm opacity-55 mb-1">ᬧ᭄ᬭᬚᬸᬭᬸ ᬩᬜ᭄ᬚᬃ ᬆᬤᬢ᭄</div>
            <h1 className="font-inter font-bold text-slate-800 text-2xl">Prajuru Banjar Adat</h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setPModal(EMPTY_PRAJURU)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-inter font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Plus size={15} weight="bold" /> Tambah
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {prajuru.map((p) => (
            <div key={p.id} className="glass-card p-6 flex flex-col items-center text-center gap-3 transition-transform hover:-translate-y-1">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-amber-100 to-amber-200 border-2 border-amber-300 flex items-center justify-center shrink-0">
                <span className="font-inter font-bold text-amber-700 text-lg">
                  {initial(p.name)}
                </span>
              </div>

              {p.balinese && (
                <div className="font-balinese text-amber-500 text-xs opacity-55">{p.balinese}</div>
              )}
              <div className="font-inter text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {p.role}
              </div>
              <h3 className="font-inter font-bold text-slate-800 text-sm leading-snug">{p.name}</h3>
              <div className="font-garamond text-slate-400 text-sm">Sejak {p.since}</div>
              {p.note && (
                <p className="font-garamond text-slate-400 text-sm italic leading-snug">{p.note}</p>
              )}
              {p.contact && (
                <a
                  href={`tel:${p.contact}`}
                  className="flex items-center gap-1.5 font-garamond text-amber-600 text-sm hover:text-amber-700 transition-colors"
                >
                  <Phone size={13} weight="fill" />
                  {p.contact}
                </a>
              )}

              {isAdmin && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setPModal(p)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <PencilSimple size={13} />
                  </button>
                  <button
                    onClick={() => removePrajuru(p.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {prajuru.length === 0 && (
            <p className="font-garamond text-slate-400 col-span-4 text-center py-10 text-xl">
              Belum ada data prajuru.
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

      {/* ── Priests section ── */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="font-balinese text-amber-500 text-sm opacity-55 mb-1">ᬧᭂᬫᬗ᭄ᬓᬸ​&nbsp;ᬩᬜ᭄ᬚᬃ</div>
            <h2 className="font-inter font-bold text-slate-800 text-xl">Pemangku Banjar</h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => setRModal(EMPTY_PRIEST)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-inter font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Plus size={15} weight="bold" /> Tambah
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {priests.map((p) => (
            <div key={p.id} className="glass-card p-5">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="badge-upacara text-xs font-inter font-semibold px-2.5 py-1 rounded-full inline-block mb-3">
                    {p.title}
                  </span>
                  <h3 className="font-inter font-bold text-slate-800 text-base mb-1 leading-snug">
                    {p.name}
                  </h3>
                  {p.specialty && (
                    <p className="font-garamond text-slate-400 text-sm">{p.specialty}</p>
                  )}
                  {p.contact && (
                    <a
                      href={`tel:${p.contact}`}
                      className="flex items-center gap-1.5 font-garamond text-amber-600 text-sm mt-2 hover:text-amber-700 transition-colors"
                    >
                      <Phone size={13} weight="fill" />
                      {p.contact}
                    </a>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setRModal(p)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={() => removePriest(p.id)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {priests.length === 0 && (
            <p className="font-garamond text-slate-400 col-span-2 text-center py-10 text-xl">
              Belum ada data pemangku.
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {pModal && (
        <EditModal
          title={pModal.id ? 'Edit Prajuru' : 'Tambah Prajuru'}
          fields={PRAJURU_FIELDS}
          initialData={pModal as Record<string, unknown>}
          onSave={savePrajuru}
          onClose={() => setPModal(null)}
        />
      )}
      {rModal && (
        <EditModal
          title={rModal.id ? 'Edit Pemangku / Pedanda' : 'Tambah Pemangku / Pedanda'}
          fields={PRIEST_FIELDS}
          initialData={rModal as Record<string, unknown>}
          onSave={savePriest}
          onClose={() => setRModal(null)}
        />
      )}
    </div>
  )
}
