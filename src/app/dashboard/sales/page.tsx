'use client';

import { useState } from 'react';
import OrdersTable from '../../../components/OrdersTable';
import OrderModal from '../../../components/OrderModal';
import { OrderFormData } from '../../../lib/schemas/orderSchema';

export default function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateOrder = (data: OrderFormData) => {
    console.log('Órden creada:', data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Módulo de Ventas</h1>
          <p className="text-sm text-slate-400">
            Administración y filtrado en tiempo real de órdenes de PulseMarket.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Nueva Órden
        </button>
      </div>

      <OrdersTable />

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}