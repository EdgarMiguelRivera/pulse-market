import { describe, it, expect } from 'vitest';
import { orderSchema } from './orderSchema';

describe('orderSchema Validation', () => {
  it('valida correctamente una orden válida', () => {
    const validData = {
      customerName: 'Paola Perez',
      amount: 150.0,
      status: 'pending',
      category: 'Electronics',
    };

    const result = orderSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('falla cuando el monto es negativo o cero', () => {
    const invalidData = {
      customerName: 'Paola Perez',
      amount: -50,
      status: 'pending',
      category: 'Electronics',
    };

    const result = orderSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});