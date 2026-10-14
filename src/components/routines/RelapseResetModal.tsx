import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { WhyIDoThisCarousel } from '../sos/WhyIDoThisCarousel';
import { ShieldAlert, RefreshCcw, LifeBuoy, X, AlertOctagon } from 'lucide-react';

const COMMON_TRIGGERS = [
  'Estrés laboral',
  'Evento social',
  'Presión de grupo',
  'Aburrimiento',
  'Ansiedad',
  'Discusión / Conflicto',
  'Sensación de confianza excesiva',
];

export const RelapseResetModal: React.FC = () => {
  const isOpen = useTrackerStore((state) => state.isResetModalOpen);
  const openResetModal = useTrackerStore((state) => state.openResetModal);
  const openSOS = useTrackerStore((state) => state.openSOS);
  const resetSobriety = useTrackerStore((state) => state.resetSobriety);

  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [relapseTime, setRelapseTime] = useState(new Date().toISOString().slice(0, 16));

  if (!isOpen) return null;

  const handleHavingUrgeNow = () => {
    openResetModal(false);
    openSOS(true);
  };

  const handleConfirmReset = () => {
    resetSobriety(
      new Date(relapseTime).toISOString(),
      reason || 'Reinicio consciente de contador',
      selectedTriggers
    );
    setStep(1);
    setReason('');
    setSelectedTriggers([]);
  };

  const toggleTrigger = (t: string) => {
    if (selectedTriggers.includes(t)) {
      setSelectedTriggers(selectedTriggers.filter((x) => x !== t));
    } else {
      setSelectedTriggers([...selectedTriggers, t]);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => openResetModal(false)}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <AlertOctagon size={24} color="var(--coral-400)" />
            <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Protocolo de Reinicio</h3>
          </div>
          <button
            onClick={() => openResetModal(false)}
            className="touch-target"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Positive Friction Intermediary */}
        {step === 1 && (
          <div>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '0.1rem solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem',
                marginBottom: '1.6rem',
              }}
            >
              <h4 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--coral-400)', marginBottom: '0.4rem' }}>
                Detente un instante. Respira.
              </h4>
              <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Antes de tocar el contador, recuerda por qué empezaste este camino. Revisa tus motivos:
              </p>
            </div>

            {/* Motivational Carousel */}
            <div style={{ marginBottom: '2rem' }}>
              <WhyIDoThisCarousel />
            </div>

            <h4 style={{ fontSize: '1.6rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.6rem' }}>
              ¿Estás sintiendo un deseo fuerte en este instante o el consumo ya ocurrió?
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Escape hatch to SOS Mode */}
              <button
                onClick={handleHavingUrgeNow}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--amber-500) 0%, #D97706 100%)',
                  boxShadow: '0 0.4rem 1.6rem var(--amber-glow)',
                }}
              >
                <LifeBuoy size={20} />
                <span>Estoy teniendo el deseo ahora (Modo SOS)</span>
              </button>

              {/* Confirm relapse */}
              <button
                onClick={() => setStep(2)}
                className="btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCcw size={18} />
                <span>Ya ocurrió el consumo (Continuar reinicio)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Actual Reset Details */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.8rem' }}>
              Una recaída no borra el progreso neuronal que tu cuerpo ya construyó. Tu historial se conservará en tu diario
              como aprendizaje clínico.
            </p>

            <div style={{ marginBottom: '1.6rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}>
                FECHA Y HORA DEL REINICIO
              </label>
              <input
                type="datetime-local"
                value={relapseTime}
                onChange={(e) => setRelapseTime(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '0.1rem solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.4rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.6rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}>
                ¿QUÉ PROVOCÓ ESTA SITUACIÓN? (DETONANTES)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {COMMON_TRIGGERS.map((t) => {
                  const isSelected = selectedTriggers.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTrigger(t)}
                      style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: 'var(--radius-full)',
                        background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: `0.1rem solid ${isSelected ? 'var(--coral-400)' : 'var(--border-subtle)'}`,
                        color: isSelected ? 'var(--coral-400)' : 'var(--text-secondary)',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? '✕ ' : '+ '}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '2.4rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}>
                CAUSA RAÍZ O REFLEXIÓN
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="¿Qué aprendiste de esto para que no vuelva a ocurrir en una situación similar?"
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '0.1rem solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.4rem',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>
                Atrás
              </button>
              <button
                onClick={handleConfirmReset}
                className="btn-danger"
                style={{ flex: 2, background: 'var(--coral-500)', color: '#FFF' }}
              >
                Confirmar y Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
