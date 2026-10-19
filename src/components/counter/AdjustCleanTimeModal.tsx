import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import {
  Calendar,
  Clock,
  Check,
  X,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const PRESET_OPTIONS = [
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

export const AdjustCleanTimeModal: React.FC = () => {
  const isOpen = useTrackerStore((state) => state.isAdjustCleanTimeModalOpen);
  const openAdjustCleanTimeModal = useTrackerStore((state) => state.openAdjustCleanTimeModal);
  const activeTrackerId = useTrackerStore((state) => state.activeTrackerId);
  const activeTracker = useTrackerStore((state) =>
    state.trackers.find((t) => t.id === activeTrackerId)
  );
  const adjustTrackerCleanTime = useTrackerStore((state) => state.adjustTrackerCleanTime);

  // Initialize with current tracker start date
  const currentStartDateIso = activeTracker?.start_date || new Date().toISOString();
  const [selectedDays, setSelectedDays] = useState<number | 'custom'>(() => {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(currentStartDateIso).getTime()) / 86400000));
    const matched = PRESET_OPTIONS.find((p) => p.days === diff);
    return matched ? matched.days : 'custom';
  });

  const [customDaysInput, setCustomDaysInput] = useState<string>(() => {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(currentStartDateIso).getTime()) / 86400000));
    return diff.toString();
  });

  const [exactDateInput, setExactDateInput] = useState<string>(() => {
    return new Date(currentStartDateIso).toISOString().slice(0, 16);
  });

  const [useExactDatePicker, setUseExactDatePicker] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen || !activeTracker) return null;

  const handleClose = () => {
    setFeedbackMessage(null);
    openAdjustCleanTimeModal(false);
  };

  // Calculate the target ISO date based on user's current choice
  const calculateTargetDate = (): Date => {
    if (useExactDatePicker) {
      const parsed = new Date(exactDateInput);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    if (selectedDays === 'custom') {
      const days = Math.max(0, parseInt(customDaysInput, 10) || 0);
      return new Date(Date.now() - days * 86400000);
    }

    return new Date(Date.now() - selectedDays * 86400000);
  };

  const targetDate = calculateTargetDate();
  const calculatedDaysDiff = Math.max(0, Math.floor((Date.now() - targetDate.getTime()) / 86400000));

  const handleSave = () => {
    const finalIso = targetDate.toISOString();
    adjustTrackerCleanTime(activeTracker.id, finalIso);
    setFeedbackMessage(
      calculatedDaysDiff === 0
        ? '¡Contador ajustado a Día 0 correctamente!'
        : `¡Tiempo limpio ajustado a ${calculatedDaysDiff} días con éxito!`
    );

    setTimeout(() => {
      handleClose();
    }, 850);
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 120 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjust-clean-time-title"
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
          aria-label="Cerrar modal de ajuste de tiempo limpio"
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
              background: 'rgba(16, 185, 129, 0.15)',
              border: '0.1rem solid var(--emerald-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-400)',
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <h2 id="adjust-clean-time-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
              Ajustar Tiempo Limpio
            </h2>
            <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)' }}>
              Indica cuánto tiempo llevas sin consumir {activeTracker.habit_name}.
            </p>
          </div>
        </div>

        {/* In-DOM Feedback */}
        {feedbackMessage && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '0.1rem solid var(--emerald-400)',
              borderRadius: 'var(--radius-md)',
              padding: '1.4rem',
              marginBottom: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--emerald-400)',
              fontSize: '1.4rem',
              fontWeight: 700,
              animation: 'fadeIn 150ms ease',
            }}
          >
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Presets Chips */}
        <div style={{ marginBottom: '1.6rem' }}>
          <label style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.8rem' }}>
            SELECCIONA TU TIEMPO LIMPIO ACTUAL
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {PRESET_OPTIONS.map((opt) => {
              const isSelected = !useExactDatePicker && selectedDays === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => {
                    setUseExactDatePicker(false);
                    setSelectedDays(opt.days);
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
                  aria-label={`Establecer tiempo limpio en ${opt.label}`}
                >
                  {opt.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setSelectedDays('custom');
              }}
              className="touch-target"
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                background: selectedDays === 'custom' || useExactDatePicker ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `0.1rem solid ${selectedDays === 'custom' || useExactDatePicker ? '#3B82F6' : 'var(--border-subtle)'}`,
                color: selectedDays === 'custom' || useExactDatePicker ? '#60A5FA' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1.3rem',
                cursor: 'pointer',
              }}
              aria-label="Introducir días o fecha personalizada"
            >
              Otro / Personalizado
            </button>
          </div>
        </div>

        {/* Custom Input (Number of Days or Calendar) */}
        {(selectedDays === 'custom' || useExactDatePicker) && (
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
                Número de Días
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
                  htmlFor="custom-days-field"
                  style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}
                >
                  ¿CUÁNTOS DÍAS LLEVAS LIMPIO?
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    id="custom-days-field"
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
                    días completos
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="exact-date-field"
                  style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem' }}
                >
                  FECHA Y HORA DE TU ÚLTIMO CONSUMO
                </label>
                <input
                  id="exact-date-field"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <Sparkles size={18} color="var(--emerald-400)" />
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              RESUMEN DEL NUEVO ESTADO
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '1.35rem', color: 'var(--text-secondary)' }}>Tu contador mostrará:</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
              {calculatedDaysDiff} {calculatedDaysDiff === 1 ? 'Día' : 'Días'} limpios
            </span>
          </div>

          <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Fecha de inicio registrada:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {targetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </strong>{' '}
            a las {targetDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.
          </div>

          {calculatedDaysDiff > 0 && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '0.1rem solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '1.25rem',
                color: 'var(--emerald-300)',
              }}
            >
              <Award size={16} />
              <span>
                Se actualizarán automáticamente tus hitos biológicos y el mapa de sobriedad en el diario.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary touch-target"
            style={{ flex: 1, justifyContent: 'center', fontSize: '1.35rem' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary touch-target"
            style={{ flex: 1.5, justifyContent: 'center', fontSize: '1.35rem', fontWeight: 800 }}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
