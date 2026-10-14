import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { Moon, Check, X, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

const COMMON_TRIGGERS = [
  'Estrés laboral',
  'Evento social',
  'Aburrimiento nocturno',
  'Ansiedad / Agotamiento',
  'Discusión familiar',
  'Tristeza / Soledad',
  'Celebración',
  'Insomnio',
  'Hábito automático',
];

export const EveningReviewWizard: React.FC = () => {
  const isOpen = useTrackerStore((state) => state.isEveningReviewOpen);
  const openEveningReview = useTrackerStore((state) => state.openEveningReview);
  const submitEveningReview = useTrackerStore((state) => state.submitEveningReview);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stayedSober, setStayedSober] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<number>(2);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleToggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleFinish = () => {
    submitEveningReview(stayedSober, difficulty, selectedTriggers, notes);
    setStep(1);
    setSelectedTriggers([]);
    setNotes('');
  };

  return (
    <div className="modal-overlay" onClick={() => openEveningReview(false)}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Moon size={24} color="var(--purple-400)" />
            <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Revisión Nocturna</h3>
          </div>
          <button
            onClick={() => openEveningReview(false)}
            className="touch-target"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2.4rem' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '0.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: s <= step ? 'var(--purple-400)' : 'rgba(255, 255, 255, 0.1)',
                transition: 'background-color var(--transition-fast)',
              }}
            />
          ))}
        </div>

        {/* STEP 1: Stayed Sober? */}
        {step === 1 && (
          <div>
            <h4 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.8rem' }}>
              Paso 1: ¿Te has mantenido sobrio hoy?
            </h4>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '2.4rem' }}>
              Sé 100% honesto contigo mismo. No hay juicio aquí, solo aprendizaje para tu recuperación.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <button
                onClick={() => {
                  setStayedSober(true);
                  setStep(2);
                }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Check size={20} />
                <span>Sí, me he mantenido sobrio</span>
              </button>

              <button
                onClick={() => {
                  setStayedSober(false);
                  setDifficulty(5);
                  setStep(2);
                }}
                className="btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <AlertTriangle size={20} />
                <span>No, hoy tuve una recaída</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Difficulty Rating (1-5) */}
        {step === 2 && (
          <div>
            <h4 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.8rem' }}>
              Paso 2: ¿Cómo de difícil fue hoy?
            </h4>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Califica del 1 (fácil y en paz) al 5 (deseo extremo o crisis).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem', marginBottom: '2rem' }}>
              {[1, 2, 3, 4, 5].map((level) => {
                const isSelected = difficulty === level;
                return (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className="touch-target"
                    style={{
                      flexDirection: 'column',
                      gap: '0.4rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: `0.15rem solid ${isSelected ? 'var(--purple-400)' : 'var(--border-subtle)'}`,
                      color: isSelected ? '#FFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '1.2rem 0.4rem',
                      fontWeight: 800,
                      fontSize: '1.8rem',
                    }}
                  >
                    <span>{level}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {level === 1 ? 'Paz' : level === 3 ? 'Medio' : level === 5 ? 'Límite' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary"
                style={{ flex: 2, background: 'var(--purple-500)', boxShadow: '0 0.4rem 1.6rem var(--purple-glow)' }}
              >
                <span>Siguiente</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Triggers and Notes */}
        {step === 3 && (
          <div>
            <h4 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.8rem' }}>
              Paso 3: ¿Qué detonantes enfrentaste?
            </h4>
            <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', marginBottom: '1.4rem' }}>
              Identificar tus disparadores ayuda al algoritmo a prevenir futuros días críticos.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.8rem' }}>
              {COMMON_TRIGGERS.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <button
                    key={trigger}
                    onClick={() => handleToggleTrigger(trigger)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: 'var(--radius-full)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `0.1rem solid ${isSelected ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                      color: isSelected ? 'var(--emerald-400)' : 'var(--text-secondary)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {trigger}
                  </button>
                );
              })}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}>
                NOTAS O APRENDIZAJES DEL DÍA (OPCIONAL)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Qué estrategia te funcionó hoy? ¿Cómo te sientes?"
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
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button onClick={handleFinish} className="btn-primary" style={{ flex: 2 }}>
                <span>Guardar Evaluación</span>
                <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
