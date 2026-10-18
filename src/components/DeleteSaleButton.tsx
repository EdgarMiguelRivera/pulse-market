'use client';

import { useState } from 'react';
import { deleteSale } from '../app/dashboard/sales/actions';

export function DeleteSaleButton({ saleId }: { saleId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de cancelar esta orden de venta?')) return;
    setLoading(true);
    await deleteSale(saleId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-2.5 py-1 rounded-md transition disabled:opacity-50"
    >
      {loading ? '...' : 'Cancelar'}
    </button>
  );
}