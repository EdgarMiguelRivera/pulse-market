import { supabase } from '../../../lib/supabase'
import { FormVenta } from '../../../components/FormVenta'

interface VentaItem {
  id: string
  monto: number
  cantidad: number
  fecha_venta: string
  clientes: { nombre: string; email: string } | null
  productos: { nombre: string; categoria: string } | null
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; desde?: string; hasta?: string }>
}) {
  const params = await searchParams
  const pagina = Number(params.page) || 1
  const busqueda = params.search || ''
  const fechaDesde = params.desde || ''
  const fechaHasta = params.hasta || ''
  
  const porPagina = 10
  const desde = (pagina - 1) * porPagina
  const hasta = desde + porPagina - 1

  // Consulta dinámica con relaciones
  let query = supabase
    .from('ventas')
    .select(
      'id, monto, cantidad, fecha_venta, clientes!inner(nombre, email), productos(nombre, categoria)',
      { count: 'exact' }
    )

  // Filtro por email/nombre de cliente
  if (busqueda) {
    query = query.ilike('clientes.email', `%${busqueda}%`)
  }

  // Filtros por rango de fecha
  if (fechaDesde) {
    query = query.gte('fecha_venta', `${fechaDesde}T00:00:00`)
  }
  if (fechaHasta) {
    query = query.lte('fecha_venta', `${fechaHasta}T23:59:59`)
  }

  const { data, count, error } = await query
    .order('fecha_venta', { ascending: false })
    .range(desde, hasta)

  const sales = (data as unknown as VentaItem[]) || []
  const totalPaginas = Math.ceil((count || 0) / porPagina)

  if (error) {
    return <div className="p-4 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">Error cargando ventas: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Módulo de Ventas</h1>
          <p className="text-sm text-slate-400">
            Administración y filtrado en tiempo real ({count || 0} ventas encontradas)
          </p>
        </div>

        <span className="text-xs text-slate-400">
          Página {pagina} de {totalPaginas || 1}
        </span>
      </div>

      {/* Formulario de registro */}
      <FormVenta />

      {/* Bar de Filtros por Fecha y Búsqueda */}
      <form method="GET" action="/dashboard/sales" className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-end gap-4 shadow-xl">
        {busqueda && <input type="hidden" name="search" value={busqueda} />}
        
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Desde</label>
          <input
            type="date"
            name="desde"
            defaultValue={fechaDesde}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Hasta</label>
          <input
            type="date"
            name="hasta"
            defaultValue={fechaHasta}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors"
        >
          Filtrar
        </button>

        {(fechaDesde || fechaHasta || busqueda) && (
          <a
            href="/dashboard/sales"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors"
          >
            ✕ Limpiar Filtros
          </a>
        )}
      </form>

      {/* Tabla de ventas */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Cantidad</th>
              <th className="px-6 py-4">Monto</th>
              <th className="px-6 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No se encontraron ventas en el rango de fechas seleccionado.
                </td>
              </tr>
            ) : (
              sales.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {item.clientes?.nombre || 'Cliente Anónimo'}
                    <span className="block text-xs text-indigo-400">{item.clientes?.email}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {item.productos?.nombre || 'Producto General'}
                    <span className="block text-xs text-slate-500">{item.productos?.categoria}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.cantidad} u.</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">${item.monto}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(item.fecha_venta).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <div className="flex justify-between items-center pt-4">
        <a
          href={`/dashboard/sales?page=${pagina - 1}${busqueda ? `&search=${encodeURIComponent(busqueda)}` : ''}${fechaDesde ? `&desde=${fechaDesde}` : ''}${fechaHasta ? `&hasta=${fechaHasta}` : ''}`}
          className={`px-4 py-2 bg-slate-800 text-sm rounded-lg ${
            pagina <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700'
          }`}
        >
          Anterior
        </a>
        <a
          href={`/dashboard/sales?page=${pagina + 1}${busqueda ? `&search=${encodeURIComponent(busqueda)}` : ''}${fechaDesde ? `&desde=${fechaDesde}` : ''}${fechaHasta ? `&hasta=${fechaHasta}` : ''}`}
          className={`px-4 py-2 bg-slate-800 text-sm rounded-lg ${
            pagina >= totalPaginas ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700'
          }`}
        >
          Siguiente
        </a>
      </div>
    </div>
  )
}