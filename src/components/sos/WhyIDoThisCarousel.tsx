import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export const WhyIDoThisCarousel: React.FC = () => {
  const anchors = useTrackerStore((state) => state.anchors);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!anchors || anchors.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-lg)',
          border: '0.1rem solid var(--border-subtle)',
        }}
      >
        <Heart size={28} color="var(--emerald-400)" style={{ margin: '0 auto 0.8rem auto' }} />
        <h4 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Tus Motivos Personales
        </h4>
        <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>
          Aún no has añadido anclas motivacionales. Ve a la pestaña Motivos para subir tus fotos y razones de peso.
        </p>
      </div>
    );
  }

  const currentAnchor = anchors[currentIndex] || anchors[0];

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? anchors.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === anchors.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '0.1rem solid var(--border-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Anchor Image */}
      {currentAnchor.image_url && (
        <div style={{ position: 'relative', height: '18rem', width: '100%', overflow: 'hidden' }}>
          <img
            src={currentAnchor.image_url}
            alt={currentAnchor.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '1.2rem',
              left: '1.2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(11, 14, 20, 0.75)',
              backdropFilter: 'blur(8px)',
              fontSize: '1.1rem',
              color: 'var(--emerald-400)',
              fontWeight: 700,
            }}
          >
            <Heart size={12} fill="var(--emerald-400)" />
            <span>MOTIVO #{currentIndex + 1} DE {anchors.length}</span>
          </div>
        </div>
      )}

      {/* Anchor Text */}
      <div style={{ padding: '1.6rem 2rem' }}>
        <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
          {currentAnchor.title}
        </h4>
        {currentAnchor.description && (
          <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            "{currentAnchor.description}"
          </p>
        )}

        {/* Carousel Navigation */}
        {anchors.length > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.6rem',
              paddingTop: '1.2rem',
              borderTop: '0.1rem solid var(--border-subtle)',
            }}
          >
            <button
              onClick={prev}
              className="touch-target"
              style={{
                width: '3.6rem',
                height: '3.6rem',
                minWidth: '3.6rem',
                minHeight: '3.6rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
              }}
              aria-label="Motivo anterior"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {anchors.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  style={{
                    width: i === currentIndex ? '1.8rem' : '0.6rem',
                    height: '0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: i === currentIndex ? 'var(--emerald-400)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  aria-label={`Ver motivo ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="touch-target"
              style={{
                width: '3.6rem',
                height: '3.6rem',
                minWidth: '3.6rem',
                minHeight: '3.6rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
              }}
              aria-label="Siguiente motivo"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
