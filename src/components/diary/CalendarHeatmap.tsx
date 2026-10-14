import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { useTriggerAnalytics } from '../../hooks/useTriggerAnalytics';
import { DailyReview } from '../../types/database.types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Flame } from 'lucide-react';

export const CalendarHeatmap: React.FC = () => {
  const reviews = useTrackerStore((state) => state.reviews);
  const pledges = useTrackerStore((state) => state.pledges);
  const activeTrackerId = useTrackerStore((state) => state.activeTrackerId);
  const { highestRiskDay, topTriggers, preventiveAlert, totalUrgesOvercome } = useTriggerAnalytics();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReview, setSelectedReview] = useState<DailyReview | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  // Map reviews by YYYY-MM-DD
  const reviewsMap = new Map<string, DailyReview>();
  reviews
    .filter((r) => r.tracker_id === activeTrackerId)
    .forEach((r) => reviewsMap.set(r.review_date, r));

  // Map pledges
  const pledgesSet = new Set(
    pledges
      .filter((p) => p.tracker_id === activeTrackerId)
      .map((p) => p.pledge_date)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Calendar Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {/* Month Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <CalendarIcon size={20} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {monthNames[month]} {year}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={prevMonth}
              className="touch-target"
              style={{
                width: '3.6rem',
                height: '3.6rem',
                minWidth: '3.6rem',
                minHeight: '3.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
              }}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="touch-target"
              style={{
                width: '3.6rem',
                height: '3.6rem',
                minWidth: '3.6rem',
                minHeight: '3.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
              }}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            marginBottom: '0.8rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
          }}
        >
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem' }}>
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} style={{ height: '4rem' }} />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const review = reviewsMap.get(dateStr);
            const isPledged = pledgesSet.has(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            // Color calculation from PRD:
            // Verde Esmeralda (#10B981): Día sobrio con dificultad baja (1-2)
            // Ámbar (#F59E0B): Día sobrio pero con dificultad alta (4-5, victoria difícil)
            // Rojo Coral (#EF4444): Día con registro de recaída
            // Borde punteado: Compromiso matutino firmado, pendiente de revisión nocturna.
            let bgColor = 'rgba(255, 255, 255, 0.03)';
            let borderColor = 'transparent';
            let textColor = 'var(--text-secondary)';

            if (review) {
              if (!review.stayed_sober) {
                bgColor = 'rgba(239, 68, 68, 0.25)';
                borderColor = 'var(--coral-500)';
                textColor = '#FFF';
              } else if (review.difficulty_rating >= 4) {
                bgColor = 'rgba(245, 158, 11, 0.25)';
                borderColor = 'var(--amber-500)';
                textColor = '#FFF';
              } else {
                bgColor = 'rgba(16, 185, 129, 0.25)';
                borderColor = 'var(--emerald-500)';
                textColor = '#FFF';
              }
            } else if (isPledged) {
              borderColor = 'var(--amber-400)';
            }

            return (
              <button
                key={dayNum}
                onClick={() => review && setSelectedReview(review)}
                style={{
                  height: '4rem',
                  borderRadius: 'var(--radius-sm)',
                  background: bgColor,
                  border: isPledged && !review ? '0.15rem dashed var(--amber-400)' : `0.1rem solid ${borderColor}`,
                  color: textColor,
                  fontSize: '1.3rem',
                  fontWeight: isToday ? 800 : 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: review ? 'pointer' : 'default',
                  position: 'relative',
                  outline: isToday ? '0.2rem solid #FFF' : 'none',
                }}
                aria-label={`Día ${dayNum} de ${monthNames[month]}`}
              >
                <span>{dayNum}</span>
                {review && (
                  <span
                    style={{
                      width: '0.4rem',
                      height: '0.4rem',
                      borderRadius: '50%',
                      background: review.stayed_sober ? (review.difficulty_rating >= 4 ? 'var(--amber-400)' : 'var(--emerald-400)') : 'var(--coral-400)',
                      marginTop: '0.2rem',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.2rem',
            marginTop: '1.8rem',
            paddingTop: '1.2rem',
            borderTop: '0.1rem solid var(--border-subtle)',
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '1rem', height: '1rem', borderRadius: '0.2rem', background: 'var(--emerald-500)' }} />
            <span>Sobrio (Paz)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '1rem', height: '1rem', borderRadius: '0.2rem', background: 'var(--amber-500)' }} />
            <span>Victoria Difícil</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '1rem', height: '1rem', borderRadius: '0.2rem', background: 'var(--coral-500)' }} />
            <span>Recaída</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '1rem', height: '1rem', borderRadius: '0.2rem', border: '0.1rem dashed var(--amber-400)' }} />
            <span>Compromiso Hoy</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Card */}
      {selectedReview && (
        <div
          className="glass-panel"
          style={{
            padding: '1.6rem 2rem',
            borderLeft: `0.4rem solid ${selectedReview.stayed_sober ? (selectedReview.difficulty_rating >= 4 ? 'var(--amber-500)' : 'var(--emerald-500)') : 'var(--coral-500)'}`,
            animation: 'fadeIn 200ms ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h4 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              Detalles del {selectedReview.review_date}
            </h4>
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: selectedReview.stayed_sober ? 'var(--emerald-400)' : 'var(--coral-400)',
              }}
            >
              {selectedReview.stayed_sober ? '✓ Sobrio' : '✕ Recaída'}
            </span>
          </div>
          <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
            Dificultad evaluada: <strong>{selectedReview.difficulty_rating} / 5</strong>
          </p>
          {selectedReview.triggers.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.8rem' }}>
              {selectedReview.triggers.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: '1.15rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {selectedReview.notes && (
            <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              "{selectedReview.notes}"
            </p>
          )}
        </div>
      )}

      {/* Analytics Card (PRD 3.C) */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.4rem' }}>
          <AlertCircle size={20} color="var(--amber-400)" />
          <h4 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Analítica de Vulnerabilidad</h4>
        </div>

        <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.6rem' }}>
          {preventiveAlert}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.2rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              DÍA CON MAYOR RETO
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-400)', marginTop: '0.4rem' }}>
              {highestRiskDay}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.2rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              CRISIS SUPERADAS (SOS)
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '0.4rem' }}>
              +{totalUrgesOvercome} vencidas
            </div>
          </div>
        </div>

        {topTriggers.length > 0 && (
          <div style={{ marginTop: '1.6rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.8rem' }}>
              TOP DETONANTES DETECTADOS
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {topTriggers.map((t, idx) => (
                <div
                  key={t.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.3rem',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span>
                    #{idx + 1} {t.name}
                  </span>
                  <strong style={{ color: 'var(--emerald-400)' }}>{t.count} veces</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
