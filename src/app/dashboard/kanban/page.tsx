"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { getKanbanTasks, updateTaskStatus, createOrderAction } from "./actions"
import { supabase } from "../../../lib/supabase"

type Task = {
  id: string
  title: string
  customer: string
  amount: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
}

type Producto = {
  id: string
  nombre: string
  precio: number
}

const COLUMNS = [
  { id: "PENDING", title: "Pendientes" },
  { id: "IN_PROGRESS", title: "En Proceso" },
  { id: "COMPLETED", title: "Completadas" },
]

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  // Campos del formulario
  const [newCustomer, setNewCustomer] = useState("")
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState(1)

  // Cargar datos a través de la Server Action
  const loadTasks = async () => {
    setLoading(true)
    
    // Cargar lista de productos
    const { data: prods } = await supabase
      .from("productos")
      .select("id, nombre, precio")
      .is("deleted_at", null)

    if (prods && prods.length > 0) {
      setProductos(prods)
      setSelectedProducto(prods[0])
    }

    // Cargar tareas directamente desde el backend
    const loadedTasks = await getKanbanTasks()
    setTasks(loadedTasks as Task[])
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const newStatus = destination.droppableId as Task["status"]

    // Actualización optimista de UI
    const previousTasks = [...tasks]
    setTasks((prev) =>
      prev.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task))
    )

    // Guardado en Supabase vía Server Action
    const response = await updateTaskStatus(draggableId, newStatus)

    if (!response.success) {
      setTasks(previousTasks)
      alert(`Error al guardar en Supabase: ${response.message}`)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer || !selectedProducto) return

    const totalCalculado = selectedProducto.precio * cantidad

    const res = await createOrderAction(selectedProducto.id, cantidad, totalCalculado)

    if (!res.success) {
      alert(`Error al crear la orden: ${res.message}`)
      return
    }

    await loadTasks()
    setNewCustomer("")
    setCantidad(1)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Órdenes (Kanban)</h1>
          <p className="text-sm text-slate-400">Arrastra las órdenes entre columnas para actualizar su estado en tiempo real.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-lg"
        >
          + Nueva Orden
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Sincronizando órdenes con Supabase...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id)

              return (
                <div key={col.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h2 className="font-semibold text-slate-200">{col.title}</h2>
                    <span className="bg-slate-800 text-xs px-2 py-1 rounded-full text-slate-400">{colTasks.length}</span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[300px] rounded-lg transition p-2 space-y-3 ${
                          snapshot.isDraggingOver ? "bg-indigo-950/20 border border-dashed border-indigo-500/50" : ""
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-slate-800 border border-slate-700/60 p-4 rounded-lg shadow-md transition ${
                                  snapshot.isDragging ? "opacity-75 scale-105 border-indigo-500" : "hover:border-slate-600"
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-white text-sm">{task.title}</span>
                                  <span className="text-xs font-semibold text-indigo-400">{task.amount}</span>
                                </div>
                                <p className="text-xs text-slate-400">Cliente: {task.customer}</p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}

      {/* Modal para Crear Nueva Orden */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Agregar Nueva Orden</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="Ej. Roberto Gómez"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Seleccionar Producto</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  onChange={(e) => {
                    const prod = productos.find((p) => p.id === e.target.value)
                    if (prod) setSelectedProducto(prod)
                  }}
                >
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre} - ${prod.precio}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg flex justify-between items-center text-sm text-slate-300">
                <span>Monto Total Estimado:</span>
                <span className="font-bold text-emerald-400">
                  ${((selectedProducto?.precio || 0) * cantidad).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg"
                >
                  Guardar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}