import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { clientService } from "../services/clientService";
import { Client } from "../db";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSuccess, client }: ClientModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone || "");
    } else {
      setName("");
      setPhone("");
    }
    setError(null);
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);

    try {
      if (client) {
        await clientService.updateClient(client.id, name, phone);
      } else {
        await clientService.createClient(name, phone);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message === "A client with this name already exists." ? "Já existe um cliente com este nome." : (err.message || "Ocorreu um erro"));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>{client ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button 
            onClick={onClose} 
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
            <label>Nome</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Telefone (Opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: 912 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn">
              {client ? "Guardar Alterações" : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
