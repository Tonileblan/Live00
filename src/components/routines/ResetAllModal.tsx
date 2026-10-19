import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import {
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Sliders,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const ResetAllModal: React.FC = () => {
  const isOpen = useTrackerStore((state) => state.isResetAllModalOpen);
  const openResetAllModal = useTrackerStore((state) => state.openResetAllModal);
  const resetAllData = useTrackerStore((state) => state.resetAllData);
  const activeTrackerId = useTrackerStore((state) => state.activeTrackerId);
  const activeTracker = useTrackerStore((state) =>
    state.trackers.find((t) => t.id === activeTrackerId)
  );

  const [confirmOption, setConfirmOption] = useState<'clean_zero' | 'reconfigure' | 'demo' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setConfirmOption(null);
    setSuccessMessage(null);
    openResetAllModal(false);
  };

  const handleExecuteReset = (mode: 'clean_zero' | 'reconfigure' | 'demo') => {
    resetAllData(mode);
    setSuccessMessage(
      mode === 'demo'
        ? '¡Datos demo restaurados con éxito (14 Días)!'
        : mode === 'reconfigure'
        ? '¡App reiniciada! Abriendo asistente de configuración...'
        : '¡App reiniciada a Día 0 con éxito! Mucha fuerza en esta nueva etapa.'
    );

    setTimeout(() => {
      handleClose();
    }, 900);
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 120 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-all-title"
    >
      <div
        className="modal-sheet"
        style={{
          maxWidth: '46rem',
          width: '100%',
          padding: '2.4rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="touch-target"
          style={{
            position: 'absolute',
            top: '1.6rem',
            right: '1.6rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Cerrar ventana de reinicio"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.4rem' }}>
          <div
            style={{
              width: '4.4rem',
              height: '4.4rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '0.1rem solid var(--coral-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--coral-400)',
            }}
          >
            <RotateCcw size={22} />
          </div>
          <div>
            <h2 id="reset-all-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Reiniciar Todo
            </h2>
            <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)' }}>
              Restablece tus contadores y datos de la aplicación.
            </p>
          </div>
        </div>

        {/* Success Feedback in DOM */}
        {successMessage ? (
          <div
            role="alert"
            aria-live="polite"
            style={{
              padding: '2rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '0.1rem solid var(--emerald-400)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              animation: 'fadeIn 200ms ease',
            }}
          >
            <CheckCircle2 size={36} color="var(--emerald-400)" />
            <p style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              {successMessage}
            </p>
          </div>
        ) : confirmOption ? (
          /* Confirmation Step (No native window.confirm!) */
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '0.15rem solid var(--coral-500)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.6rem',
              animation: 'fadeIn 150ms ease',
            }}
            role="alert"
            aria-live="polite"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem' }}>
              <AlertTriangle size={24} color="var(--coral-400)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--coral-400)', marginBottom: '0.6rem' }}>
                  ¿Confirmas el reinicio de la aplicación?
                </h3>
                <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {confirmOption === 'clean_zero' && (
                    <>
                      Se pondrá el contador a <strong>00d 00h 00m 00s</strong> (ahora mismo), y se vaciarán
                      los impulsos registrados, promesas firmadas y evaluaciones diarias para el hábito{' '}
                      <strong>{activeTracker?.habit_name || 'actual'}</strong>.
                    </>
                  )}
                  {confirmOption === 'reconfigure' && (
                    <>
                      Se reiniciarán todos los datos a cero y se abrirá el{' '}
                      <strong>Asistente Inicial</strong> para que puedas redefinir el hábito, costes y
                      fecha desde el principio.
                    </>
                  )}
                  {confirmOption === 'demo' && (
                    <>
                      Se cargarán los <strong>datos demostrativos de 14 días</strong> (rachas, gráficos y
                      evaluaciones de ejemplo) reemplazando el estado actual.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setConfirmOption(null)}
                className="btn-secondary touch-target"
                style={{ flex: 1, justifyContent: 'center', fontSize: '1.35rem' }}
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => handleExecuteReset(confirmOption)}
                className="btn-danger touch-target"
                style={{
                  flex: 1.3,
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  background: 'var(--coral-500)',
                  color: '#FFF',
                }}
              >
                Sí, Reiniciar
              </button>
            </div>
          </div>
        ) : (
          /* Choice of Reset Options */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '0.1rem solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.2rem',
                fontSize: '1.25rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Nota:</span> Selecciona la
              modalidad de reinicio que necesitas. Tendrás un paso de confirmación antes de aplicar cualquier
              cambio.
            </div>

            {/* Option 1: Clean Day Zero */}
            <button
              type="button"
              onClick={() => setConfirmOption('clean_zero')}
              className="touch-target"
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '0.1rem solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.2rem',
                transition: 'border-color var(--transition-fast), background var(--transition-fast)',
              }}
              aria-label="Opción Empezar de cero, Día 0 limpio"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div
                  style={{
                    width: '3.6rem',
                    height: '3.6rem',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--coral-400)',
                    flexShrink: 0,
                  }}
                >
                  <RotateCcw size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Empezar de Cero (Día 0 Limpio)
                  </div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Pone el contador a 00d 00h ahora mismo y limpia el historial para un nuevo comienzo.
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </button>

            {/* Option 2: Reconfigure via Onboarding Wizard */}
            <button
              type="button"
              onClick={() => setConfirmOption('reconfigure')}
              className="touch-target"
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '0.1rem solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.2rem',
                transition: 'border-color var(--transition-fast)',
              }}
              aria-label="Opción Reiniciar y reconfigurar hábito con asistente"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div
                  style={{
                    width: '3.6rem',
                    height: '3.6rem',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60A5FA',
                    flexShrink: 0,
                  }}
                >
                  <Sliders size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Reiniciar y Reconfigurar Hábito
                  </div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Reinicia y abre el asistente guiado para redefinir el hábito, costes y fecha.
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </button>

            {/* Option 3: Restore Demo Data */}
            <button
              type="button"
              onClick={() => setConfirmOption('demo')}
              className="touch-target"
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '0.1rem solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.2rem',
                transition: 'border-color var(--transition-fast)',
              }}
              aria-label="Opción Cargar datos de demostración de 14 días"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div
                  style={{
                    width: '3.6rem',
                    height: '3.6rem',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--amber-400)',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Cargar Datos Demo (14 Días)
                  </div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Carga el entorno de prueba con 14 días de racha, gráficos y registros de ejemplo.
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </button>

            {/* Cancel Button */}
            <div style={{ marginTop: '0.8rem' }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary touch-target"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1.35rem' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
