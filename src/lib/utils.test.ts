import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency Utility', () => {
  it('formatea montos numéricos a divisa USD correctamente', () => {
    expect(formatCurrency(1500.5)).toBe('$1,500.50');
    expect(formatCurrency(0)).toBe('$0.00');
  });
});