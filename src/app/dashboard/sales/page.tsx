'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface VentaItem {
  id: string;
  monto: number;
  cantidad: number;
  fecha_venta: string;
  clientes: { nombre: string; email: string } | null;
  productos: { nombre: string; categoria: string } | null;
}

export default function SalesPage() {
  const [sales, setSales] = useState<VentaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      const { data, error } = await supabase
        .from('ventas')
        .select('id, monto, cantidad, fecha_venta, clientes(nombre, email), productos(nombre, categoria)')
        .order('fecha_venta', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error cargando ventas:', error);
      } else {
        setSales((data as unknown as VentaItem[]) || []);
      }
      setLoading(false);
    }

    fetchSales();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Módulo de Ventas</h1>
          <p className="text-sm text-slate-400">
            Administración y filtrado en tiempo real de órdenes
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 py-8 text-center">Cargando ventas de Supabase...</div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sales.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {item.clientes?.nombre || 'Cliente Anónimo'}
                    <span className="block text-xs text-slate-500">{item.clientes?.email}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {item.productos?.nombre || 'Producto General'}
                    <span className="block text-xs text-slate-500">{item.productos?.categoria}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.cantidad} u.</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">${item.monto}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(item.fecha_venta).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}