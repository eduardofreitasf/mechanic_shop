import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Car, Wrench, TrendingUp, Plus } from "lucide-react";
import { dashboardService, DashboardStats } from "../services/dashboardService";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

export function DashboardPage() {
  const navigate = useNavigate();
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
        <button className="btn" onClick={() => navigate("/services/new")}>
            <Plus size={18} />
            Registar Serviço
          </button>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Clientes" 
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
          title="Serviços" 
          value={stats.servicesCount} 
          icon={<Wrench size={24} />} 
          color="#f59e0b" 
        />
        {/* <StatCard 
          title="Receita Total" 
          value={`${stats.totalRevenue.toFixed(2)}€`} 
          icon={<DollarSign size={24} />} 
          color="#ef4444" 
        /> */}
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
