import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { ShieldCheck, ArrowRight, ArrowLeft, Heart, Euro, Calendar, Sparkles, Clock, Award } from 'lucide-react';

const PRESET_CLEAN_TIMES = [
  { label: 'Hoy (Día 0)', days: 0 },
  { label: 'Ayer (1 día)', days: 1 },
  { label: '3 días', days: 3 },
  { label: '1 semana (7d)', days: 7 },
  { label: '2 semanas (14d)', days: 14 },
  { label: '1 mes (30d)', days: 30 },
  { label: '2 meses (60d)', days: 60 },
  { label: '3 meses (90d)', days: 90 },
  { label: '6 meses (180d)', days: 180 },
  { label: '1 año (365d)', days: 365 },
];

interface SetupTrackerWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const SetupTrackerWizard: React.FC<SetupTrackerWizardProps> = ({ onComplete, onCancel }) => {
  const initNewTracker = useTrackerStore((state) => state.initNewTracker);
  const profile = useTrackerStore((state) => state.profile);
  const updateUserProfile = useTrackerStore((state) => state.updateUserProfile);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [habitName, setHabitName] = useState('Alcohol');
  const [alias, setAlias] = useState(profile.anonymous_alias || `Sobrio_${Math.floor(Math.random() * 900 + 100)}`);
  
  // Date State: Presets or Custom
  const [cleanDaysPreset, setCleanDaysPreset] = useState<number | 'custom'>(0);
  const [customDaysInput, setCustomDaysInput] = useState<string>('0');
  const [exactDateInput, setExactDateInput] = useState<string>(new Date().toISOString().slice(0, 16));
  const [useExactDatePicker, setUseExactDatePicker] = useState<boolean>(false);

  // Financial & Habit Impact
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [spendPerSession, setSpendPerSession] = useState(25);

  // Anchor
  const [firstAnchor, setFirstAnchor] = useState('Recuperar mi claridad mental, salud y control');

  const getFinalStartDate = (): string => {
    if (useExactDatePicker) {
      const parsed = new Date(exactDateInput);
      return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    }
    if (cleanDaysPreset === 'custom') {
      const days = Math.max(0, parseInt(customDaysInput, 10) || 0);
      return new Date(Date.now() - days * 86400000).toISOString();
    }
    return new Date(Date.now() - cleanDaysPreset * 86400000).toISOString();
  };

  const currentDiffDays = useExactDatePicker
    ? Math.max(0, Math.floor((Date.now() - new Date(exactDateInput).getTime()) / 86400000))
    : cleanDaysPreset === 'custom'
    ? Math.max(0, parseInt(customDaysInput, 10) || 0)
    : cleanDaysPreset;

  const handleFinish = () => {
    const finalStartDate = getFinalStartDate();

    const costPerDay = Number(((daysPerWeek * spendPerSession) / 7).toFixed(2));
    const timeSpentPerDay = Math.round((daysPerWeek * 120) / 7);
    const caloriesPerDay = Math.round((daysPerWeek * 700) / 7);

    const chosenAlias = alias.trim() || profile.anonymous_alias;
    updateUserProfile(chosenAlias, profile.avatar_color);

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

        {/* STEP 2: Momento del último consumo / Tiempo Limpio */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <Clock size={24} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>¿Cuánto tiempo llevas limpio?</h3>
            </div>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '1.8rem' }}>
              Casi nadie empieza en el segundo exacto. Si ya llevas horas, días o semanas sin consumir, tu
              contador reflejará todo tu esfuerzo acumulado.
            </p>

            {/* Presets Chips */}
            <div style={{ marginBottom: '1.6rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.8rem' }}>
                ELIGE TU TIEMPO LIMPIO ACTUAL
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {PRESET_CLEAN_TIMES.map((opt) => {
                  const isSelected = !useExactDatePicker && cleanDaysPreset === opt.days;
                  return (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => {
                        setUseExactDatePicker(false);
                        setCleanDaysPreset(opt.days);
                        setCustomDaysInput(opt.days.toString());
                        const d = new Date(Date.now() - opt.days * 86400000);
                        setExactDateInput(d.toISOString().slice(0, 16));
                      }}
                      className="touch-target"
                      style={{
                        padding: '0.7rem 1.2rem',
                        borderRadius: 'var(--radius-full)',
                        background: isSelected ? 'var(--emerald-400)' : 'rgba(255, 255, 255, 0.05)',
                        border: `0.1rem solid ${isSelected ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                        color: isSelected ? '#000' : 'var(--text-primary)',
                        fontWeight: isSelected ? 800 : 500,
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                      aria-label={`Seleccionar ${opt.label} de tiempo limpio`}
                    >
                      {opt.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCleanDaysPreset('custom')}
                  className="touch-target"
                  style={{
                    padding: '0.7rem 1.2rem',
                    borderRadius: 'var(--radius-full)',
                    background: cleanDaysPreset === 'custom' || useExactDatePicker ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `0.1rem solid ${cleanDaysPreset === 'custom' || useExactDatePicker ? '#3B82F6' : 'var(--border-subtle)'}`,
                    color: cleanDaysPreset === 'custom' || useExactDatePicker ? '#60A5FA' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                  }}
                  aria-label="Introducir días o fecha exacta"
                >
                  Otro / Personalizado
                </button>
              </div>
            </div>

            {/* Custom Days or Calendar Picker */}
            {(cleanDaysPreset === 'custom' || useExactDatePicker) && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '0.1rem solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.4rem',
                  marginBottom: '1.6rem',
                  animation: 'fadeIn 150ms ease',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
                  <button
                    type="button"
                    onClick={() => setUseExactDatePicker(false)}
                    style={{
                      flex: 1,
                      padding: '0.7rem',
                      borderRadius: 'var(--radius-sm)',
                      background: !useExactDatePicker ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      border: `0.1rem solid ${!useExactDatePicker ? '#3B82F6' : 'transparent'}`,
                      color: !useExactDatePicker ? '#FFF' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    Indicar Días
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseExactDatePicker(true)}
                    style={{
                      flex: 1,
                      padding: '0.7rem',
                      borderRadius: 'var(--radius-sm)',
                      background: useExactDatePicker ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      border: `0.1rem solid ${useExactDatePicker ? '#3B82F6' : 'transparent'}`,
                      color: useExactDatePicker ? '#FFF' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    Fecha y Hora Exacta
                  </button>
                </div>

                {!useExactDatePicker ? (
                  <div>
                    <label
                      htmlFor="wizard-custom-days"
                      style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}
                    >
                      ¿CUÁNTOS DÍAS LLEVAS SIN CONSUMIR?
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        id="wizard-custom-days"
                        type="number"
                        min="0"
                        max="10000"
                        value={customDaysInput}
                        onChange={(e) => {
                          setCustomDaysInput(e.target.value);
                          const days = Math.max(0, parseInt(e.target.value, 10) || 0);
                          const d = new Date(Date.now() - days * 86400000);
                          setExactDateInput(d.toISOString().slice(0, 16));
                        }}
                        style={{
                          width: '12rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '0.1rem solid var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem 1.2rem',
                          color: 'var(--text-primary)',
                          fontSize: '1.6rem',
                          fontWeight: 800,
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        días continuos
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="wizard-exact-date"
                      style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}
                    >
                      FECHA Y HORA DE TU ÚLTIMO CONSUMO
                    </label>
                    <input
                      id="wizard-exact-date"
                      type="datetime-local"
                      value={exactDateInput}
                      onChange={(e) => {
                        setExactDateInput(e.target.value);
                        const parsed = new Date(e.target.value);
                        if (!isNaN(parsed.getTime())) {
                          const diff = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86400000));
                          setCustomDaysInput(diff.toString());
                        }
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.06)',
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
              </div>
            )}

            {/* Live Preview Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(18, 24, 36, 0.9) 100%)',
                border: '0.1rem solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.6rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                <Sparkles size={18} color="var(--emerald-400)" />
                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
                  ESTADO INICIAL DEL CONTADOR
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.35rem', color: 'var(--text-secondary)' }}>Tu racha arrancará con:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
                  {currentDiffDays} {currentDiffDays === 1 ? 'Día' : 'Días'} limpios
                </span>
              </div>

              <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                {currentDiffDays > 0 ? (
                  <span>
                    ¡Excelente decisión! Se generará tu historial retrospectivo para que tu calendario de sobriedad y tus
                    estadísticas comiencen reflejando tu esfuerzo real.
                  </span>
                ) : (
                  <span>
                    El reloj empezará a contar desde este momento. ¡El mejor momento para empezar es hoy!
                  </span>
                )}
              </div>
            </div>

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
