# ᬒᬁ Banjar Adat Sental Kawan — Web App

**Platform Administrasi Digital Banjar Adat Sental Kawan**  
Desa Adat Ped · Kecamatan Nusa Penida · Kabupaten Klungkung · Provinsi Bali · Indonesia

---

## 🪷 Overview

This is a full-stack web application built to digitalize the administrative operations of **Banjar Adat Sental Kawan**, a traditional Balinese community organization (*banjar adat*). The platform allows community members (*krama*) to access upcoming ceremonial schedules, financial records, official announcements, and leadership information — while giving designated administrators the ability to manage all content securely.

Live URL: **[https://banjar-sental-kawan.vercel.app](https://banjar-sental-kawan.vercel.app)**

---

## ✨ Features

| Feature | Description |
|---|---|
| **Beranda (Home)** | Hero section with live stats — total krama, upcoming events, kas balance, and announcement count pulled from Supabase |
| **Kegiatan (Events)** | Chronological list of upcoming and past ceremonies/activities with type badges (Upacara, Ngaben, Kesenian, Rapat) |
| **Pengumuman (Announcements)** | Official notices with priority tagging for important announcements |
| **Keuangan (Finance)** | Full financial ledger with Pemasukan/Pengeluaran tracking, category breakdown, and running balance |
| **Prajuru (Leadership)** | Leadership hierarchy (Kelian, Penyarikan, Patengen, Kasinoman) and Pemangku/Pedanda priests |
| **Anggota (Members)** | Searchable registry of 127 krama with status, KK number, and address |
| **Admin Mode** | Password-protected admin login enabling full CRUD operations on all data sections |

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router) | Full-stack React framework with file-based routing |
| **Language** | TypeScript | Type-safe development across all files |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with custom glassmorphism classes |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) | Persistent data storage and real-time queries |
| **Auth** | Custom session-based (React Context + `sessionStorage`) | Lightweight admin login without third-party auth overhead |
| **Icons** | [Phosphor Icons](https://phosphoricons.com) | Consistent, well-designed icon set |
| **Fonts** | Google Fonts via `next/font` | Noto Sans Balinese, Inter, Cormorant Garamond |
| **Deployment** | [Vercel](https://vercel.com) | Zero-config deployment with automatic CI/CD from GitHub |

---

### Project Structure

```
banjar-sental-kawan/
│
├── src/
│   ├── app/                          # Next.js App Router — all pages live here
│   │   ├── layout.tsx                # Root layout: fonts, AdminProvider, Header, background blobs
│   │   ├── page.tsx                  # Beranda (Home) — stats + upcoming events
│   │   ├── globals.css               # Global styles: glassmorphism, badges, animations, fonts
│   │   ├── events/
│   │   │   └── page.tsx              # Kegiatan — ceremonies & activities CRUD
│   │   ├── announcements/
│   │   │   └── page.tsx              # Pengumuman — notices & regulations CRUD
│   │   ├── finance/
│   │   │   └── page.tsx              # Keuangan — financial ledger CRUD
│   │   ├── prajuru/
│   │   │   └── page.tsx              # Prajuru & priests CRUD
│   │   └── members/
│   │       └── page.tsx              # Anggota krama — searchable registry CRUD
│   │
│   ├── components/                   # Shared UI components
│   │   ├── Header.tsx                # Sticky nav bar with mobile hamburger & admin button
│   │   ├── AdminLoginModal.tsx       # Password modal for admin authentication
│   │   └── EditModal.tsx             # Reusable dynamic form modal for all CRUD operations
│   │
│   ├── context/
│   │   └── AdminContext.tsx          # React Context — isAdmin state, login(), logout()
│   │
│   └── lib/
│       ├── supabase.ts               # Supabase client initialisation
│       └── types.ts                  # TypeScript interfaces for all data models
│
├── public/                           # Static assets (favicon, images)
├── .env.local                        # 🔒 Local secrets — never committed to Git
├── .gitignore
├── next.config.ts
├── tsconfig.json                     # TypeScript config with @/* path alias
├── postcss.config.mjs
├── package.json
└── README.md
```

---

### Data Architecture — Supabase Tables

All data is stored in a **PostgreSQL** database hosted on Supabase. The schema consists of six tables:

```sql
members         — Krama registry (name, kk, status, address)
events          — Ceremonies & activities (title, date, location, type)
announcements   — Official notices (title, content, date, important flag)
finance         — Financial ledger (date, description, category, type, amount)
prajuru         — Leadership officials (role, name, since, contact, note)
priests         — Pemangku & Pedanda (title, name, specialty, contact)
```

Each table uses Supabase's auto-generated `id` (bigint, identity) and `created_at` (timestamptz) columns.

---

### Authentication Flow

This app uses a **lightweight custom authentication** approach rather than a full auth provider, appropriate for a single-organization admin system:

```
User clicks "Admin" button
        ↓
AdminLoginModal renders (React state)
        ↓
User submits password
        ↓
AdminContext.login() checks password against ADMIN_PASSWORD constant
        ↓
  ✅ Match → setIsAdmin(true) + sessionStorage.setItem('bask_admin','true')
  ❌ No match → show error message
        ↓
isAdmin state propagates via React Context to all components
        ↓
CRUD buttons (Edit, Hapus, Tambah) appear across all pages
        ↓
User closes tab / clicks "Keluar" → sessionStorage cleared, isAdmin = false
```

> **Security note:** The admin password is stored as a constant in `src/context/AdminContext.tsx`. For production use with multiple admins, this should be migrated to Supabase Auth with Row Level Security (RLS) policies.

---

### Component Architecture

```
layout.tsx (Root — AdminProvider wraps everything)
│
├── BgLayer (fixed decorative gradient blobs)
├── Header.tsx
│   ├── Branding (title, Balinese script, location)
│   ├── NavLinks (Beranda, Kegiatan, Pengumuman, Keuangan, Prajuru, Anggota)
│   ├── Admin Button → AdminLoginModal.tsx
│   └── Hamburger Menu (mobile)
│
└── <Page> (rendered per route)
    ├── page.tsx (Beranda)
    ├── events/page.tsx → EditModal.tsx
    ├── announcements/page.tsx → EditModal.tsx
    ├── finance/page.tsx → EditModal.tsx
    ├── prajuru/page.tsx → EditModal.tsx
    └── members/page.tsx → EditModal.tsx
```

The **`EditModal`** component is fully generic — it accepts a `fields: FieldConfig[]` array and `initialData` object, rendering the appropriate input type (text, date, number, textarea, select, checkbox) for each field. All six CRUD pages share this single modal component.

---

### Design System

The UI is built around a **glassmorphism light theme**:

| Token | Value | Used For |
|---|---|---|
| `glass-card` | `rgba(255,255,255,0.78)` + `blur(16px)` | All content cards |
| `glass-header` | `rgba(255,255,255,0.92)` + `blur(20px)` | Sticky navigation |
| Amber accent | `#d97706` / `#f59e0b` | Buttons, active states, Balinese script |
| Background | Warm cream → indigo gradient + 4 glow blobs | Page background |
| **Noto Sans Balinese** | Cultural script labels, Om symbols | Traditional script display |
| **Inter** | Headings, buttons, badges, labels | Modern Latin UI text |
| **Cormorant Garamond** | Body text, descriptions, table content | Elegant readable prose |

---

### Routing

Next.js App Router file-based routing — no manual route configuration needed:

| URL | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Beranda — home dashboard |
| `/events` | `src/app/events/page.tsx` | Kegiatan list |
| `/announcements` | `src/app/announcements/page.tsx` | Pengumuman list |
| `/finance` | `src/app/finance/page.tsx` | Keuangan ledger |
| `/prajuru` | `src/app/prajuru/page.tsx` | Prajuru & priests |
| `/members` | `src/app/members/page.tsx` | Anggota krama |

---

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |

Both are prefixed with `NEXT_PUBLIC_` making them available in client-side code. They are stored in `.env.local` for local development and added directly to Vercel's environment variables dashboard for production.

---

## 🚀 Local Development

**Prerequisites:** Node.js 18+, Git

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/banjar-sental-kawan.git
cd banjar-sental-kawan

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Then fill in your Supabase URL and anon key

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

This project is deployed on **Vercel** with automatic CI/CD:

```bash
# Every push to main triggers a Vercel redeploy
git add .
git commit -m "your change description"
git push
```

Vercel build settings (auto-detected, no changes needed):
- **Framework:** Next.js
- **Build command:** `next build`
- **Output directory:** `.next`

---

## 🌱 Seeding Member Data

The **Anggota** page includes a one-click **"Import 127 Krama"** button visible only to admins when the members table is empty. It seeds all 127 krama names from the official Banjar Adat Sental Kawan member registry (sourced from `krama_banjar_sental_kawan.pdf`) directly into Supabase. The button disappears automatically once data exists.

---

## 🛣️ Roadmap

- [ ] Migrate admin auth to Supabase Auth with Row Level Security
- [ ] Multi-admin user management with individual accounts
- [ ] WhatsApp / email notifications for upcoming ceremonies
- [ ] Monthly financial report export to PDF
- [ ] Income vs. expense chart visualization
- [ ] Iuran (dues) tracking per individual krama
- [ ] Photo gallery for ceremonies and events
- [ ] Full Balinese script language toggle
- [ ] Progressive Web App (PWA) for offline mobile access
- [ ] Custom domain (`sentalkawan.id`)

---

## 🙏 Cultural Context

**Banjar Adat** is a foundational institution of Balinese Hindu society — a neighborhood-level organization that coordinates religious ceremonies, community welfare, gamelan music, conflict resolution, and traditional governance. This application is built to honor and preserve that tradition by making its administration more accessible while maintaining the cultural identity of Banjar Adat Sental Kawan through the use of Balinese script (*Aksara Bali*) and traditional design motifs throughout the interface.

---

## 📄 License

This project is privately maintained by the administrative team of **Banjar Adat Sental Kawan**, Desa Adat Ped, Nusa Penida, Klungkung, Bali, Indonesia.

---

*ᬒᬁ ᬰᬦ᭄ᬢᬶ ᬰᬦ᭄ᬢᬶ ᬰᬦ᭄ᬢᬶ — Om Shanti Shanti Shanti*
