import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Activity } from "lucide-react";

export default function DashboardPage() {
  const metrics = [
    {
      title: "Ventas Totales",
      value: "$45,231.89",
      change: "+20.1%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "Órdenes",
      value: "+2,350",
      change: "+180.1%",
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      title: "Usuarios Activos",
      value: "+12,234",
      change: "+19%",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Tasa de Conversión",
      value: "3.2%",
      change: "-4.5%",
      isPositive: false,
      icon: Activity,
    },
  ];

  const recentSales = [
    { id: "ORD-001", customer: "Ana Martínez", email: "ana@example.com", amount: "$250.00", status: "Completado" },
    { id: "ORD-002", customer: "Carlos Gómez", email: "carlos@example.com", amount: "$120.50", status: "Pendiente" },
    { id: "ORD-003", customer: "Sofía López", email: "sofia@example.com", amount: "$450.00", status: "Completado" },
    { id: "ORD-004", customer: "Luis Hernández", email: "luis@example.com", amount: "$85.00", status: "Cancelado" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Panel Analítico</h1>
        <p className="text-slate-400 mt-1">Resumen general del rendimiento de PulseMarket.</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">{metric.title}</span>
                <div className="rounded-lg bg-slate-800 p-2 text-slate-200">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className={`flex items-center text-xs font-semibold ${metric.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metric.isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {metric.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección Principal: Gráfica y Últimas Ventas */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Simulación Visual de Gráfica */}
        <div className="md:col-span-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Rendimiento de Ventas</h3>
              <p className="text-sm text-slate-400">Ingresos proyectados vs. reales este mes</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              +12.5% este mes
            </span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-slate-800">
            {[40, 65, 45, 80, 55, 90, 75, 85, 95, 60, 70, 100].map((height, i) => (
              <div key={i} className="w-full bg-slate-800/60 hover:bg-indigo-600/80 rounded-t transition-all duration-300 relative group flex flex-col justify-end" style={{ height: `${height}%` }}>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow border border-slate-700 pointer-events-none transition-opacity">
                  ${height * 50}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-3 px-1">
            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
          </div>
        </div>

        {/* Tabla de Transacciones Recientes */}
        <div className="md:col-span-3 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Últimas Transacciones</h3>
          <p className="text-sm text-slate-400 mb-6">Ventas procesadas recientemente.</p>
          
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-white">{sale.customer}</p>
                  <p className="text-xs text-slate-400">{sale.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{sale.amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    sale.status === 'Completado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    sale.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}