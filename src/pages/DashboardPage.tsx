import { useEffect, useState } from "react";
import { Users, Car, Wrench, TrendingUp, DollarSign } from "lucide-react";
import { dashboardService, DashboardStats } from "../services/dashboardService";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then(res => {
      setStats(res);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return <div className="main-content">Carregando estatísticas...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header className="header">
        <h1>Visão Geral</h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Bem-vindo de volta! Aqui está o que está a acontecer na sua oficina.
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Total Clientes" 
          value={stats.clientsCount} 
          icon={<Users size={24} />} 
          color="#3b82f6" 
        />
        <StatCard 
          title="Veículos" 
          value={stats.vehiclesCount} 
          icon={<Car size={24} />} 
          color="#10b981" 
        />
        <StatCard 
          title="Ordens de Serviço" 
          value={stats.servicesCount} 
          icon={<Wrench size={24} />} 
          color="#f59e0b" 
        />
        <StatCard 
          title="Receita Total" 
          value={`${stats.totalRevenue.toFixed(2)}€`} 
          icon={<DollarSign size={24} />} 
          color="#ef4444" 
        />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="var(--primary)" /> Receita por Mês
            </h3>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '14px'
                  }} 
                  formatter={(value: any) => [`${value.toFixed(2)}€`, "Receita"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Summary Table or extra info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3>Análise de Desempenho</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <TrendingUp size={20} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket Médio</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {stats.servicesCount > 0 ? (stats.totalRevenue / stats.servicesCount).toFixed(2) : "0.00"}€
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              O seu negócio está a crescer. Continue a registar as ordens de serviço para ver estatísticas mais detalhadas sobre o seu lucro mensal e retenção de clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        borderRadius: '14px', 
        backgroundColor: `${color}15`, 
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  );
}
