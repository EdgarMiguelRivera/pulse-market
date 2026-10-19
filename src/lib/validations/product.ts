import { z } from "zod"

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  category: z.string().min(2, "La categoría es requerida"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  stock: z.number().int().nonnegative("El stock no puede ser negativo"),
})

export type ProductFormValues = z.infer<typeof productSchema>