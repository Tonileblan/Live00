import React from 'react';
import { MilestoneProgress } from '../../types/database.types';
import { Award, Sparkles, Moon, Heart, ShieldCheck, Brain, Trophy, Activity } from 'lucide-react';

interface MilestoneRingProps {
  progress: MilestoneProgress;
}

const BADGE_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Sparkles: Sparkles,
  Activity: Activity,
  Moon: Moon,
  Heart: Heart,
  ShieldCheck: ShieldCheck,
  Brain: Brain,
  Trophy: Trophy,
};

export const MilestoneRing: React.FC<MilestoneRingProps> = ({ progress }) => {
  const next = progress.next;
  const current = progress.current;
  const IconComponent = next?.badge_icon && BADGE_ICONS[next.badge_icon] ? BADGE_ICONS[next.badge_icon] : Award;

  const daysLeft = Math.ceil(progress.secondsRemaining / 86400);

  // SVG Circular parameters
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.8rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.6rem',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Próximo Gran Hito
          </span>
        </div>

        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          {next ? next.title : '¡1 Año Superado!'}
        </h3>

        <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {next
            ? `Quedan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'} para alcanzar esta meta clínica.`
            : 'Has completado todos los hitos del primer año. Eres un titán.'}
        </p>

        {current && (
          <div style={{ marginTop: '0.8rem', fontSize: '1.1rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
            ✓ Último hito consolidado: {current.title}
          </div>
        )}
      </div>

      {/* Circular Progress Ring */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Path */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#emerald-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 500ms ease' }}
          />
          <defs>
            <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--emerald-400)" />
              <stop offset="100%" stopColor="var(--cyan-400)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center icon & percentage */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComponent size={22} color="var(--emerald-400)" />
          <span className="tabular-nums" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', marginTop: '0.2rem' }}>
            {progress.percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
