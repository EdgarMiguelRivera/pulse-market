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

  // Consulta paginada directo desde el servidor (SLA < 400ms)
  const { data, count, error } = await supabase
    .from('productos')
    .select('id, nombre, categoria, precio, stock', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(desde, hasta);

  const productos = data as ProductoItem[] | null;

  if (error) {
    return <div className="p-4 text-red-500">Error cargando productos: {error.message}</div>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Catálogo de Productos ({count} activos)</h2>
        <span className="text-xs text-gray-400">Página {pagina} de {Math.ceil((count || 0) / porPagina)}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {productos?.map((p: ProductoItem) => (
              <tr key={p.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                <td className="px-4 py-3">{p.categoria}</td>
                <td className="px-4 py-3 text-green-400 font-bold">${p.precio}</td>
                <td className="px-4 py-3">{p.stock} u.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}