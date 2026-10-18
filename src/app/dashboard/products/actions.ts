'use server';

import { supabase } from '../../../lib/supabase';
import { productSchema, ProductInput } from '../../../lib/schemas/product';
import { revalidatePath } from 'next/cache';

// 1. Creación con validación estricta (Zod)
export async function createProduct(rawData: ProductInput) {
  const result = productSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from('productos').insert([result.data]);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboard/products');
  return { success: true };
}

// 2. Actualización Masiva (Bulk Update)
export async function bulkUpdateCategoryPrice(categoria: string, porcentajeIncremento: number) {
  // Obtener productos de la categoría no eliminados
  const { data: productos, error: fetchError } = await supabase
    .from('productos')
    .select('id, precio')
    .eq('categoria', categoria)
    .is('deleted_at', null);

  if (fetchError || !productos) return { success: false, message: 'Error al consultar productos' };

  // Calcular nuevos precios
  const updates = productos.map((p) => ({
    id: p.id,
    precio: Number((p.precio * (1 + porcentajeIncremento / 100)).toFixed(2)),
  }));

  // Actualizar en lote
  for (const item of updates) {
    await supabase.from('productos').update({ precio: item.precio }).eq('id', item.id);
  }

  revalidatePath('/dashboard/products');
  return { success: true, count: updates.length };
}

// 3. Borrado Lógico (Soft Delete)
export async function softDeleteProduct(productId: string) {
  const { error } = await supabase
    .from('productos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboard/products');
  return { success: true };
}