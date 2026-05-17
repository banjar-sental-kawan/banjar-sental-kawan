'use client'

import { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, Warning } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'
import EditModal, { type FieldConfig } from '@/components/EditModal'
import AutoLink from '@/components/AutoLink'
import type { Announcement } from '@/lib/types'

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

const FIELDS: FieldConfig[] = [
  { key: 'title',     label: 'Judul Pengumuman', type: 'text',     placeholder: 'Judul singkat' },
  { key: 'date',      label: 'Tanggal',          type: 'date' },
  { key: 'content',   label: 'Isi Pengumuman',   type: 'textarea', placeholder: 'Tulis isi pengumuman di sini…' },
  { key: 'important', label: 'Tandai Penting?',  type: 'checkbox' },
]

const EMPTY: Partial<Announcement> = {
  title: '', date: '', content: '', important: false,
}

export default function AnnouncementsPage() {
  const { isAdmin } = useAdmin()
  const [items,   setItems]   = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<Partial<Announcement> | null>(null)

  const load = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (form: Record<string, unknown>) => {
    const { id, ...fields } = form
    if (id) await supabase.from('announcements').update(fields).eq('id', id)
    else    await supabase.from('announcements').insert([fields])
    setModal(null)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return
    await supabase.from('announcements').delete().eq('id', id)
    load()
  }

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
          <div className="font-balinese text-amber-500 text-sm opacity-55 mb-1">ᬧᬶᬬᬸᬦᬶᬂ​᭟​&nbsp;</div>
          <h1 className="font-inter font-bold text-slate-800 text-2xl">Pengumuman</h1>
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

      {/* List */}
      <div className="space-y-4">
        {items.map((a) => (
          <div
            key={a.id}
            className="glass-card p-6"
            style={{
              borderLeft: `4px solid ${a.important ? '#f59e0b' : 'rgba(15,23,42,0.08)'}`,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                {/* Badges + date */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {a.important && (
                    <span className="badge-penting flex items-center gap-1 text-xs font-inter font-semibold px-2.5 py-1 rounded-full">
                      <Warning size={11} weight="fill" /> Penting
                    </span>
                  )}
                  <span className="font-garamond text-slate-400 text-sm">{fmtDate(a.date)}</span>
                </div>

                <h3 className="font-inter font-semibold text-slate-800 text-base mb-2 leading-snug">
                  {a.title}
                </h3>

                {/* AutoLink converts plain URLs into clickable anchor tags */}
                <p className="font-garamond text-slate-600 leading-relaxed text-base">
                  <AutoLink text={a.content} />
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setModal(a)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <PencilSimple size={15} />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="font-garamond text-slate-400 text-center py-24 text-xl">
          Belum ada pengumuman.
        </p>
      )}

      {modal && (
        <EditModal
          title={modal.id ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
          fields={FIELDS}
          initialData={modal as Record<string, unknown>}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}