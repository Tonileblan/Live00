import React from 'react';
import { Euro, Flame, Clock } from 'lucide-react';

interface SavingsMetricsGridProps {
  money: number;
  calories: number;
  hoursGained: number;
}

export const SavingsMetricsGrid: React.FC<SavingsMetricsGridProps> = ({
  money,
  calories,
  hoursGained,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.2rem',
        width: '100%',
      }}
    >
      {/* 1. Money Saved */}
      <div
        className="glass-panel"
        style={{
          padding: '1.6rem 1.2rem',
          textAlign: 'center',
          borderTop: '0.3rem solid var(--emerald-400)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            marginBottom: '0.8rem',
          }}
        >
          <Euro size={18} color="var(--emerald-400)" />
        </div>
        <div
          className="tabular-nums"
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#FFF',
            lineHeight: 1.1,
          }}
        >
          {money.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}€
        </div>
        <div
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            marginTop: '0.4rem',
            textTransform: 'uppercase',
          }}
        >
          Ahorrado
        </div>
      </div>

      {/* 2. Calories avoided */}
      <div
        className="glass-panel"
        style={{
          padding: '1.6rem 1.2rem',
          textAlign: 'center',
          borderTop: '0.3rem solid var(--amber-400)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(245, 158, 11, 0.15)',
            marginBottom: '0.8rem',
          }}
        >
          <Flame size={18} color="var(--amber-400)" />
        </div>
        <div
          className="tabular-nums"
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#FFF',
            lineHeight: 1.1,
          }}
        >
          {calories.toLocaleString('es-ES')}
        </div>
        <div
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            marginTop: '0.4rem',
            textTransform: 'uppercase',
          }}
        >
          Kcal Evitadas
        </div>
      </div>

      {/* 3. Hours gained */}
      <div
        className="glass-panel"
        style={{
          padding: '1.6rem 1.2rem',
          textAlign: 'center',
          borderTop: '0.3rem solid var(--purple-400)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(139, 92, 246, 0.15)',
            marginBottom: '0.8rem',
          }}
        >
          <Clock size={18} color="var(--purple-400)" />
        </div>
        <div
          className="tabular-nums"
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#FFF',
            lineHeight: 1.1,
          }}
        >
          {hoursGained}h
        </div>
        <div
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            marginTop: '0.4rem',
            textTransform: 'uppercase',
          }}
        >
          Vida Ganada
        </div>
      </div>
    </div>
  );
};
