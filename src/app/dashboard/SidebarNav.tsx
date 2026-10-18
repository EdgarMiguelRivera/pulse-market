"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Users } from "lucide-react"

export function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "General", icon: LayoutDashboard },
    { href: "/dashboard/sales", label: "Ventas", icon: ShoppingBag },
    { href: "/dashboard/users", label: "Usuarios", icon: Users },
    { href: "/dashboard/kanban", label: "Kanban", icon: LayoutDashboard },
  ]

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}