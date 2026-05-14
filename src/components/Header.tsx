'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  House, CalendarDots, Megaphone, CurrencyCircleDollar,
  UsersThree, UserList, LockKey, LockKeyOpen, List, X,
} from '@phosphor-icons/react'
import { useAdmin } from '@/context/AdminContext'
import AdminLoginModal from './AdminLoginModal'

const NAV = [
  { href: '/',              label: 'Beranda',    icon: House             },
  { href: '/events',        label: 'Kegiatan',   icon: CalendarDots      },
  { href: '/announcements', label: 'Pengumuman', icon: Megaphone         },
  { href: '/finance',       label: 'Keuangan',   icon: CurrencyCircleDollar },
  { href: '/prajuru',       label: 'Prajuru',    icon: UsersThree        },
  { href: '/members',       label: 'Anggota',    icon: UserList          },
]

export default function Header() {
  const pathname              = usePathname()
  const { isAdmin, logout }   = useAdmin()
  const [showLogin, setShowLogin] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <div className="font-balinese text-amber-500 text-xs opacity-60 mb-0.5">
                ᬒᬁ ᬲ᭄ᬯᬲ᭄ᬢᬶᬲ᭄ᬢᬸ
              </div>
              <h1 className="font-inter font-bold text-slate-800 text-[15px] leading-tight">
                Banjar Adat Sental Kawan
              </h1>
              <p className="font-garamond text-slate-400 text-xs">
                Desa Adat Ped · Nusa Penida · Klungkung · Bali
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <span className="hidden sm:block font-inter text-xs font-semibold text-emerald-600">
                  ● Mode Admin
                </span>
              )}

              {/* Admin button */}
              <button
                onClick={() => (isAdmin ? logout() : setShowLogin(true))}
                className={`flex items-center gap-1.5 font-inter font-semibold text-sm px-3 py-1.5 rounded-lg transition-all ${
                  isAdmin
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                }`}
              >
                {isAdmin
                  ? <><LockKeyOpen size={14} /> Keluar</>
                  : <><LockKey     size={14} /> Admin</>
                }
              </button>

              {/* Hamburger (mobile only) */}
              <button
                className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <List size={20} />}
              </button>
            </div>
          </div>

          {/* ── Desktop nav ── */}
          <nav className="hidden sm:flex gap-0.5 py-1.5 overflow-x-auto">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 font-inter font-semibold text-[11px] uppercase tracking-wider px-3 py-2 rounded-lg transition-all whitespace-nowrap border-b-2 ${
                    active
                      ? 'text-amber-700 bg-amber-50 border-amber-500'
                      : 'text-slate-400 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={13} weight={active ? 'fill' : 'regular'} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* ── Mobile nav (dropdown) ── */}
          {mobileOpen && (
            <nav className="sm:hidden flex flex-col gap-0.5 pb-3 pt-1.5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 font-inter font-semibold text-sm px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} weight={active ? 'fill' : 'regular'} />
                    {label}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>
      </header>

      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}