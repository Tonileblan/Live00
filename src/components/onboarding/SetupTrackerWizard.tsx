import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { ShieldCheck, ArrowRight, ArrowLeft, Heart, Euro, Calendar, Sparkles } from 'lucide-react';

interface SetupTrackerWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const SetupTrackerWizard: React.FC<SetupTrackerWizardProps> = ({ onComplete, onCancel }) => {
  const initNewTracker = useTrackerStore((state) => state.initNewTracker);
  const profile = useTrackerStore((state) => state.profile);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [habitName, setHabitName] = useState('Alcohol');
  const [alias, setAlias] = useState(profile.anonymous_alias || `Sobrio_${Math.floor(Math.random() * 900 + 100)}`);
  
  // Date State
  const [isPastDate, setIsPastDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // Financial & Habit Impact
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [spendPerSession, setSpendPerSession] = useState(25);

  // Anchor
  const [firstAnchor, setFirstAnchor] = useState('Recuperar mi claridad mental, salud y control');

  const handleFinish = () => {
    const finalStartDate = isPastDate
      ? new Date(customStartDate).toISOString()
      : new Date().toISOString();

    const costPerDay = Number(((daysPerWeek * spendPerSession) / 7).toFixed(2));
    const timeSpentPerDay = Math.round((daysPerWeek * 120) / 7);
    const caloriesPerDay = Math.round((daysPerWeek * 700) / 7);

    initNewTracker(
      {
        habit_name: habitName,
        category: habitName.toLowerCase().includes('alcohol') ? 'alcohol' : 'custom',
        start_date: finalStartDate,
        cost_per_day: costPerDay > 0 ? costPerDay : 10,
        time_spent_minutes_per_day: timeSpentPerDay > 0 ? timeSpentPerDay : 60,
        calories_per_day: caloriesPerDay > 0 ? caloriesPerDay : 500,
      },
      firstAnchor
    );

    onComplete();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ maxWidth: '48rem', minHeight: '52rem' }}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '0.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: s <= step ? 'var(--emerald-400)' : 'rgba(255, 255, 255, 0.1)',
                transition: 'background-color var(--transition-fast)',
              }}
            />
          ))}
        </div>

        {/* STEP 1: Hábito y Alias */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <Sparkles size={24} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Configura tu Tracker</h3>
            </div>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '2.4rem' }}>
              Define qué hábito deseas superar y tu alias anónimo para la comunidad.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.8rem' }}>
                HÁBITO O ADICCIÓN
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                {['Alcohol', 'Tabaco / Nicotina', 'Azúcar / Comida', 'Personalizado'].map((item) => {
                  const isSelected = habitName === item || (item === 'Personalizado' && !['Alcohol', 'Tabaco / Nicotina', 'Azúcar / Comida'].includes(habitName));
                  return (
                    <button
                      key={item}
                      onClick={() => item !== 'Personalizado' && setHabitName(item)}
                      style={{
                        padding: '1.2rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: `0.15rem solid ${isSelected ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                        color: isSelected ? '#FFF' : 'var(--text-secondary)',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Nombre del hábito"
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

            <div style={{ marginBottom: '2.4rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.8rem' }}>
                TU ALIAS ANÓNIMO EN LA COMUNIDAD
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ej. Phoenix_94"
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
              {onCancel && (
                <button onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              )}
              <button
                onClick={() => setStep(2)}
                className="btn-primary"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <span>Siguiente</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Momento del último consumo */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <Calendar size={24} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>¿Cuándo fue tu último consumo?</h3>
            </div>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '2.4rem' }}>
              Si estás empezando ahora mismo o si ya llevas días sin consumir, tu contador reflejará el tiempo exacto.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.4rem' }}>
              <button
                onClick={() => setIsPastDate(false)}
                style={{
                  padding: '1.4rem',
                  borderRadius: 'var(--radius-md)',
                  background: !isPastDate ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `0.15rem solid ${!isPastDate ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                  color: !isPastDate ? '#FFF' : 'var(--text-secondary)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>Empezar ahora mismo (Día 0)</div>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  El reloj empezará a contar desde este instante.
                </div>
              </button>

              <button
                onClick={() => setIsPastDate(true)}
                style={{
                  padding: '1.4rem',
                  borderRadius: 'var(--radius-md)',
                  background: isPastDate ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `0.15rem solid ${isPastDate ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                  color: isPastDate ? '#FFF' : 'var(--text-secondary)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>Ya llevo días limpio (Fecha anterior)</div>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Indica la fecha y hora exacta en que decidiste parar.
                </div>
              </button>
            </div>

            {isPastDate && (
              <div style={{ marginBottom: '2.4rem' }}>
                <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.8rem' }}>
                  FECHA Y HORA DEL ÚLTIMO CONSUMO
                </label>
                <input
                  type="datetime-local"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
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
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                <span>Siguiente</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Impacto financiero y de tiempo */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <Euro size={24} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Impacto Semanal</h3>
            </div>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '2.4rem' }}>
              Calcularemos en vivo el dinero, calorías y horas que vas a recuperar.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '1.3rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  ¿CUÁNTOS DÍAS A LA SEMANA CONSUMÍAS?
                </label>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                  {daysPerWeek} días/sem
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={7}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--emerald-400)' }}
              />
            </div>

            <div style={{ marginBottom: '2.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '1.3rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  ¿CUÁNTO GASTABAS DE MEDIA CADA VEZ?
                </label>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                  {spendPerSession}€ por vez
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                step={5}
                value={spendPerSession}
                onChange={(e) => setSpendPerSession(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--emerald-400)' }}
              />

              <div
                style={{
                  marginTop: '1.4rem',
                  padding: '1.2rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1.3rem',
                  color: 'var(--emerald-400)',
                  fontWeight: 600,
                }}
              >
                Ahorro estimado al mes: ~{Math.round(((daysPerWeek * spendPerSession) / 7) * 30)}€ y más de 30 horas ganadas.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button onClick={() => setStep(4)} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                <span>Siguiente</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Tu razón #1 (Primera Ancla) */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <Heart size={24} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Tu Motivo #1</h3>
            </div>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '2.4rem' }}>
              ¿Cuál es tu razón más profunda para dar este paso? Te la mostraremos en tus momentos de crisis.
            </p>

            <div style={{ marginBottom: '2.4rem' }}>
              <textarea
                value={firstAnchor}
                onChange={(e) => setFirstAnchor(e.target.value)}
                placeholder="Ej. Por mis hijos, para tener el control de mi vida y no volver a sentir culpa..."
                rows={4}
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
              <button onClick={() => setStep(3)} className="btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} />
                <span>Atrás</span>
              </button>
              <button onClick={handleFinish} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                <ShieldCheck size={18} />
                <span>Iniciar Mi Recuperación</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
