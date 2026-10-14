import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { Heart, Plus, Trash2, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';

export const MotivesView: React.FC = () => {
  const anchors = useTrackerStore((state) => state.anchors);
  const addMotivationAnchor = useTrackerStore((state) => state.addMotivationAnchor);
  const deleteMotivationAnchor = useTrackerStore((state) => state.deleteMotivationAnchor);
  const resetToInitialDemo = useTrackerStore((state) => state.resetToInitialDemo);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const sampleImages = [
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80',
  ];

  const handleCreate = () => {
    if (!title.trim()) return;
    addMotivationAnchor(title.trim(), description.trim(), imageUrl || sampleImages[Math.floor(Math.random() * sampleImages.length)]);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setIsAdding(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Heart size={22} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Anclas Motivacionales</h3>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary"
            style={{ padding: '0.8rem 1.4rem', minHeight: '3.8rem', fontSize: '1.3rem' }}
          >
            <Plus size={16} />
            <span>Añadir Ancla</span>
          </button>
        </div>

        <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Estas son tus razones innegociables para mantenerte sobrio. Se proyectarán en pantalla completa cuando sientas
          ganas de recaer en el modo de emergencia SOS.
        </p>
      </div>

      {/* Form Add Anchor */}
      {isAdding && (
        <div className="glass-panel" style={{ padding: '2rem', border: '0.15rem solid var(--emerald-400)' }}>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.4rem' }}>
            Nueva Ancla Motivacional
          </h4>

          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem' }}>
              TÍTULO O FRASE CLAVE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Por mis hijos y mi futuro"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '0.1rem solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                color: 'var(--text-primary)',
                fontSize: '1.4rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem' }}>
              EXPLICACIÓN O RECORDATORIO
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué sentirás si te mantienes firme frente a esa copa?"
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '0.1rem solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                color: 'var(--text-primary)',
                fontSize: '1.4rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem' }}>
              IMAGEN DE REFERENCIA (URL OPCIONAL)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... o deja vacío para foto inspiradora"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '0.1rem solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                color: 'var(--text-primary)',
                fontSize: '1.4rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsAdding(false)} className="btn-secondary" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!title.trim()} className="btn-primary" style={{ flex: 2 }}>
              Guardar Ancla
            </button>
          </div>
        </div>
      )}

      {/* Anchors Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        {anchors.map((anchor) => (
          <div
            key={anchor.id}
            className="glass-panel"
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {anchor.image_url && (
              <div style={{ position: 'relative', height: '14rem', width: '100%' }}>
                <img
                  src={anchor.image_url}
                  alt={anchor.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 80%)',
                  }}
                />
              </div>
            )}

            <div style={{ padding: '1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  {anchor.title}
                </h4>
                {anchor.description && (
                  <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {anchor.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteMotivationAnchor(anchor.id)}
                className="touch-target"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  marginLeft: '0.8rem',
                }}
                aria-label="Eliminar motivo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Demo helper */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={resetToInitialDemo}
          className="touch-target"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <RefreshCw size={12} />
          <span>Restablecer datos demo de ejemplo (14 Días)</span>
        </button>
      </div>
    </div>
  );
};
