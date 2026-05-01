import { getDb } from "../db";

export interface DashboardStats {
  clientsCount: number;
  vehiclesCount: number;
  servicesCount: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const db = await getDb();

    // Get basic counts
    const clients = await db.select<any[]>("SELECT COUNT(*) as count FROM clients WHERE deleted_at IS NULL");
    const vehicles = await db.select<any[]>("SELECT COUNT(*) as count FROM vehicles WHERE deleted_at IS NULL");
    const services = await db.select<any[]>("SELECT COUNT(*) as count FROM service_orders WHERE deleted_at IS NULL");
    const revenue = await db.select<any[]>("SELECT SUM(total_price) as total FROM service_orders WHERE deleted_at IS NULL");

    // Get revenue by month (last 6 months)
    const monthlyData = await db.select<any[]>(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(total_price) as revenue
      FROM service_orders
      WHERE deleted_at IS NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    // Format months for display (e.g., "Jan", "Feb")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlyData.reverse().map(item => {
      const [year, month] = item.month.split("-");
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year}`,
        revenue: item.revenue || 0
      };
    });

    return {
      clientsCount: clients[0].count || 0,
      vehiclesCount: vehicles[0].count || 0,
      servicesCount: services[0].count || 0,
      totalRevenue: revenue[0].total || 0,
      monthlyRevenue: formattedMonthly
    };
  }
};
