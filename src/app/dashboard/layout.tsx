import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { LogOut, BarChart3 } from "lucide-react"
import { SidebarNav } from "./SidebarNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <BarChart3 className="h-7 w-7 text-indigo-500" />
            <span className="text-xl font-bold tracking-wide text-white">PulseMarket</span>
          </div>

          <SidebarNav />
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                className="h-8 w-8 rounded-full border border-slate-700"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-white truncate">
                {session.user.name || "Usuario"}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {session.user.email}
              </span>
            </div>
          </div>

          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 px-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Panel Analítico e-Commerce</h2>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            Sistema en Línea
          </span>
        </header>

        <main className="p-8 flex-1">
          <Suspense fallback={<div className="text-slate-400 animate-pulse">Cargando módulo...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}