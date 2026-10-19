import { FormProducto } from '../../../components/FormProducto'
import { TablaProductos } from '../../../components/TablaProductos'
import { BulkUpdateProducts } from '../../../components/BulkUpdateProducts'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestión de Productos</h1>
        <p className="text-sm text-slate-400">
          Alta de productos con validación Zod, acciones masivas y catálogo paginado desde el servidor.
        </p>
      </div>

      <FormProducto />

      <BulkUpdateProducts />

      <TablaProductos pagina={page} porPagina={10} />
    </div>
  )
}