import React from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { FormattedTime } from '../../hooks/useSobrietyTicker';
import { RefreshCw } from 'lucide-react';

interface SobrietyClockProps {
  time: FormattedTime;
  habitName?: string;
}

export const SobrietyClock: React.FC<SobrietyClockProps> = ({ time, habitName = 'Alcohol' }) => {
  const clockMode = useTrackerStore((state) => state.clockMode);
  const setClockMode = useTrackerStore((state) => state.setClockMode);

  const toggleMode = () => {
    if (clockMode === 'detailed') setClockMode('hours');
    else if (clockMode === 'hours') setClockMode('seconds');
    else setClockMode('detailed');
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      onClick={toggleMode}
      className="glass-panel glass-panel-interactive"
      style={{
        padding: '2.8rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '0.1rem solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 1rem 3rem rgba(0, 0, 0, 0.6), 0 0 2.5rem rgba(16, 185, 129, 0.1)',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Reloj de sobriedad de ${habitName}. Toca para cambiar formato de visualización`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMode()}
    >
      {/* Background glow accent */}
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28rem',
          height: '28rem',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 1.2rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--emerald-400)',
            fontSize: '1.2rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1.6rem',
          }}
        >
          <span style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: 'var(--emerald-400)' }} />
          <span>Tiempo Limpio de {habitName}</span>
        </div>

        {/* View Mode 1: Detailed (Months / Days / Hours / Minutes / Seconds) */}
        {clockMode === 'detailed' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '0.4rem',
                flexWrap: 'nowrap',
              }}
            >
              {time.months > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '5.6rem' }}>
                  <span className="tabular-nums" style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1, color: '#FFF' }}>
                    {time.months}
                  </span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.4rem' }}>
                    {time.months === 1 ? 'Mes' : 'Meses'}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '5.6rem' }}>
                <span className="tabular-nums" style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1, color: '#FFF' }}>
                  {time.days}
                </span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.4rem' }}>
                  {time.days === 1 ? 'Día' : 'Días'}
                </span>
              </div>

              <span style={{ fontSize: '2.8rem', color: 'var(--text-muted)', lineHeight: 1, opacity: 0.5 }}>:</span>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '5.6rem' }}>
                <span className="tabular-nums" style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1, color: '#FFF' }}>
                  {padZero(time.hours)}
                </span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.4rem' }}>
                  Horas
                </span>
              </div>

              <span style={{ fontSize: '2.8rem', color: 'var(--text-muted)', lineHeight: 1, opacity: 0.5 }}>:</span>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '5.6rem' }}>
                <span className="tabular-nums" style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1, color: '#FFF' }}>
                  {padZero(time.minutes)}
                </span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.4rem' }}>
                  Min
                </span>
              </div>

              <span style={{ fontSize: '2.8rem', color: 'var(--text-muted)', lineHeight: 1, opacity: 0.5 }}>:</span>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '5.6rem' }}>
                <span className="tabular-nums" style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1, color: 'var(--emerald-400)' }}>
                  {padZero(time.seconds)}
                </span>
                <span style={{ fontSize: '1.1rem', color: 'var(--emerald-400)', textTransform: 'uppercase', fontWeight: 600, marginTop: '0.4rem' }}>
                  Seg
                </span>
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: Total Hours */}
        {clockMode === 'hours' && (
          <div style={{ padding: '0.8rem 0' }}>
            <div className="tabular-nums" style={{ fontSize: '4.8rem', fontWeight: 800, color: 'var(--emerald-400)', lineHeight: 1 }}>
              {Number(time.totalHours).toLocaleString('es-ES')}
            </div>
            <div style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.8rem' }}>
              Horas continuas de sobriedad
            </div>
          </div>
        )}

        {/* View Mode 3: Total Seconds */}
        {clockMode === 'seconds' && (
          <div style={{ padding: '0.8rem 0' }}>
            <div className="tabular-nums" style={{ fontSize: '4.2rem', fontWeight: 800, color: 'var(--cyan-400)', lineHeight: 1 }}>
              {time.totalSeconds.toLocaleString('es-ES')}
            </div>
            <div style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.8rem' }}>
              Segundos de victoria biológica
            </div>
          </div>
        )}

        {/* Mode switcher hint */}
        <div
          style={{
            marginTop: '1.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <RefreshCw size={12} />
          <span>Toca para alternar vista (Detalle / Horas / Segundos)</span>
        </div>
      </div>
    </div>
  );
};
