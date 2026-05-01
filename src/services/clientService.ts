import { getDb, Client } from "../db";

export const clientService = {
  async getClients(search: string = ""): Promise<Client[]> {
    const db = await getDb();
    let query = "SELECT * FROM clients WHERE deleted_at IS NULL";
    let params: any[] = [];
    if (search.trim() !== "") {
      query += " AND (name LIKE ? OR phone LIKE ?)";
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam);
    }
    query += " ORDER BY id DESC";
    return await db.select<Client[]>(query, params);
  },

  async createClient(name: string, phone: string | null): Promise<void> {
    const db = await getDb();
    
    // Check for duplicate name
    const existing = await db.select<any[]>(
      "SELECT id FROM clients WHERE name = ? AND deleted_at IS NULL",
      [name.trim()]
    );
    if (existing.length > 0) {
      throw new Error("A client with this name already exists.");
    }

    await db.execute(
      "INSERT INTO clients (name, phone) VALUES (?, ?)",
      [name.trim(), phone?.trim() || null]
    );
  },

  async deleteClient(id: number): Promise<void> {
    const db = await getDb();
    await db.execute(
      "UPDATE clients SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );
  }
};
