'use client'

import { useState, useEffect } from 'react'
import { X, FloppyDisk } from '@phosphor-icons/react'

export interface FieldConfig {
  key:          string
  label:        string
  type?:        'text' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox'
  options?:     { value: string; label: string }[]
  placeholder?: string
}

interface EditModalProps {
  title:       string
  fields:      FieldConfig[]
  initialData: Record<string, unknown>
  onSave:      (data: Record<string, unknown>) => Promise<void>
  onClose:     () => void
}

export default function EditModal({
  title, fields, initialData, onSave, onClose,
}: EditModalProps) {
  const [form,   setForm]   = useState<Record<string, unknown>>(initialData)
  const [saving, setSaving] = useState(false)

  /* Lock body scroll while modal is open — prevents page scrolling on mobile */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const set = (key: string, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    /*
     * MOBILE FIX:
     * The overlay uses `flex items-center justify-center` directly — the modal
     * card is ALWAYS centred in the visible viewport regardless of scroll position.
     *
     * The card itself uses `max-h-[90vh] overflow-y-auto` so tall forms scroll
     * inside the card, never inside the page. `min-h-full` + `overflow-y-auto`
     * on the overlay (previous approach) breaks on mobile Safari because
     * it miscalculates vh when the address bar is visible.
     */
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(15, 23, 42, 0.50)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-7">

          {/* ── Modal header ── */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-inter font-bold text-slate-800 text-base">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Fields ── */}
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="font-inter text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {f.label}
                </label>

                {f.type === 'textarea' ? (
                  <textarea
                    value={String(form[f.key] ?? '')}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-garamond text-base resize-y transition-all"
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={String(form[f.key] ?? f.options?.[0]?.value ?? '')}
                    onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-inter text-sm transition-all"
                  >
                    {f.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form[f.key])}
                      onChange={e => set(f.key, e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-garamond text-slate-600 text-base">Ya</span>
                  </label>
                ) : (
                  <input
                    type={f.type ?? 'text'}
                    value={String(form[f.key] ?? '')}
                    onChange={e =>
                      set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)
                    }
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-inter text-sm transition-all"
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-inter font-semibold text-sm py-2.5 rounded-lg transition-all shadow-sm"
            >
              <FloppyDisk size={16} weight="fill" />
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-inter text-sm hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}