import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard - PulseMarket</h1>
          <p className="text-sm text-slate-400">
            Bienvenido, {session.user.name || session.user.email}
          </p>
        </div>

        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-red-600/20 border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-600/30 transition"
          >
            Cerrar Sesión
          </button>
        </form>
      </header>

      <main className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-sm text-slate-400">Ventas Totales</h3>
            <p className="text-3xl font-bold mt-2">$0.00</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-sm text-slate-400">Ordenes</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-sm text-slate-400">Usuarios Activos</h3>
            <p className="text-3xl font-bold mt-2">1</p>
          </div>
        </div>
      </main>
    </div>
  )
}