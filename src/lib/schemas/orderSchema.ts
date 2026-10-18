import { z } from 'zod';

export const orderSchema = z.object({
  customerName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  amount: z.number({ message: 'Ingresa un monto válido' }).positive('El monto debe ser mayor a 0'),
  status: z.enum(['pending', 'completed', 'cancelled']),
});

export type OrderFormData = z.infer<typeof orderSchema>;