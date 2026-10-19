"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import EditProductModal from "./EditProductModal"
import { DeleteProductButton } from "./DeleteProductButton"

interface ProductoItem {
  id: string
  nombre: string
  categoria: string
  precio: number
  stock: number
}

export function FilaProducto({ p }: { p: ProductoItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setIsModalOpen(false)
    router.refresh()
  }

  return (
    <>
      <tr className="hover:bg-slate-800/40 transition-colors">
        <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
        <td className="px-4 py-3">{p.categoria}</td>
        <td className="px-4 py-3 text-emerald-400 font-bold">${p.precio}</td>
        <td className="px-4 py-3">{p.stock} u.</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all"
            >
              Editar
            </button>
            <DeleteProductButton productId={p.id} productName={p.nombre} />
          </div>
        </td>
      </tr>

      <EditProductModal
        product={{
          id: p.id,
          name: p.nombre,
          category: p.categoria,
          price: p.precio,
          stock: p.stock,
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}