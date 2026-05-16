'use client'

import { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'
import EditModal, { type FieldConfig } from '@/components/EditModal'
import type { BanjarEvent } from '@/lib/types'

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

const TYPE_COLOR: Record<string, string> = {
  upacara: 'badge-upacara', ngaben: 'badge-ngaben',
  seni:    'badge-seni',    rapat:  'badge-rapat',
}
const TYPE_LABEL: Record<string, string> = {
  upacara: 'Upacara', ngaben: 'Ngaben', seni: 'Kesenian', rapat: 'Rapat',
}

const FIELDS: FieldConfig[] = [
  { key: 'title',       label: 'Judul Kegiatan',               type: 'text',     placeholder: 'Nama kegiatan' },
  { key: 'balinese',    label: 'Judul Aksara Bali (opsional)', type: 'text',     placeholder: 'ᬒᬁ...' },
  { key: 'date',        label: 'Tanggal',                      type: 'date' },
  { key: 'location',    label: 'Lokasi',                       type: 'text',     placeholder: 'Lokasi pelaksanaan' },
  { key: 'description', label: 'Deskripsi',                    type: 'textarea', placeholder: 'Keterangan lengkap kegiatan' },
  { key: 'type',        label: 'Tipe Kegiatan',                type: 'select',
    options: [
      { value: 'upacara', label: 'Upacara'          },
      { value: 'ngaben',  label: 'Ngaben'            },
      { value: 'seni',    label: 'Kesenian / Seni'   },
      { value: 'rapat',   label: 'Rapat / Lainnya'   },
    ],
  },
]

const EMPTY: Partial<BanjarEvent> = {
  title: '', balinese: '', date: '', location: '', description: '', type: 'upacara',
}

export default function EventsPage() {
  const { isAdmin } = useAdmin()
  const [events,  setEvents]  = useState<BanjarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<Partial<BanjarEvent> | null>(null)

  const load = async () => {
    const { data } = await supabase.from('events').select('*').order('date')
    setEvents(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  /* ── FIX: destructure id out so it is never sent in the update payload ── */
  const save = async (form: Record<string, unknown>) => {
    const { id, ...fields } = form
    if (id) await supabase.from('events').update(fields).eq('id', id)
    else    await supabase.from('events').insert([fields])
    setModal(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Hapus kegiatan ini?')) return
    await supabase.from('events').delete().eq('id', id)
    load()
  }

  const today  = new Date().toISOString().split('T')[0]
  const future = events.filter((e) => e.date >= today)
  const past   = events.filter((e) => e.date <  today).reverse()

  const Card = ({ e, dim }: { e: BanjarEvent; dim?: boolean }) => (
    <div className={`glass-card p-5 mb-4 transition-opacity ${dim ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center flex-wrap mb-2">
            <span className={`text-xs font-inter font-semibold px-2.5 py-1 rounded-full ${TYPE_COLOR[e.type] ?? 'badge-rapat'}`}>
              {TYPE_LABEL[e.type] ?? e.type}
            </span>
            <span className="font-garamond text-slate-400 text-sm">{fmtDate(e.date)}</span>
          </div>
          {e.balinese && (
            <div className="font-balinese text-amber-500 text-xs opacity-55 mb-1">{e.balinese}</div>
          )}
          <h3 className="font-inter font-semibold text-slate-800 mb-2 leading-snug">{e.title}</h3>
          <p className="font-garamond text-slate-500 leading-relaxed">{e.description}</p>
          <p className="font-garamond text-slate-400 text-sm mt-2">📍 {e.location}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setModal(e)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <PencilSimple size={15} />
            </button>
            <button
              onClick={() => remove(e.id)}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
            >
              <Trash size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <span className="font-balinese text-5xl text-amber-400 animate-pulse">ᬒᬁ</span>
    </div>
  )

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="flex justify-between items-end mb-7">
        <div>
          <div className="font-balinese text-amber-500 text-sm opacity-55 mb-1">ᬳᬘᬭ​&nbsp;ᬮᬦ᭄​&nbsp;ᬉᬧᬘᬭ​᭟​&nbsp;</div>
          <h1 className="font-inter font-bold text-slate-800 text-2xl">Kegiatan & Upacara</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModal(EMPTY)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-inter font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <Plus size={15} weight="bold" /> Tambah
          </button>
        )}
      </div>

      {/* Upcoming */}
      {future.length > 0 && (
        <>
          <p className="font-inter text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            📅 Mendatang
          </p>
          {future.map((e) => <Card key={e.id} e={e} />)}
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className={future.length ? 'mt-8' : ''}>
          <p className="font-inter text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">
            🕰 Telah Berlalu
          </p>
          {past.map((e) => <Card key={e.id} e={e} dim />)}
        </div>
      )}

      {events.length === 0 && (
        <p className="font-garamond text-slate-400 text-center py-24 text-xl">
          Belum ada kegiatan terdaftar.
        </p>
      )}

      {modal && (
        <EditModal
          title={modal.id ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
          fields={FIELDS}
          initialData={modal as Record<string, unknown>}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}