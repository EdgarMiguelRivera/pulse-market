'use client'

import { useState } from 'react'
import { createProduct } from '../app/dashboard/products/actions'

export function FormProducto() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [mensaje, setMensaje] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMensaje(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      nombre: formData.get('nombre') as string,
      categoria: formData.get('categoria') as string,
      precio: Number(formData.get('precio')),
      stock: Number(formData.get('stock')),
    }

    const res = await createProduct(rawData)

    if (!res.success) {
      if (res.errors) {
        setErrors(res.errors as Record<string, string[]>)
      } else if (res.message) {
        setMensaje(`Error: ${res.message}`)
      }
    } else {
      setMensaje('¡Producto creado exitosamente!')
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-4">Crear Nuevo Producto</h2>

      {mensaje && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${mensaje.startsWith('Error') ? 'bg-rose-950/50 text-rose-300 border border-rose-800' : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nombre del Producto</label>
          <input
            name="nombre"
            type="text"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            placeholder="Ej. Teclado Mecánico RGB"
          />
          {errors.nombre && <p className="text-xs text-rose-400 mt-1">{errors.nombre[0]}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Categoría</label>
            <input
              name="categoria"
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Ej. Periféricos"
            />
            {errors.categoria && <p className="text-xs text-rose-400 mt-1">{errors.categoria[0]}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Precio ($)</label>
            <input
              name="precio"
              type="number"
              step="0.01"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="99.99"
            />
            {errors.precio && <p className="text-xs text-rose-400 mt-1">{errors.precio[0]}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Stock</label>
            <input
              name="stock"
              type="number"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="50"
            />
            {errors.stock && <p className="text-xs text-rose-400 mt-1">{errors.stock[0]}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Guardando en Supabase...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  )
}