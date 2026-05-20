'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Plus, PencilSimple, Trash, Warning,
  CaretDown, CaretUp, LockKey, LockKeyOpen,
  UsersThree, UserList, CurrencyCircleDollar,
  Megaphone, ArrowDown, ArrowUp, Scales, X,
  FloppyDisk, MagnifyingGlass, Phone,
} from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import AutoLink from '@/components/AutoLink'

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface SttPengurus {
  id: number; role: string; name: string
  since?: string; contact?: string; note?: string
}
interface SttMember {
  id: number; name: string; birth_year?: number
  sex?: 'L' | 'P'; education?: string; parent_name?: string
}
interface SttFinance {
  id: number; date: string; description: string
  category: string; type: 'penerimaan' | 'pengeluaran'; amount: number
}
interface SttAnnouncement {
  id: number; title: string; date: string
  content: string; important: boolean
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const fmtDateShort = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

/* ═══════════════════════════════════════════════════════════
   STT ADMIN PASSWORD (separate from main banjar admin)
═══════════════════════════════════════════════════════════ */
const STT_PASSWORD = 'lontar2024'

/* ═══════════════════════════════════════════════════════════
   STT LOGIN MODAL
═══════════════════════════════════════════════════════════ */
function SttLoginModal({ onLogin, onClose }: { onLogin: () => void; onClose: () => void }) {
  const [pw,  setPw]  = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    if (pw === STT_PASSWORD) { onLogin() }
    else { setErr('Kata sandi salah.') }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.65)' }}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="glass-card relative p-6 w-full max-w-88 fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-inter font-bold text-slate-800 text-base">Login Admin STT</h2>
            <p className="font-garamond text-slate-400 text-sm mt-0.5">Sekaa Truna Truni Lontar Wilis</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <input
          type="password"
          autoFocus
          placeholder="Kata sandi STT"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-inter text-sm mb-2 transition-all"
        />
        
        {err && <p className="font-inter text-xs text-red-500 mb-2">{err}</p>}
        
        <button
          onClick={submit}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-inter font-semibold text-sm py-2.5 rounded-lg transition-all mt-2 shadow-sm"
        >
          <LockKey size={14} /> Masuk
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   COLLAPSIBLE SECTION WRAPPER
═══════════════════════════════════════════════════════════ */
function Section({
  icon, title, badge, color, defaultOpen = true, children,
}: {
  icon: React.ReactNode; title: string; badge?: string | number
  color: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <span className="font-inter font-bold text-slate-800 text-base">{title}</span>
          {badge !== undefined && (
            <span className="font-inter text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {open ? <CaretUp size={16} className="text-slate-400" /> : <CaretDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   INLINE EDIT FORM — rendered inside the section, not a modal
═══════════════════════════════════════════════════════════ */
interface FieldDef {
  key: string; label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  options?: { value: string; label: string }[]
  placeholder?: string
}

function InlineForm({
  title, fields, data, onSave, onCancel,
}: {
  title: string; fields: FieldDef[]
  data: Record<string, unknown>
  onSave: (d: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm]   = useState<Record<string, unknown>>(data)
  const [busy, setBusy]   = useState(false)
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setBusy(true)
    await onSave(form)
    setBusy(false)
  }

  return (
    <div className="p-5 bg-slate-50/60 border-b border-slate-100">
      <p className="font-inter font-semibold text-slate-700 text-sm mb-4">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {fields.map(f => (
          <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="font-inter text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {f.label}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                value={String(form[f.key] ?? '')}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-garamond text-sm resize-y transition-all"
              />
            ) : f.type === 'select' ? (
              <select
                value={String(form[f.key] ?? f.options?.[0]?.value ?? '')}
                onChange={e => set(f.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-inter text-sm transition-all"
              >
                {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'checkbox' ? (
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={Boolean(form[f.key])}
                  onChange={e => set(f.key, e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="font-garamond text-slate-600 text-sm">Ya</span>
              </label>
            ) : (
              <input
                type={f.type ?? 'text'}
                value={String(form[f.key] ?? '')}
                onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-inter text-sm transition-all"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={busy}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-inter font-semibold text-xs px-4 py-2 rounded-lg transition-all"
        >
          <FloppyDisk size={13} weight="fill" />
          {busy ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 font-inter text-xs hover:bg-slate-50 transition-all"
        >
          Batal
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SttPage() {
  const [isAdmin, setIsAdmin]   = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const [pengurus,  setPengurus]  = useState<SttPengurus[]>([])
  const [members,   setMembers]   = useState<SttMember[]>([])
  const [finance,   setFinance]   = useState<SttFinance[]>([])
  const [announce,  setAnnounce]  = useState<SttAnnouncement[]>([])
  const [loading,   setLoading]   = useState(true)

  /* Inline form states — null = hidden, {} = add new, {...} = edit */
  const [pengurusForm,  setPengurusForm]  = useState<Record<string, unknown> | null>(null)
  const [memberForm,    setMemberForm]    = useState<Record<string, unknown> | null>(null)
  const [financeForm,   setFinanceForm]   = useState<Record<string, unknown> | null>(null)
  const [announceForm,  setAnnounceForm]  = useState<Record<string, unknown> | null>(null)
  const [search,        setSearch]        = useState('')
  const [financeTab,    setFinanceTab]    = useState<'semua' | 'penerimaan' | 'pengeluaran'>('semua')

  /* Load all data */
  const load = async () => {
    const [{ data: p }, { data: m }, { data: f }, { data: a }] = await Promise.all([
      supabase.from('stt_pengurus').select('*').order('id'),
      supabase.from('stt_members').select('*').order('name'),
      supabase.from('stt_finance').select('*').order('date', { ascending: false }),
      supabase.from('stt_announcements').select('*').order('date', { ascending: false }),
    ])
    setPengurus(p ?? [])
    setMembers(m ?? [])
    setFinance(f ?? [])
    setAnnounce(a ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  /* Admin session via sessionStorage (separate key from main admin) */
  useEffect(() => {
    if (sessionStorage.getItem('stt_admin') === 'true') setIsAdmin(true)
  }, [])

  const handleLogin = () => {
    setIsAdmin(true)
    sessionStorage.setItem('stt_admin', 'true')
    setShowLogin(false)
  }
  const handleLogout = () => {
    setIsAdmin(false)
    sessionStorage.removeItem('stt_admin')
  }

  /* ── Generic save helper ── */
  const save = async (
    table: string,
    form: Record<string, unknown>,
    resetForm: () => void,
  ) => {
    const { id, ...fields } = form
    if (id) await supabase.from(table).update(fields).eq('id', id)
    else    await supabase.from(table).insert([fields])
    resetForm()
    load()
  }

  const remove = async (table: string, id: number) => {
    if (!confirm('Hapus data ini?')) return
    await supabase.from(table).delete().eq('id', id)
    load()
  }

  /* ── Finance totals ── */
  const totalIn  = finance.filter(r => r.type === 'penerimaan').reduce((s, r) => s + r.amount, 0)
  const totalOut = finance.filter(r => r.type === 'pengeluaran').reduce((s, r) => s + r.amount, 0)
  const balance  = totalIn - totalOut

  const displayedFinance =
    financeTab === 'semua'       ? finance :
    financeTab === 'penerimaan'  ? finance.filter(r => r.type === 'penerimaan') :
                                   finance.filter(r => r.type === 'pengeluaran')

  /* ── Filtered members ── */
  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter(m =>
      [m.name, m.education, m.parent_name, m.sex === 'L' ? 'laki' : 'perempuan']
        .join(' ').toLowerCase().includes(q)
    )
  }, [members, search])

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <span className="font-balinese text-5xl text-amber-400 animate-pulse">ᬒᬁ</span>
    </div>
  )

  /* ═══════════════════════════════════════ RENDER ═════════════════════════════════════ */
  return (
    <>
    <div className="fade-up space-y-6">

      {/* ── Page header ── */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="font-balinese text-amber-500 text-sm opacity-60 mb-1">ᬲᬾᬓᬵ ᬢ᭄ᬭᬸᬦ ᬢ᭄ᬭᬸᬦᬶ</div>
          <h1 className="font-inter font-bold text-slate-800 text-2xl leading-tight">STT Lontar Wilis</h1>
          <p className="font-garamond text-slate-500 text-sm mt-0.5">
            Sekaa Truna Truni · Banjar Adat Sental Kawan
          </p>
        </div>

        {/* Admin button — compact on mobile, label on sm+ */}
        <button
          onClick={() => isAdmin ? handleLogout() : setShowLogin(true)}
          className={`flex items-center gap-1.5 font-inter font-semibold text-sm px-3 py-1.5 rounded-lg transition-all shrink-0 whitespace-nowrap ${
            isAdmin
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
          }`}
        >
          {isAdmin ? (
            <><LockKeyOpen size={14} /> <span>Keluar</span></>
          ) : (
            <>
              <LockKey size={14} />
              {/* Full label on sm+, short on mobile */}
              <span className="hidden sm:inline">Admin STT</span>
              <span className="sm:hidden">STT</span>
            </>
          )}
        </button>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <span className="font-inter text-xs font-semibold text-emerald-700">● Mode Admin STT aktif</span>
          <span className="font-garamond text-emerald-600 text-sm ml-1">— Anda dapat mengedit seluruh konten halaman ini.</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — PENGURUS
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<UsersThree size={18} weight="fill" className="text-amber-600" />}
        title="Pengurus STT"
        badge={pengurus.length}
        color="bg-amber-50"
      >
        {/* Add button */}
        {isAdmin && !pengurusForm && (
          <div className="px-5 py-3 border-b border-slate-50">
            <button
              onClick={() => setPengurusForm({ role: 'Ketua', name: '', since: '', contact: '', note: '' })}
              className="flex items-center gap-1.5 text-xs font-inter font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Plus size={13} weight="bold" /> Tambah Pengurus
            </button>
          </div>
        )}

        {/* Inline form */}
        {isAdmin && pengurusForm && (
          <InlineForm
            title={pengurusForm.id ? 'Edit Pengurus' : 'Tambah Pengurus'}
            fields={[
              { key: 'role',    label: 'Jabatan', type: 'select',
                options: [
                  { value: 'Ketua',      label: 'Ketua'      },
                  { value: 'Sekretaris', label: 'Sekretaris' },
                  { value: 'Bendahara',  label: 'Bendahara'  },
                  { value: 'Lainnya',    label: 'Lainnya'    },
                ],
              },
              { key: 'name',    label: 'Nama Lengkap', type: 'text', placeholder: 'Nama pengurus' },
              { key: 'since',   label: 'Sejak (Tahun)', type: 'text', placeholder: '2024' },
              { key: 'contact', label: 'Nomor Kontak', type: 'text', placeholder: '+62 8xx…' },
              { key: 'note',    label: 'Catatan', type: 'textarea', placeholder: 'Keterangan…' },
            ]}
            data={pengurusForm}
            onSave={form => save('stt_pengurus', form, () => setPengurusForm(null))}
            onCancel={() => setPengurusForm(null)}
          />
        )}

        {/* Cards */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pengurus.map(p => (
            <div key={p.id} className="flex items-start gap-4 p-4 bg-white/70 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-100 to-amber-200 border-2 border-amber-300 flex items-center justify-center shrink-0">
                <span className="font-inter font-bold text-amber-700 text-sm">
                  {p.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-inter text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{p.role}</div>
                <div className="font-inter font-bold text-slate-800 text-sm leading-snug">{p.name}</div>
                {p.since && <div className="font-garamond text-slate-400 text-sm">Sejak {p.since}</div>}
                {p.note  && <div className="font-garamond text-slate-400 text-sm italic">{p.note}</div>}
                {p.contact && (
                  <a href={`tel:${p.contact}`} className="flex items-center gap-1 font-garamond text-amber-600 text-sm mt-1">
                    <Phone size={11} weight="fill" /> {p.contact}
                  </a>
                )}
              </div>
              {isAdmin && (
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setPengurusForm(p as unknown as Record<string,unknown>)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                    <PencilSimple size={12} />
                  </button>
                  <button onClick={() => remove('stt_pengurus', p.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                    <Trash size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {pengurus.length === 0 && (
            <p className="font-garamond text-slate-400 text-base col-span-2 py-4">Belum ada data pengurus.</p>
          )}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — ANGGOTA
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<UserList size={18} weight="fill" className="text-blue-600" />}
        title="Anggota STT"
        badge={members.length}
        color="bg-blue-50"
        defaultOpen={false}
      >
        {/* Add button */}
        {isAdmin && !memberForm && (
          <div className="px-5 py-3 border-b border-slate-50">
            <button
              onClick={() => setMemberForm({ name: '', birth_year: '', sex: 'L', education: '', parent_name: '' })}
              className="flex items-center gap-1.5 text-xs font-inter font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus size={13} weight="bold" /> Tambah Anggota
            </button>
          </div>
        )}

        {/* Inline form */}
        {isAdmin && memberForm && (
          <InlineForm
            title={memberForm.id ? 'Edit Anggota' : 'Tambah Anggota Baru'}
            fields={[
              { key: 'name',        label: 'Nama Lengkap',    type: 'text',   placeholder: 'Nama anggota' },
              { key: 'birth_year',  label: 'Tahun Lahir',     type: 'number', placeholder: '2005' },
              { key: 'sex',         label: 'Jenis Kelamin',   type: 'select',
                options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }] },
              { key: 'education',   label: 'Pendidikan',      type: 'select',
                options: [
                  { value: 'SD',          label: 'SD'                    },
                  { value: 'SMP',         label: 'SMP'                   },
                  { value: 'SMA/SMK',     label: 'SMA / SMK'             },
                  { value: 'D3',          label: 'D3'                    },
                  { value: 'S1',          label: 'S1'                    },
                  { value: 'S2',          label: 'S2'                    },
                  { value: 'Lainnya',     label: 'Lainnya'               },
                ],
              },
              { key: 'parent_name', label: 'Nama Orang Tua', type: 'text',   placeholder: 'Nama ayah / ibu' },
            ]}
            data={memberForm}
            onSave={form => save('stt_members', form, () => setMemberForm(null))}
            onCancel={() => setMemberForm(null)}
          />
        )}

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-50">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, pendidikan…"
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 bg-white font-inter text-sm text-slate-800 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {['No.', 'Nama', 'Th. Lahir', 'L/P', 'Pendidikan', 'Orang Tua', ''].map((h, i) => (
                  <th key={i} className="px-3 py-3 text-left font-inter text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m, i) => (
                <tr key={m.id} className="row-hover border-b border-slate-50">
                  <td className="px-3 py-2.5 font-inter text-slate-300 text-xs">{i + 1}</td>
                  <td className="px-3 py-2.5 font-inter font-semibold text-slate-800 text-sm">{m.name}</td>
                  <td className="px-3 py-2.5 font-garamond text-slate-500 text-sm">{m.birth_year ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-inter font-semibold px-2 py-0.5 rounded-full ${
                      m.sex === 'L' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                    }`}>
                      {m.sex === 'L' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-garamond text-slate-500 text-sm">{m.education ?? '—'}</td>
                  <td className="px-3 py-2.5 font-garamond text-slate-500 text-sm">{m.parent_name ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    {isAdmin && (
                      <div className="flex gap-1.5">
                        <button onClick={() => setMemberForm(m as unknown as Record<string,unknown>)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                          <PencilSimple size={12} />
                        </button>
                        <button onClick={() => remove('stt_members', m.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                          <Trash size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (
          <p className="font-garamond text-slate-400 text-center py-10 text-base">
            {search ? 'Tidak ada anggota ditemukan.' : 'Belum ada anggota terdaftar.'}
          </p>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — KEUANGAN
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<CurrencyCircleDollar size={18} weight="fill" className="text-emerald-600" />}
        title="Keuangan STT"
        color="bg-emerald-50"
        defaultOpen={false}
      >
        {/* Summary */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-50">
          <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ArrowDown size={14} weight="bold" className="text-emerald-600" />
              </div>
              <span className="font-inter text-xs font-semibold text-slate-500">Penerimaan</span>
            </div>
            <div className="font-inter font-bold text-emerald-600 text-lg break-all">{fmt(totalIn)}</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <ArrowUp size={14} weight="bold" className="text-red-500" />
              </div>
              <span className="font-inter text-xs font-semibold text-slate-500">Pengeluaran</span>
            </div>
            <div className="font-inter font-bold text-red-500 text-lg break-all">{fmt(totalOut)}</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-amber-50' : 'bg-red-50'}`}>
                <Scales size={14} weight="fill" className={balance >= 0 ? 'text-amber-600' : 'text-red-500'} />
              </div>
              <span className="font-inter text-xs font-semibold text-slate-500">Saldo</span>
            </div>
            <div className={`font-inter font-bold text-lg break-all ${balance >= 0 ? 'text-amber-600' : 'text-red-500'}`}>{fmt(balance)}</div>
          </div>
        </div>

        {/* Add button */}
        {isAdmin && !financeForm && (
          <div className="px-5 py-3 border-b border-slate-50">
            <button
              onClick={() => setFinanceForm({ date: '', description: '', category: 'Iuran', type: 'penerimaan', amount: 0 })}
              className="flex items-center gap-1.5 text-xs font-inter font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Plus size={13} weight="bold" /> Catat Transaksi
            </button>
          </div>
        )}

        {/* Finance inline form */}
        {isAdmin && financeForm && (
          <InlineForm
            title="Catat Transaksi"
            fields={[
              { key: 'date',        label: 'Tanggal',     type: 'date' },
              { key: 'description', label: 'Keterangan',  type: 'text', placeholder: 'Deskripsi transaksi' },
              { key: 'category',    label: 'Kategori',    type: 'select',
                options: [
                  { value: 'Iuran',     label: 'Iuran'     },
                  { value: 'Kegiatan',  label: 'Kegiatan'  },
                  { value: 'Donasi',    label: 'Donasi'    },
                  { value: 'Lainnya',   label: 'Lainnya'   },
                ],
              },
              { key: 'type', label: 'Jenis', type: 'select',
                options: [
                  { value: 'penerimaan',  label: '▲ Penerimaan (Masuk)'   },
                  { value: 'pengeluaran', label: '▼ Pengeluaran (Keluar)' },
                ],
              },
              { key: 'amount', label: 'Jumlah (Rp)', type: 'number', placeholder: '0' },
            ]}
            data={financeForm}
            onSave={form => save('stt_finance', form, () => setFinanceForm(null))}
            onCancel={() => setFinanceForm(null)}
          />
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {(['semua','penerimaan','pengeluaran'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFinanceTab(t)}
              className={`font-inter font-semibold text-xs px-4 py-3 border-b-2 transition-all whitespace-nowrap capitalize ${
                financeTab === t
                  ? t === 'semua'        ? 'text-amber-700 border-amber-500 bg-amber-50'
                  : t === 'penerimaan'   ? 'text-emerald-700 border-emerald-500 bg-emerald-50'
                  :                        'text-red-600 border-red-500 bg-red-50'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {t === 'semua' ? 'Semua' : t === 'penerimaan' ? '▲ Penerimaan' : '▼ Pengeluaran'}
            </button>
          ))}
        </div>

        {/* Finance table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {['Tanggal', 'Keterangan', 'Jenis', 'Jumlah', ''].map((h, i) => (
                  <th key={i} className="px-3 py-3 text-left font-inter text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedFinance.map(r => (
                <tr key={r.id} className="row-hover border-b border-slate-50">
                  <td className="px-3 py-2.5 font-garamond text-slate-400 text-sm whitespace-nowrap">{fmtDateShort(r.date)}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-garamond text-slate-700 text-sm">{r.description}</div>
                    <div className="font-garamond text-slate-400 text-xs">{r.category}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block text-xs font-inter font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      r.type === 'penerimaan' ? 'badge-seni' : 'badge-ngaben'
                    }`}>
                      {r.type === 'penerimaan' ? '▲' : '▼'}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 font-inter font-semibold text-sm text-right whitespace-nowrap ${
                    r.type === 'penerimaan' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {r.type === 'pengeluaran' && '− '}{fmt(r.amount)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {isAdmin && (
                      <button onClick={() => remove('stt_finance', r.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                        <Trash size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {displayedFinance.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/60">
                  <td colSpan={3} className="px-3 py-2.5 font-inter font-semibold text-slate-500 text-xs text-right">
                    {financeTab === 'semua' ? 'Saldo' : financeTab === 'penerimaan' ? 'Total Penerimaan' : 'Total Pengeluaran'}
                  </td>
                  <td className={`px-3 py-2.5 font-inter font-bold text-sm text-right whitespace-nowrap ${
                    financeTab === 'semua'
                      ? balance  >= 0 ? 'text-amber-600' : 'text-red-500'
                      : financeTab === 'penerimaan' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {fmt(financeTab === 'semua' ? balance : financeTab === 'penerimaan' ? totalIn : totalOut)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {displayedFinance.length === 0 && (
          <p className="font-garamond text-slate-400 text-center py-8 text-base">Belum ada catatan keuangan.</p>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — PENGUMUMAN
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<Megaphone size={18} weight="fill" className="text-violet-600" />}
        title="Pengumuman STT"
        badge={announce.length}
        color="bg-violet-50"
        defaultOpen={false}
      >
        {/* Add button */}
        {isAdmin && !announceForm && (
          <div className="px-5 py-3 border-b border-slate-50">
            <button
              onClick={() => setAnnounceForm({ title: '', date: '', content: '', important: false })}
              className="flex items-center gap-1.5 text-xs font-inter font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              <Plus size={13} weight="bold" /> Tambah Pengumuman
            </button>
          </div>
        )}

        {/* Announcement inline form */}
        {isAdmin && announceForm && (
          <InlineForm
            title={announceForm.id ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
            fields={[
              { key: 'title',     label: 'Judul',     type: 'text',     placeholder: 'Judul pengumuman' },
              { key: 'date',      label: 'Tanggal',   type: 'date' },
              { key: 'content',   label: 'Isi',       type: 'textarea', placeholder: 'Isi pengumuman…' },
              { key: 'important', label: 'Penting?',  type: 'checkbox' },
            ]}
            data={announceForm}
            onSave={form => save('stt_announcements', form, () => setAnnounceForm(null))}
            onCancel={() => setAnnounceForm(null)}
          />
        )}

        {/* Announcements list */}
        <div className="divide-y divide-slate-50">
          {announce.map(a => (
            <div key={a.id} className="px-5 py-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {a.important && (
                      <span className="badge-penting flex items-center gap-1 text-xs font-inter font-semibold px-2 py-0.5 rounded-full">
                        <Warning size={10} weight="fill" /> Penting
                      </span>
                    )}
                    <span className="font-garamond text-slate-400 text-sm">{fmtDate(a.date)}</span>
                  </div>
                  <h3 className="font-inter font-semibold text-slate-800 text-sm mb-1 leading-snug">{a.title}</h3>
                  <p className="font-garamond text-slate-600 text-sm leading-relaxed">
                    <AutoLink text={a.content} />
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setAnnounceForm(a as unknown as Record<string,unknown>)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                      <PencilSimple size={12} />
                    </button>
                    <button onClick={() => remove('stt_announcements', a.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                      <Trash size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {announce.length === 0 && (
            <p className="font-garamond text-slate-400 text-center py-8 text-base px-5">Belum ada pengumuman.</p>
          )}
        </div>
      </Section>

    </div>

    {/* STT Login Modal — outside fade-up to avoid transform stacking context */}
    {showLogin && <SttLoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </>
  )
}