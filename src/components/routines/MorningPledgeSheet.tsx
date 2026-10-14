import React, { useState, useRef, useEffect } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { Sun, CheckCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MorningPledgeSheet: React.FC = () => {
  const isOpen = useTrackerStore((state) => state.isMorningPledgeOpen);
  const openMorningPledge = useTrackerStore((state) => state.openMorningPledge);
  const signMorningPledge = useTrackerStore((state) => state.signMorningPledge);
  const activeTrackerId = useTrackerStore((state) => state.activeTrackerId);
  const activeTracker = useTrackerStore((state) =>
    state.trackers.find((t) => t.id === activeTrackerId)
  );

  const [holdingProgress, setHoldingProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  const HOLD_DURATION = 1500; // 1.5 seconds

  const startHolding = () => {
    if (isCompleted) return;
    const startTime = Date.now();

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldingProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        triggerSuccess();
      }
    }, 16);
  };

  const stopHolding = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (!isCompleted) {
      setHoldingProgress(0);
    }
  };

  const triggerSuccess = () => {
    setIsCompleted(true);

    // Haptic vibration
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([50, 30, 80]);
      } catch {}
    }

    // Confetti in emerald tones
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#059669', '#6EE7B7'],
      });
    } catch {}

    setTimeout(() => {
      signMorningPledge();
      setIsCompleted(false);
      setHoldingProgress(0);
    }, 900);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => openMorningPledge(false)}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Sun size={24} color="var(--amber-400)" />
            <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Compromiso Matutino</h3>
          </div>
          <button
            onClick={() => openMorningPledge(false)}
            className="touch-target"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '1.45rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2.4rem' }}>
          Un día a la vez. No prometas que nunca más volverás a consumir {activeTracker?.habit_name || 'alcohol'};
          solo comprométete contigo mismo a no hacerlo durante las próximas 24 horas.
        </p>

        {/* Hold to Pledge Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
          <div style={{ position: 'relative', width: '16rem', height: '16rem' }}>
            {/* SVG progress ring */}
            <svg width={160} height={160} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
              <circle
                cx={80}
                cy={80}
                r={72}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={8}
              />
              <circle
                cx={80}
                cy={80}
                r={72}
                fill="transparent"
                stroke="var(--emerald-400)"
                strokeWidth={8}
                strokeDasharray={2 * Math.PI * 72}
                strokeDashoffset={2 * Math.PI * 72 - (holdingProgress / 100) * (2 * Math.PI * 72)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 20ms linear' }}
              />
            </svg>

            {/* Hold trigger circle */}
            <button
              onPointerDown={startHolding}
              onPointerUp={stopHolding}
              onPointerLeave={stopHolding}
              style={{
                position: 'absolute',
                inset: '1.2rem',
                borderRadius: '50%',
                background: isCompleted
                  ? 'var(--emerald-500)'
                  : 'radial-gradient(circle, #1F2A3F 0%, #131A27 100%)',
                border: '0.2rem solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                transform: holdingProgress > 0 ? 'scale(0.96)' : 'scale(1)',
                boxShadow: holdingProgress > 0 ? '0 0 2.5rem var(--emerald-glow)' : 'var(--shadow-card)',
              }}
              aria-label="Mantén pulsado 1.5 segundos para firmar tu compromiso de hoy"
            >
              {isCompleted ? (
                <>
                  <CheckCircle size={36} color="#FFF" />
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.4rem' }}>¡FIRMADO!</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', padding: '0 1rem' }}>
                    {holdingProgress > 0 ? 'MANTÉN...' : 'MANTÉN 1.5s'}
                  </span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Para firmar
                  </span>
                </>
              )}
            </button>
          </div>

          <span style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginTop: '1.6rem', textAlign: 'center' }}>
            Mantén presionado conscientemente para anclar tu decisión en el cerebro.
          </span>
        </div>
      </div>
    </div>
  );
};
