import { getDb, Vehicle } from "../db";

export const vehicleService = {
  async getVehicles(search: string = ""): Promise<Vehicle[]> {
    const db = await getDb();
    let query = `
      SELECT v.*, c.name as client_name 
      FROM vehicles v
      JOIN clients c ON v.client_id = c.id
      WHERE v.deleted_at IS NULL
    `;
    let params: any[] = [];
    if (search.trim() !== "") {
      query += " AND (v.plate LIKE ? OR v.brand LIKE ? OR v.model LIKE ? OR c.name LIKE ?)";
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    query += " ORDER BY v.id DESC";
    return await db.select<Vehicle[]>(query, params);
  },

  async createVehicle(clientId: number, plate: string, brand: string, model: string, year: number | null): Promise<void> {
    const db = await getDb();
    const formattedPlate = plate.trim().toUpperCase();

    // Check for duplicate plate
    const existing = await db.select<any[]>(
      "SELECT id FROM vehicles WHERE plate = ? AND deleted_at IS NULL",
      [formattedPlate]
    );
    if (existing.length > 0) {
      throw new Error("A vehicle with this license plate already exists.");
    }

    await db.execute(
      "INSERT INTO vehicles (client_id, plate, brand, model, year) VALUES (?, ?, ?, ?, ?)",
      [clientId, formattedPlate, brand.trim(), model.trim(), year]
    );
  },

  async deleteVehicle(id: number): Promise<void> {
    const db = await getDb();
    await db.execute(
      "UPDATE vehicles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );
  },

  async getVehiclesByClient(clientId: number): Promise<Vehicle[]> {
    const db = await getDb();
    return await db.select<Vehicle[]>(
      "SELECT * FROM vehicles WHERE client_id = ? AND deleted_at IS NULL",
      [clientId]
    );
  },

  async updateVehicle(id: number, clientId: number, plate: string, brand: string, model: string, year: number | null): Promise<void> {
    const db = await getDb();
    const formattedPlate = plate.trim().toUpperCase();

    const existing = await db.select<any[]>(
      "SELECT id FROM vehicles WHERE plate = ? AND id != ? AND deleted_at IS NULL",
      [formattedPlate, id]
    );
    if (existing.length > 0) {
      throw new Error("A vehicle with this license plate already exists.");
    }

    await db.execute(
      "UPDATE vehicles SET client_id = ?, plate = ?, brand = ?, model = ?, year = ? WHERE id = ?",
      [clientId, formattedPlate, brand.trim(), model.trim(), year, id]
    );
  }
};
