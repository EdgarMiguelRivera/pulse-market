"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { supabase } from "../lib/supabase"

const clienteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
})

export function FormCliente() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar datos con Zod
    const result = clienteSchema.safeParse({ nombre, email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from("clientes")
        .insert([{ nombre, email }])

      if (insertError) throw new Error(insertError.message)

      setNombre("")
      setEmail("")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al crear el usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-200 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Registrar Nuevo Cliente</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo</label>
          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
          <input
            type="email"
            placeholder="cliente@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Cliente"}
        </button>
      </form>
    </div>
  )
}