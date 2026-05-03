import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Trash2, Calendar, User, Car} from "lucide-react";
import { serviceOrderService } from "../services/serviceOrderService";
import { ServiceOrder } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";

export function ServiceOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      serviceOrderService.getServiceOrderById(parseInt(id)).then(res => {
        setOrder(res);
        setLoading(false);
      });
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      await serviceOrderService.deleteServiceOrder(order.id);
      navigate("/services");
    } catch (err) {
      console.error("Erro ao eliminar ordem", err);
    }
  };

  if (loading) return <div className="main-content">Carregando...</div>;
  if (!order) return <div className="main-content">Ordem não encontrada.</div>; return (
    <div className="order-details-container">
      {/* View Header - Hidden in Print */}
      <header className="header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-secondary" onClick={() => navigate("/services")} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0 }}>Ordem de Serviço</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} />
            <span>Imprimir PDF</span>
          </button>
          <button className="btn danger" onClick={() => setIsDeleteModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} />
            <span>Eliminar</span>
          </button>
        </div>
      </header>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Ordem de Serviço"
        message={`Tem a certeza que deseja eliminar a ordem de serviço #${order.id}? Esta ação não pode ser revertida.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* --- PRINT TEMPLATE START --- */}
      <div className="print-template">
        <div className="invoice-header">
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '2.5rem' }}>OFICINA</h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: '1rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>Data: {new Date(order.created_at).toLocaleDateString('pt-PT')}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '10px', paddingBottom: '20px' }}>
          <div>
            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '6px' }}>Cliente</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a1a1a', marginBottom: '16px' }}>{order.client_name}</div>

            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px', marginTop: '20px' }}>Informações do veículo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{order.vehicle_plate}</span>
              <span style={{ color: '#666', fontSize: '1rem' }}>{order.vehicle_brand} {order.vehicle_model}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>Quilometragem</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a1a1a' }}>{order.mileage} km</div>
          </div>
        </div>

        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
              <th style={{ textAlign: 'left', padding: '12px 5px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Descrição dos Serviços / Peças</th>
              <th style={{ textAlign: 'right', padding: '12px 5px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preço</th>
            </tr>
          </thead>
          <tbody>
            {order.operations?.map((op, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '14px 5px', color: '#333' }}>{op.description}</td>
                <td style={{ textAlign: 'right', padding: '14px 5px', fontWeight: 500 }}>{op.price.toFixed(2)}€</td>
              </tr>
            ))}
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '14px 5px', color: '#333' }}>Mão de Obra</td>
              <td style={{ textAlign: 'right', padding: '14px 5px', fontWeight: 500 }}>{(order.hours * order.hourly_rate).toFixed(2)}€</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'end' }}>
          <div>
            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>Observações</div>
            <p style={{ fontSize: '0.9rem', color: '#444', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
              {order.observations || "Nenhuma observação registada."}
            </p>
          </div>
          <div style={{ background: '#f0f4ff', padding: '24px 40px', borderRadius: '16px', textAlign: 'right', border: '1px solid #e0e7ff', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
              <span style={{ fontSize: '1rem', color: '#6366f1', fontWeight: 700, letterSpacing: '1px' }}>TOTAL</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e1b4b', whiteSpace: 'nowrap' }}>{order.total_price.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
      {/* --- PRINT TEMPLATE END --- */}

      {/* Screen View (Hidden in Print) */}
      <div className="no-print">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary)" /> Informação do Cliente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{order.client_name}</div>
              <div style={{ color: 'var(--text-muted)' }}>{order.client_phone || "Nenhum telefone registado"}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={18} color="var(--primary)" /> Informação do Veículo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{order.vehicle_plate}</div>
              <div style={{ color: 'var(--text-muted)' }}>{order.vehicle_brand} {order.vehicle_model}</div>
              <div style={{ fontSize: '0.9rem' }}>Quilometragem: <strong>{order.mileage} km</strong></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary)" /> Detalhes da Ordem
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Data</label>
              <div style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString('pt-PT')}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tempo de Mão de Obra</label>
              <div style={{ fontWeight: 600 }}>{order.hours} horas</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preço Hora</label>
              <div style={{ fontWeight: 600 }}>{order.hourly_rate.toFixed(2)}€/h</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Descrição do Trabalho / Peças</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Preço (€)</th>
              </tr>
            </thead>
            <tbody>
              {order.operations?.map((op, index) => (
                <tr key={index}>
                  <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td>{op.description}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{op.price.toFixed(2)}€</td>
                </tr>
              ))}
              {(!order.operations || order.operations.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Nenhuma operação registada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Observações</h3>
            <p style={{ whiteSpace: 'pre-wrap', color: order.observations ? 'var(--text)' : 'var(--text-muted)' }}>
              {order.observations || "Nenhuma observação registada para este serviço."}
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Operações:</span>
                <span>{(order.total_price - (order.hours * order.hourly_rate)).toFixed(2)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Mão de Obra:</span>
                <span>{(order.hours * order.hourly_rate).toFixed(2)}€</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.5rem' }}>
                <span>TOTAL:</span>
                <span style={{ color: 'var(--primary)' }}>{order.total_price.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
