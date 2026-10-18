'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ClienteItem {
  id: string;
  nombre: string;
  email: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<ClienteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre, email, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error al cargar usuarios:', error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Directorio de Usuarios</h1>
          <p className="text-sm text-slate-400">
            Clientes registrados e interactuando en la plataforma
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 py-8 text-center">Cargando usuarios de Supabase...</div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4">ID de Cliente</th>
                <th className="px-6 py-4">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{u.nombre}</td>
                  <td className="px-6 py-4 text-slate-300">{u.email}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{u.id}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('es-MX')}
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