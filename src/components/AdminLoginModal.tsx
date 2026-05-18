'use client'

import { useState } from 'react'
import { LockKey, X } from '@phosphor-icons/react'
import { useAdmin } from '@/context/AdminContext'

export default function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')

  const handleSubmit = () => {
    if (login(password)) {
      onClose()
    } else {
      setError('Kata sandi salah. Silakan coba lagi.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-5 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-sm p-8 fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-7">
          <div>
            <div className="font-balinese text-amber-500 text-3xl mb-1">ᬒᬁ</div>
            <h2 className="font-inter font-bold text-slate-800 text-lg leading-tight">
              Login Admin
            </h2>
            <p className="font-garamond text-slate-400 text-sm mt-0.5">
              Banjar Adat Sental Kawan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="font-inter text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Masukkan kata sandi admin"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-inter text-sm transition-all"
            />
            {error && (
              <p className="text-red-500 font-inter text-xs mt-1.5">{error}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-inter font-semibold text-sm py-2.5 rounded-lg transition-all shadow-sm"
          >
            <LockKey size={16} weight="fill" />
            Masuk
          </button>
        </div>
      </div>
    </div>
  )
}