import { TablaProductos } from '../../components/TablaProductos';
import { supabase } from '../../lib/supabase';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, TrendingUp, Calendar, Zap } from 'lucide-react';

export const instant = false;
export default async function DashboardPage() {
  // 1. Obtener la suma total de los montos de ventas
  const { data: ventasData } = await supabase
    .from('ventas')
    .select('monto');

  const totalVentas = (ventasData || []).reduce(
    (acc: number, curr: { monto: number | string }) => acc + Number(curr.monto),
    0
  );

  // 2. Conteo total de órdenes
  const { count: totalOrdenes } = await supabase
    .from('ventas')
    .select('*', { count: 'exact', head: true });

  // 3. Conteo total de usuarios/clientes
  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  // --- CÁLCULO DE MÉTRICAS A FUTURO (PROYECCIONES) ---
  const ticketPromedio = totalOrdenes ? totalVentas / totalOrdenes : 0;
  
  // Proyección de ingresos para el próximo mes (+15% de crecimiento estimado)
  const proyeccionIngresosMes = totalVentas * 1.15;
  
  // Estimación de órdenes proyectadas para el siguiente trimestre
  const proyeccionOrdenesTrimestre = Math.round((totalOrdenes || 0) * 1.35);

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
      value: `+${(totalOrdenes || 0).toLocaleString()}`,
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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard de Analítica</h1>
        <p className="text-gray-400">Métricas clave e inteligencia predictiva sincronizadas con Supabase.</p>
      </div>

      {/* Tarjetas de Métricas Actuales */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-2 shadow-lg">
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

      {/* SECCIÓN: MÉTRICAS PROYECTADAS A FUTURO */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Proyecciones y Estimaciones Futuras
        </h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Proyección Próximo Mes */}
          <div className="p-6 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-indigo-300">
              <span className="text-sm font-medium">Ingresos Proyectados (Prox. Mes)</span>
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-100">
              ${proyeccionIngresosMes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-indigo-400">
              Basado en una tasa de crecimiento estimada del +15%
            </p>
          </div>

          {/* Ticket Promedio */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">Ticket Promedio por Orden</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${ticketPromedio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400">
              Valor medio estimado de cada venta realizada
            </p>
          </div>

          {/* Órdenes Estimadas Trimestre */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">Meta Órdenes (Prox. Trimestre)</span>
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              +{proyeccionOrdenesTrimestre.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-400">
              Meta calculada según volumen actual
            </p>
          </div>
        </div>
      </div>

      {/* Tabla Paginada de Productos */}
      <TablaProductos pagina={1} porPagina={10} />
    </div>
  );
}