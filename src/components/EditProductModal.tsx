"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { productSchema } from "../lib/validations/product"
interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

interface EditProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
      })
      setErrors({})
    }
  }, [product])

  if (!isOpen || !product) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validar datos con Zod
    const result = productSchema.safeParse(formData)
    if (!result.success) {
      const formattedErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(formattedErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // Actualización directa en la tabla 'productos' de Supabase
      const { error } = await supabase
        .from("productos")
        .update({
          nombre: formData.name,
          categoria: formData.category,
          precio: formData.price,
          stock: formData.stock,
        })
        .eq("id", product.id)

      if (error) {
        throw new Error(error.message)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Error al actualizar:", err)
      alert(`Ocurrió un error al guardar los cambios: ${err.message || err}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#13192e] border border-slate-800 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Editar Producto</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg bg-[#0b0f19] border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-lg bg-[#0b0f19] border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.category && (
                <p className="text-xs text-rose-400 mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Precio ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg bg-[#0b0f19] border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.price && (
                <p className="text-xs text-rose-400 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg bg-[#0b0f19] border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.stock && (
                <p className="text-xs text-rose-400 mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs rounded-lg bg-indigo-600 font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}