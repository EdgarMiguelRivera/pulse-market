"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

interface Cliente {
  id: string
  nombre: string
  email: string
}

interface Producto {
  id: string
  nombre: string
  precio: number
  stock: number
}

export function FormVenta() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  const [searchCliente, setSearchCliente] = useState("")
  const [searchProducto, setSearchProducto] = useState("")

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)

  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Función para recargar datos frescos desde Supabase con tipado estricto
  const fetchData = async () => {
    const { data: dataClientes } = await supabase
      .from("clientes")
      .select("id, nombre, email")
      .order("created_at", { ascending: false })

    const { data: dataProductos } = await supabase
      .from("productos")
      .select("id, nombre, precio, stock")
      .is("deleted_at", null)
      .gt("stock", 0)

    if (dataClientes) setClientes(dataClientes as Cliente[])
    if (dataProductos) setProductos(dataProductos as Producto[])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filtrar listas según la búsqueda del usuario
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
      c.email.toLowerCase().includes(searchCliente.toLowerCase())
  )

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchProducto.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!clienteSeleccionado) {
      setError("Por favor selecciona un cliente válido de la lista.")
      return
    }

    if (!productoSeleccionado) {
      setError("Por favor selecciona un producto válido de la lista.")
      return
    }

    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0.")
      return
    }

    if (cantidad > productoSeleccionado.stock) {
      setError(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`)
      return
    }

    setLoading(true)
    const montoTotal = productoSeleccionado.precio * cantidad

    try {
      // 1. Insertar la Venta en el historial
      const { error: errorVenta } = await supabase.from("ventas").insert([
        {
          cliente_id: clienteSeleccionado.id,
          producto_id: productoSeleccionado.id,
          cantidad: cantidad,
          monto: montoTotal,
        },
      ])

      if (errorVenta) throw new Error(`Error en ventas: ${errorVenta.message}`)

      // 2. Generar la Orden para el Kanban
      const { error: errorOrden } = await supabase.from("ordenes").insert([
        {
          cliente_id: clienteSeleccionado.id,
          producto_id: productoSeleccionado.id,
          cantidad: cantidad,
          monto: montoTotal,
          estado: "pendiente",
        },
      ])

      if (errorOrden) throw new Error(`Error en ordenes: ${errorOrden.message}`)

      // 3. Descontar el Stock del producto
      const { error: errorStock } = await supabase
        .from("productos")
        .update({ stock: productoSeleccionado.stock - cantidad })
        .eq("id", productoSeleccionado.id)

      if (errorStock) throw new Error(`Error en stock: ${errorStock.message}`)

      alert("¡Venta y Orden generadas correctamente!")

      // Resetear campos
      setSearchCliente("")
      setSearchProducto("")
      setClienteSeleccionado(null)
      setProductoSeleccionado(null)
      setCantidad(1)

      // Recargar datos locales y refrescar Server Components
      await fetchData()
      router.refresh()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error inesperado al procesar la venta.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-200 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">🛒 Nueva Venta y Orden</h2>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Campo Autocompletar Cliente */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Cliente</label>
          <input
            type="text"
            placeholder="Escribe el nombre o correo..."
            onFocus={fetchData}
            value={clienteSeleccionado ? `${clienteSeleccionado.nombre} (${clienteSeleccionado.email})` : searchCliente}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchCliente(e.target.value)
              setClienteSeleccionado(null)
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          {searchCliente && !clienteSeleccionado && (
            <ul className="absolute z-10 w-full bg-slate-900 border border-slate-800 rounded-lg max-h-40 overflow-y-auto mt-1 shadow-2xl">
              {clientesFiltrados.length === 0 ? (
                <li className="px-3 py-2 text-xs text-slate-500">Sin resultados</li>
              ) : (
                clientesFiltrados.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => {
                      setClienteSeleccionado(c)
                      setSearchCliente("")
                    }}
                    className="px-3 py-2 text-xs hover:bg-indigo-600/30 cursor-pointer text-slate-200 border-b border-slate-800/50"
                  >
                    <div className="font-medium">{c.nombre}</div>
                    <div className="text-[10px] text-slate-400">{c.email}</div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Campo Autocompletar Producto */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Producto</label>
          <input
            type="text"
            placeholder="Escribe el nombre del producto..."
            onFocus={fetchData}
            value={productoSeleccionado ? `${productoSeleccionado.nombre} ($${productoSeleccionado.precio})` : searchProducto}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchProducto(e.target.value)
              setProductoSeleccionado(null)
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          {searchProducto && !productoSeleccionado && (
            <ul className="absolute z-10 w-full bg-slate-900 border border-slate-800 rounded-lg max-h-40 overflow-y-auto mt-1 shadow-2xl">
              {productosFiltrados.length === 0 ? (
                <li className="px-3 py-2 text-xs text-slate-500">Sin resultados</li>
              ) : (
                productosFiltrados.map((p) => (
                  <li
                    key={p.id}
                    onClick={() => {
                      setProductoSeleccionado(p)
                      setSearchProducto("")
                    }}
                    className="px-3 py-2 text-xs hover:bg-indigo-600/30 cursor-pointer text-slate-200 border-b border-slate-800/50"
                  >
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-[10px] text-emerald-400">${p.precio} | Stock: {p.stock} u.</div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Cantidad</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCantidad(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 h-[38px]"
        >
          {loading ? "Generando..." : "Completar Venta"}
        </button>
      </form>
    </div>
  )
}