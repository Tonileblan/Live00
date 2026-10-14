import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { CommunityPost } from '../../types/database.types';
import { MessageSquarePlus, X, Send } from 'lucide-react';

interface CreateMilestonePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCohort: CommunityPost['cohort_bucket'];
  soberDays: number;
}

export const CreateMilestonePostModal: React.FC<CreateMilestonePostModalProps> = ({
  isOpen,
  onClose,
  defaultCohort,
  soberDays,
}) => {
  const addCommunityPost = useTrackerStore((state) => state.addCommunityPost);
  const profile = useTrackerStore((state) => state.profile);

  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    addCommunityPost(content.trim(), defaultCohort, soberDays);
    setContent('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <MessageSquarePlus size={22} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Compartir con tu Cohorte</h3>
          </div>
          <button
            onClick={onClose}
            className="touch-target"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.6rem' }}>
          Publicarás de forma 100% anónima como <strong>{profile.anonymous_alias}</strong> con tu insignia de <strong>{soberDays} días</strong> en tu grupo de etapa.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué victoria o lección aprendiste hoy? Tu experiencia puede ser el salvavidas de alguien que empieza..."
            rows={5}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '0.1rem solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1.4rem',
              color: 'var(--text-primary)',
              fontSize: '1.45rem',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="btn-primary"
            style={{ flex: 2, opacity: content.trim() ? 1 : 0.5 }}
          >
            <span>Publicar Anónimo</span>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
