'use server'

import { supabase } from '../../../lib/supabase'
import { revalidatePath } from 'next/cache'

// 1. Obtener órdenes con el estado correcto desde el servidor
export async function getKanbanTasks() {
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('id, monto, estado, fecha_venta, clientes(nombre), productos(nombre)')
    .order('fecha_venta', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Error al obtener ventas:', error.message)
    return []
  }

  return (ventas || []).map((v: any, index: number) => {
    let rawStatus = (v.estado || 'PENDING').toString().toUpperCase()
    if (rawStatus === 'PENDIENTES') rawStatus = 'PENDING'
    if (rawStatus === 'EN PROCESO' || rawStatus === 'IN_PROGRESS') rawStatus = 'IN_PROGRESS'
    if (rawStatus === 'COMPLETADAS' || rawStatus === 'COMPLETED') rawStatus = 'COMPLETED'

    return {
      id: v.id.toString(),
      title: `Orden #${1000 + index + 1} (${v.productos?.nombre || 'Producto'})`,
      customer: v.clientes?.nombre || 'Cliente General',
      amount: `$${Number(v.monto).toFixed(2)}`,
      status: (['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(rawStatus) ? rawStatus : 'PENDING'),
    }
  })
}

// 2. Actualizar estado de una orden
export async function updateTaskStatus(taskId: string, newStatus: string) {
  const { error } = await supabase
    .from('ventas')
    .update({ estado: newStatus })
    .eq('id', taskId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard/kanban')
  return { success: true }
}

// 3. Crear nueva orden desde el servidor
export async function createOrderAction(productoId: string, cantidad: number, monto: number) {
  const { data, error } = await supabase
    .from('ventas')
    .insert([
      {
        producto_id: productoId,
        cantidad: cantidad,
        monto: monto,
        estado: 'PENDING',
        fecha_venta: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard/kanban')
  return { success: true, data: data[0] }
}