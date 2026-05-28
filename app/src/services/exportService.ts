import { clientService } from "./clientService";
import { vehicleService } from "./vehicleService";
import { serviceOrderService } from "./serviceOrderService";

function downloadCsv(filename: string, csvContent: string) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const exportService = {
  async exportClients(): Promise<{ count: number }> {
    const clients = await clientService.getClients();
    const headers = ["ID", "Nome", "Telefone", "Data de Criação"];
    const rows = clients.map(c => [
      escapeCsv(c.id),
      escapeCsv(c.name),
      escapeCsv(c.phone),
      escapeCsv(new Date(c.created_at).toLocaleDateString("pt-PT")),
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const date = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
    downloadCsv(`clientes_${date}.csv`, csv);
    return { count: clients.length };
  },

  async exportVehicles(): Promise<{ count: number }> {
    const vehicles = await vehicleService.getVehicles();
    const headers = ["ID", "Matrícula", "Marca", "Modelo", "Ano", "Cliente", "Data de Criação"];
    const rows = vehicles.map(v => [
      escapeCsv(v.id),
      escapeCsv(v.plate),
      escapeCsv(v.brand),
      escapeCsv(v.model),
      escapeCsv(v.year),
      escapeCsv(v.client_name),
      escapeCsv(new Date(v.created_at).toLocaleDateString("pt-PT")),
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const date = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
    downloadCsv(`veiculos_${date}.csv`, csv);
    return { count: vehicles.length };
  },

  async exportServices(): Promise<{ count: number }> {
    const orders = await serviceOrderService.getServiceOrders();
    const headers = ["ID", "Cliente", "Matrícula", "Quilometragem", "Horas", "Preço/Hora", "Operações: Preço", "Observações", "Data"];

    const rows: string[] = [];
    for (const o of orders) {
      const operations = await serviceOrderService.getOperations(o.id);
      const opsDetail = operations.map(op => `${op.description}: ${op.price.toFixed(2)}`).join(" | ");
      // const opsTotal = operations.reduce((sum, op) => sum + op.price, 0);

      rows.push([
        escapeCsv(o.id),
        escapeCsv(o.client_name),
        escapeCsv(o.vehicle_plate),
        escapeCsv(o.mileage),
        escapeCsv(o.hours),
        escapeCsv(o.hourly_rate),
        // escapeCsv((o.hours * o.hourly_rate).toFixed(2)),
        // escapeCsv(opsTotal.toFixed(2)),
        escapeCsv(opsDetail),
        // escapeCsv(o.total_price),
        escapeCsv(o.observations),
        escapeCsv(new Date(o.created_at).toLocaleDateString("pt-PT")),
      ].join(","));
    }

    const csv = [headers.join(","), ...rows].join("\n");
    const date = new Date().toLocaleDateString("pt-PT").replace(/\//g, "-");
    downloadCsv(`servicos_${date}.csv`, csv);
    return { count: orders.length };
  },
};

