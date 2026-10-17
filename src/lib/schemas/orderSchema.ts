import { z } from 'zod';

export const orderSchema = z.object({
  customerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  amount: z.number().positive('El monto debe ser un número positivo'),
  status: z.enum(['pending', 'completed', 'cancelled'], {
    message: 'Estado inválido',
  }),
  category: z.string().min(1, 'La categoría es obligatoria'),
});

export type OrderInput = z.infer<typeof orderSchema>;