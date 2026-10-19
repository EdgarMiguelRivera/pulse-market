"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el producto "${productName}"?`
    )
    if (!confirmed) return

    setIsDeleting(true)

    try {
      // Soft Delete: Se marca deleted_at con el timestamp actual
      const { error } = await supabase
        .from("productos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", productId)

      if (error) throw new Error(error.message)

      router.refresh()
    } catch (err: any) {
      alert(`Error al eliminar el producto: ${err.message || err}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
    >
      {isDeleting ? "..." : "Eliminar"}
    </button>
  )
}