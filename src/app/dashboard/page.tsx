import { TablaProductos } from '../../components/TablaProductos';
import { supabase } from '../../lib/supabase';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users } from 'lucide-react';

export default async function DashboardPage() {
  // 1. Obtener total de ventas desde Supabase
  const { data: ventasData } = await supabase
    .from('ventas')
    .select('monto');

  // Tipado explícito para evitar 'any'
  const totalVentas = (ventasData || []).reduce(
    (acc: number, curr: { monto: number | string }) => acc + Number(curr.monto),
    0
  );

  // 2. Obtener número de órdenes
  const totalOrdenes = ventasData?.length || 0;

  // 3. Obtener conteo de clientes
  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  const metrics = [
    {
      title: "Ventas Totales",
      value: `$${totalVentas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+20.1%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "Órdenes",
      value: `+${totalOrdenes.toLocaleString()}`,
      change: "+180.1%",
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      title: "Usuarios Activos",
      value: `+${(totalClientes || 0).toLocaleString()}`,
      change: "+19%",
      isPositive: true,
      icon: Users,
    },
  ];

  // --- AQUÍ EMPIEZA EL JSX DE RETORNO (CÓDIGO VISUAL) ---
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard de Analítica</h1>
        <p className="text-gray-400">Métricas clave en tiempo real sincronizadas con Supabase.</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-sm font-medium">{metric.title}</span>
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="flex items-center text-xs text-green-400">
                {metric.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {metric.change} respecto al mes pasado
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla Paginada de Productos */}
      <TablaProductos pagina={1} porPagina={10} />
    </div>
  );
}