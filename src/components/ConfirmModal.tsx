import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <header className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              backgroundColor: isDanger ? '#fee2e2' : '#e0f2fe', 
              padding: '8px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color={isDanger ? '#dc2626' : '#0284c7'} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div style={{ padding: '20px 0', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          {message}
        </div>

        <footer className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            {cancelText}
          </button>
          <button 
            className={isDanger ? "btn danger" : "btn"} 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            style={{ flex: 1 }}
          >
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
}
