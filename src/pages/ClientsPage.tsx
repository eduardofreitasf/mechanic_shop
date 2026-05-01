import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Users, X } from "lucide-react";
import { clientService } from "../services/clientService";
import { Client } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadClients = async () => {
    try {
      const result = await clientService.getClients(search);
      setClients(result);
    } catch (err) {
      console.error("Erro ao carregar clientes", err);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);

    try {
      await clientService.createClient(newName, newPhone);
      setNewName("");
      setNewPhone("");
      setIsModalOpen(false);
      loadClients();
    } catch (err: any) {
      setError(err.message === "A client with this name already exists." ? "Já existe um cliente com este nome." : (err.message || "Ocorreu um erro"));
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await clientService.deleteClient(deleteId);
      setDeleteId(null);
      loadClients();
    } catch (err) {
      console.error("Erro ao eliminar cliente", err);
    }
  };

  return (
    <>
      <header className="header">
        <h1>Clientes</h1>
        <div style={{ display: "flex", gap: "16px" }}>
          <div className="input-group">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input"
              placeholder="Procurar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Adicionar Cliente
          </button>
        </div>
      </header>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.phone || <span style={{ color: "var(--text-muted)" }}>Nenhum</span>}</td>
                <td className="actions-cell">
                  <button
                    className="btn danger"
                    onClick={() => setDeleteId(client.id)}
                    title="Eliminar Cliente"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="empty-state">
            <Users size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
            <p>Nenhum cliente encontrado. Adicione um para começar.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>Novo Cliente</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              {error && (
                <div style={{ color: 'var(--danger)', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Nome completo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Telefone (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 912 345 678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn">
                  Guardar Cliente
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
        title="Eliminar Cliente"
        message="Tem a certeza que deseja eliminar este cliente? Todos os veículos e ordens de serviço associados serão mantidos, mas a referência ao cliente será perdida."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
