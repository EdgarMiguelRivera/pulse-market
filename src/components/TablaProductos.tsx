import { supabase } from '../lib/supabase';

interface TablaProductosProps {
  pagina?: number;
  porPagina?: number;
}

interface ProductoItem {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
}

export async function TablaProductos({ pagina = 1, porPagina = 10 }: TablaProductosProps) {
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  const { data, count, error } = await supabase
    .from('productos')
    .select('id, nombre, categoria, precio, stock', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(desde, hasta);

  const productos = data as ProductoItem[] | null;
  const totalPaginas = Math.ceil((count || 0) / porPagina);

  if (error) {
    return <div className="p-4 text-rose-500">Error cargando productos: {error.message}</div>;
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Catálogo de Productos ({count} activos)</h2>
        <span className="text-xs text-slate-400">Página {pagina} de {totalPaginas}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {productos?.map((p: ProductoItem) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                <td className="px-4 py-3">{p.categoria}</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">${p.precio}</td>
                <td className="px-4 py-3">{p.stock} u.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <div className="flex justify-between items-center pt-6">
        <a
          href={`/dashboard/products?page=${pagina - 1}`}
          className={`px-4 py-2 bg-slate-800 text-sm rounded-lg text-slate-200 ${pagina <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700'}`}
        >
          Anterior
        </a>
        <a
          href={`/dashboard/products?page=${pagina + 1}`}
          className={`px-4 py-2 bg-slate-800 text-sm rounded-lg text-slate-200 ${pagina >= totalPaginas ? 'pointer-events-none opacity-50' : 'hover:bg-slate-700'}`}
        >
          Siguiente
        </a>
      </div>
    </div>
  );
}