'use server'

import { supabase } from '../../../lib/supabase'
import { revalidatePath } from 'next/cache'

// Definimos la interfaz estricta para el retorno de Supabase
interface VentaQueryRow {
  id: string | number
  monto: number
  estado: string | null
  fecha_venta: string
  clientes: { nombre: string } | null
  productos: { nombre: string } | null
}

export async function getKanbanTasks() {
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('id, monto, estado, fecha_venta, clientes(nombre), productos(nombre)')
    .order('fecha_venta', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error al obtener ventas:', error.message)
    return []
  }

  const typedVentas = (ventas as unknown as VentaQueryRow[]) || []

  return typedVentas.map((v, index) => {
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
      createdAt: v.fecha_venta,
    }
  })
}

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

  return { success: true, data: data ? data[0] : null }
}