import React, { useState, useEffect } from 'react';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingPacer: React.FC = () => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition phases
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          setPhase('inhale');
          setCyclesCompleted((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const phaseConfig = {
    inhale: {
      label: 'INHALA POR LA NARIZ',
      color: 'var(--cyan-400)',
      glow: 'rgba(6, 182, 212, 0.4)',
      scale: 1.25,
      transitionDuration: '4s',
    },
    hold: {
      label: 'MANTÉN EL AIRE',
      color: 'var(--purple-400)',
      glow: 'rgba(139, 92, 246, 0.4)',
      scale: 1.25,
      transitionDuration: '0s',
    },
    exhale: {
      label: 'EXHALA DESPACIO POR LA BOCA',
      color: 'var(--emerald-400)',
      glow: 'rgba(16, 185, 129, 0.4)',
      scale: 0.85,
      transitionDuration: '8s',
    },
  };

  const current = phaseConfig[phase];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
      <div
        style={{
          position: 'relative',
          width: '20rem',
          height: '20rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulsing Outer Glow Ring */}
        <div
          style={{
            position: 'absolute',
            width: '18rem',
            height: '18rem',
            borderRadius: '50%',
            background: current.glow,
            filter: 'blur(24px)',
            transform: `scale(${current.scale})`,
            transition: `transform ${current.transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
            opacity: 0.6,
          }}
        />

        {/* Breathing Circle */}
        <div
          style={{
            width: '14rem',
            height: '14rem',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1F2A3F 0%, #0F1420 100%)',
            border: `0.3rem solid ${current.color}`,
            boxShadow: `0 0 3rem ${current.glow}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${current.scale})`,
            transition: `transform ${current.transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
            zIndex: 2,
          }}
        >
          <span
            className="tabular-nums"
            style={{
              fontSize: '4.2rem',
              fontWeight: 800,
              color: current.color,
              lineHeight: 1,
            }}
          >
            {secondsLeft}
          </span>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.4rem' }}>
            SEGUNDOS
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: '2rem',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: current.color,
          letterSpacing: '0.05em',
          textAlign: 'center',
        }}
      >
        {current.label}
      </div>

      <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        Técnica neurofisiológica 4-7-8 · Ciclo #{cyclesCompleted + 1}
      </div>
    </div>
  );
};
