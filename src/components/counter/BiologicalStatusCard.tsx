import React from 'react';
import { MilestoneProgress } from '../../types/database.types';
import { Stethoscope, CheckCircle2 } from 'lucide-react';

interface BiologicalStatusCardProps {
  progress: MilestoneProgress;
}

export const BiologicalStatusCard: React.FC<BiologicalStatusCardProps> = ({ progress }) => {
  const current = progress.current;
  const next = progress.next;

  const currentFact = current
    ? current.biological_fact
    : 'Tu organismo está en plena fase de eliminación de toxinas primarias e hidratación celular.';

  const nextGoalTitle = next ? next.title : 'Consolidación total';
  const nextGoalFact = next?.biological_fact;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '2rem',
        borderLeft: '0.4rem solid var(--cyan-400)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
        <div
          style={{
            width: '3.2rem',
            height: '3.2rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stethoscope size={18} color="var(--cyan-400)" />
        </div>
        <div>
          <span style={{ fontSize: '1.1rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recuperación Neuro-Biológica
          </span>
          <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {current ? `Fase: ${current.title} Logradas` : 'Fase: Desintoxicación Aguda'}
          </h4>
        </div>
      </div>

      <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.4rem' }}>
        {currentFact}
      </p>

      {nextGoalFact && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            border: '0.1rem solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <CheckCircle2 size={14} color="var(--emerald-400)" />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              Próxima meta biológica ({nextGoalTitle}):
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {nextGoalFact}
          </p>
        </div>
      )}
    </div>
  );
};
