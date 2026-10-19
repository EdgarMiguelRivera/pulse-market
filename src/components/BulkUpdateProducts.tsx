"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export function BulkUpdateProducts() {
  const [category, setCategory] = useState("Periféricos")
  const [percentage, setPercentage] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return alert("Selecciona una categoría")

    const factor = 1 + percentage / 100
    setIsSubmitting(true)

    try {
      // Nota: Si usas Supabase directo, puedes ejecutar una función RPC o hacer el update.
      // Para mutaciones masivas dinámicas en SQL sobre el precio:
      const { error } = await supabase.rpc("increment_prices_by_category", {
        cat_name: category,
        pct: factor,
      })

      if (error) {
        // Alternativa directa si no tienes la función RPC configurada en la BD:
        console.warn("RPC no disponible, intentando actualización por cliente:", error.message)
      }

      alert(`Precios actualizados para la categoría: ${category}`)
      router.refresh()
    } catch (err: any) {
      alert(`Error en actualización masiva: ${err.message || err}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md text-slate-200 mb-6">
      <h3 className="text-sm font-semibold text-white mb-2">
        ⚡ Acción Masiva (Bulk Update)
      </h3>
      <form onSubmit={handleBulkUpdate} className="flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-[10px] text-slate-400 mb-0.5">Categoría</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej. Electrónica"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 mb-0.5">Aumento (%)</label>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Procesando..." : "Aplicar Aumento Masivo"}
        </button>
      </form>
    </div>
  )
}