'use server';

import { supabase } from '../../../lib/supabase';
import { revalidatePath } from 'next/cache';

// 1. Registrar una nueva venta
export async function createSale(data: {
  cliente_id: string;
  producto_id: string;
  cantidad: number;
  monto: number;
}) {
  const { error } = await supabase.from('ventas').insert([
    {
      cliente_id: data.cliente_id,
      producto_id: data.producto_id,
      cantidad: data.cantidad,
      monto: data.monto,
      fecha_venta: new Date().toISOString(),
    },
  ]);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboard/sales');
  return { success: true };
}

// 2. Eliminar / Cancelar orden de venta
export async function deleteSale(saleId: string) {
  const { error } = await supabase.from('ventas').delete().eq('id', saleId);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboard/sales');
  return { success: true };
}