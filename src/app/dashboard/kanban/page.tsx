"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { updateTaskStatus } from "./actions"

type Task = {
  id: string
  title: string
  customer: string
  amount: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Orden #1001", customer: "Carlos Gómez", amount: "$150.00", status: "PENDING" },
  { id: "2", title: "Orden #1002", customer: "Ana Martínez", amount: "$89.90", status: "PENDING" },
  { id: "3", title: "Orden #1003", customer: "Luis Hernández", amount: "$210.50", status: "IN_PROGRESS" },
  { id: "4", title: "Orden #1004", customer: "Sofía Ruiz", amount: "$45.00", status: "COMPLETED" },
]

const COLUMNS = [
  { id: "PENDING", title: "Pendientes" },
  { id: "IN_PROGRESS", title: "En Proceso" },
  { id: "COMPLETED", title: "Completadas" },
]

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Si se suelta fuera de una columna válida o en la misma posición
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const newStatus = destination.droppableId as Task["status"]

    // 1. Actualización optimista en la interfaz
    const previousTasks = [...tasks]
    setTasks((prev) =>
      prev.map((task) => (task.id === draggableId ? { ...task, status: newStatus } : task))
    )

    // 2. Persistencia en el Backend
    const response = await updateTaskStatus(draggableId, newStatus)

    // 3. Si falla, se revierte el cambio visual (Manejo optimista)
    if (!response.success) {
      setTasks(previousTasks)
      alert("Error al guardar el nuevo estado. Intenta nuevamente.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestión de Órdenes (Kanban)</h1>
        <p className="text-sm text-slate-400">Arrastra las órdenes entre columnas para actualizar su estado en tiempo real.</p>
      </div>

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
    </div>
  )
}