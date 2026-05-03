import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Car, X, Edit } from "lucide-react";
import { vehicleService } from "../services/vehicleService";
import { clientService } from "../services/clientService";
import { Vehicle, Client } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form state
  const [clientId, setClientId] = useState<string>("");
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [vList, cList] = await Promise.all([
        vehicleService.getVehicles(search),
        clientService.getClients()
      ]);
      setVehicles(vList);
      setClients(cList);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const openCreateModal = () => {
    setEditingVehicle(null);
    setClientId("");
    setPlate("");
    setBrand("");
    setModel("");
    setYear("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setClientId(vehicle.client_id.toString());
    setPlate(vehicle.plate);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(vehicle.year?.toString() || "");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !plate || !brand || !model) return;
    setError(null);

    try {
      const vehicleData = {
        clientId: parseInt(clientId),
        plate,
        brand,
        model,
        year: year ? parseInt(year) : null
      };

      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, vehicleData.clientId, vehicleData.plate, vehicleData.brand, vehicleData.model, vehicleData.year);
      } else {
        await vehicleService.createVehicle(vehicleData.clientId, vehicleData.plate, vehicleData.brand, vehicleData.model, vehicleData.year);
      }
      
      closeModal();
      loadData();
    } catch (err: any) {
      setError(err.message === "A vehicle with this license plate already exists." ? "Já existe um veículo com esta matrícula." : (err.message || "Erro ao guardar veículo"));
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await vehicleService.deleteVehicle(deleteId);
      setDeleteId(null);
      loadData();
    } catch (err) {
      console.error("Erro ao eliminar veículo", err);
    }
  };

  return (
    <>
      <header className="header">
        <h1>Veículos</h1>
        <div style={{ display: "flex", gap: "16px" }}>
          <div className="input-group">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input"
              placeholder="Procurar por matrícula, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn" onClick={openCreateModal}>
            <Plus size={18} />
            Adicionar Veículo
          </button>
        </div>
      </header>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Veículo</th>
              <th>Ano</th>
              <th>Proprietário</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>{v.plate}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{v.brand} {v.model}</div>
                </td>
                <td>{v.year || <span style={{ color: "var(--text-muted)" }}>-</span>}</td>
                <td>{v.client_name}</td>
                <td className="actions-cell">
                  <button
                    className="btn edit"
                    onClick={() => openEditModal(v)}
                    title="Editar Veículo"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => setDeleteId(v.id)}
                    title="Eliminar Veículo"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vehicles.length === 0 && (
          <div className="empty-state">
            <Car size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
            <p>Nenhum veículo encontrado. Adicione um para começar.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>{editingVehicle ? "Editar Veículo" : "Novo Veículo"}</h2>
              <button 
                onClick={closeModal} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              {error && (
                <div style={{ color: 'var(--danger)', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label>Proprietário (Cliente)</label>
                <select
                  className="form-input"
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Selecionar um cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Matrícula</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ex: AA-00-00"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ minWidth: 0 }}>
                  <label>Marca</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%' }}
                    required
                    placeholder="Ex: Toyota"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ minWidth: 0 }}>
                  <label>Modelo</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%' }}
                    required
                    placeholder="Ex: Corolla"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Ano (Opcional)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 2022"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn">
                  {editingVehicle ? "Guardar Alterações" : "Guardar Veículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       <ConfirmModal 
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Veículo"
        message="Tem a certeza que deseja eliminar este veículo? Todas as ordens de serviço associadas serão mantidas, mas a referência ao veículo será perdida."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
