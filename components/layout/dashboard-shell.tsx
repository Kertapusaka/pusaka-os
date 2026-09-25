'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Building2, Calculator, Boxes, ClipboardList,
  ShieldCheck, Wallet, Image as ImageIcon, AlertTriangle, BookOpen, LogOut, Menu, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/projects', label: 'Projects', icon: Building2 },
  { href: '/rab', label: 'RAB & Quotations', icon: Calculator },
  { href: '/materials', label: 'Materials', icon: Boxes },
  { href: '/daily-reports', label: 'Daily Reports', icon: ClipboardList },
  { href: '/qc', label: 'QC & K3', icon: ShieldCheck },
  { href: '/finance', label: 'Finance', icon: Wallet },
  { href: '/photos', label: 'Photos', icon: ImageIcon },
  { href: '/ai-alerts', label: 'AI Alerts', icon: AlertTriangle },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
]

export function DashboardShell({
  children,
  fullName,
  role,
}: {
  children: React.ReactNode
  fullName: string
  role: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 md:flex">
        <div className="font-heading p-4 text-lg font-bold text-white">
          Kerta Pusaka <span className="text-orange-500">AI OS</span>
        </div>
        {nav}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 flex w-64 flex-col bg-slate-900">
            <div className="font-heading flex items-center justify-between p-4 text-lg font-bold text-white">
              Kerta Pusaka
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-medium text-slate-900">{fullName}</div>
              <div className="text-xs capitalize text-slate-500">{role.replace(/_/g, ' ')}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
