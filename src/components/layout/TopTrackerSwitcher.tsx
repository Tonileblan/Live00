import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { ChevronDown, Plus, Check, RotateCcw } from 'lucide-react';

export const TopTrackerSwitcher: React.FC<{ onAddNewClick: () => void }> = ({ onAddNewClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const trackers = useTrackerStore((state) => state.trackers);
  const activeTrackerId = useTrackerStore((state) => state.activeTrackerId);
  const switchTracker = useTrackerStore((state) => state.switchTracker);
  const openResetAllModal = useTrackerStore((state) => state.openResetAllModal);

  const activeTracker = trackers.find((t) => t.id === activeTrackerId) || trackers[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '0.1rem solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '0.6rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          cursor: 'pointer',
          color: 'var(--text-primary)',
        }}
        aria-label="Seleccionar hábito o adicción activa"
      >
        <span style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          {activeTracker?.habit_name || 'Alcohol'}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
            color: 'var(--text-secondary)',
          }}
        />
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.8rem)',
              left: 0,
              minWidth: '20rem',
              background: 'var(--bg-modal)',
              border: '0.1rem solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              padding: '0.8rem',
              zIndex: 101,
              animation: 'fadeIn 150ms ease',
            }}
          >
            <div style={{ padding: '0.6rem 0.8rem', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              MIS TRACKERS
            </div>
            {trackers.map((t) => {
              const isSelected = t.id === activeTrackerId;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    switchTracker(t.id);
                    setIsOpen(false);
                  }}
                  className="touch-target"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1.2rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    border: 'none',
                    color: isSelected ? 'var(--emerald-400)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '1.4rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                >
                  <span>{t.habit_name}</span>
                  {isSelected && <Check size={16} />}
                </button>
              );
            })}
            <div style={{ height: '0.1rem', background: 'var(--border-subtle)', margin: '0.6rem 0' }} />
            <button
              onClick={() => {
                setIsOpen(false);
                onAddNewClick();
              }}
              className="touch-target"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                gap: '0.8rem',
                padding: '0.8rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1.3rem',
                fontWeight: 600,
              }}
            >
              <Plus size={16} color="var(--emerald-400)" />
              <span>Añadir nuevo tracker</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                openResetAllModal(true);
              }}
              className="touch-target"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                gap: '0.8rem',
                padding: '0.8rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                border: 'none',
                color: 'var(--coral-400)',
                cursor: 'pointer',
                fontSize: '1.3rem',
                fontWeight: 600,
              }}
              aria-label="Reiniciar toda la aplicación"
            >
              <RotateCcw size={16} />
              <span>Reiniciar todo</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
