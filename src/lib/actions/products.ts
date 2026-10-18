'use server';

import { supabase } from '../supabase';
import { revalidatePath } from 'next/cache';

// 1. SOFT DELETE: Oculta el producto sin destruirlo de la BD
export async function softDeleteProducto(id: string) {
  const { error } = await supabase
    .from('productos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al realizar Soft Delete: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

// 2. BULK UPDATE: Mutación masiva (ej. aplicar descuento por categoría)
export async function aplicarDescuentoCategoria(categoria: string, porcentaje: number) {
  // Traemos los productos de la categoría activa
  const { data: productos, error: fetchError } = await supabase
    .from('productos')
    .select('id, precio')
    .eq('categoria', categoria)
    .is('deleted_at', null);

  if (fetchError || !productos) {
    throw new Error('Error al consultar productos para el descuento masivo');
  }

  // Actualizamos el precio de todos en lote con tipado explícito
  type ProductoItem = { id: string; precio: number };

  const updates = (productos as ProductoItem[]).map((prod: ProductoItem) => {
    const nuevoPrecio = Number(prod.precio) * (1 - porcentaje / 100);
    return supabase
      .from('productos')
      .update({ precio: Number(nuevoPrecio.toFixed(2)) })
      .eq('id', prod.id);
  });

  await Promise.all(updates);
  revalidatePath('/dashboard');
  return { success: true, actualizados: productos.length };
}
// 3. KANBAN UPDATE: Actualiza el estado de una tarea arrastrada
export async function actualizarEstadoTarea(id: string, nuevoEstado: string) {
  const { error } = await supabase
    .from('tareas_kanban')
    .update({ estado: nuevoEstado })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al actualizar estado Kanban: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true };
}