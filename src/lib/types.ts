export interface KramaMember {
  id: number
  name: string
  kk: string
  status: string
  address: string
  created_at?: string
}

export interface BanjarEvent {
  id: number
  title: string
  balinese?: string
  date: string
  location: string
  description: string
  type: 'upacara' | 'ngaben' | 'seni' | 'rapat'
  created_at?: string
}

export interface Announcement {
  id: number
  title: string
  date: string
  content: string
  important: boolean
  created_at?: string
}

export interface FinanceRecord {
  id: number
  date: string
  description: string
  category: string
  type: 'pemasukan' | 'pengeluaran'
  amount: number
  created_at?: string
}

export interface Prajuru {
  id: number
  role: string
  balinese?: string
  name: string
  since: string
  contact?: string
  note?: string
  created_at?: string
}

export interface Priest {
  id: number
  title: string
  name: string
  specialty?: string
  contact?: string
  created_at?: string
}