import { supabase } from '../../../lib/supabase'
import { FormCliente } from '../../../components/FormCliente'
export const instant = false;

interface UsersPageProps {
  searchParams: Promise<{ page?: string }>
}

interface ClienteItem {
  id: string
  nombre: string
  email: string
  created_at: string
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const porPagina = 10
  const desde = (page - 1) * porPagina
  const hasta = desde + porPagina - 1

  const { data, count, error } = await supabase
    .from('clientes')
    .select('id, nombre, email, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(desde, hasta)

  const users = (data as ClienteItem[]) || []
  const totalPaginas = Math.ceil((count || 0) / porPagina)

  if (error) {
    return (
      <div className="p-4 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">
        Error al cargar usuarios: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Directorio de Usuarios</h1>
          <p className="text-sm text-slate-400">
            Clientes registrados e interactuando en la plataforma ({count || 0} totales)
          </p>
        </div>
      </div>

      {/* Formulario de Alta de Usuario */}
      <FormCliente />

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4">ID de Cliente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha de Registro</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{u.nombre}</td>
                  <td className="px-6 py-4 text-indigo-300">{u.email}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {u.id.length > 12 ? `${u.id.substring(0, 8)}...` : u.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/dashboard/sales?search=${encodeURIComponent(u.email)}`}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Ver Ventas
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-800 mt-4">
          <span className="text-xs text-slate-400">
            Página {page} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <a
              href={`/dashboard/users?page=${page - 1}`}
              className={`px-3 py-1.5 bg-slate-800 text-xs rounded-lg text-slate-200 ${
                page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700'
              }`}
            >
              Anterior
            </a>
            <a
              href={`/dashboard/users?page=${page + 1}`}
              className={`px-3 py-1.5 bg-slate-800 text-xs rounded-lg text-slate-200 ${
                page >= totalPaginas ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700'
              }`}
            >
              Siguiente
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}