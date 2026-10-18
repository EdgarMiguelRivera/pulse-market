import { z } from 'zod';

export const productSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  categoria: z.string().min(2, 'La categoría es requerida'),
  precio: z.number().positive('El precio debe ser un número positivo'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo'),
});

export type ProductInput = z.infer<typeof productSchema>;