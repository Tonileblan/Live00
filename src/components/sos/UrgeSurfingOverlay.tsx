import React, { useState, useEffect } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { BreathingPacer } from './BreathingPacer';
import { WhyIDoThisCarousel } from './WhyIDoThisCarousel';
import { ShieldCheck, X, LifeBuoy, Heart, Wind } from 'lucide-react';
import confetti from 'canvas-confetti';

export const UrgeSurfingOverlay: React.FC = () => {
  const isOpen = useTrackerStore((state) => state.isSOSOpen);
  const openSOS = useTrackerStore((state) => state.openSOS);
  const logUrgeOvercome = useTrackerStore((state) => state.logUrgeOvercome);

  // 5-minute countdown (300 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [activeSection, setActiveSection] = useState<'breathe' | 'motives'>('breathe');

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(300);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleOvercome = () => {
    logUrgeOvercome(8, 'Impulso agudo gestionado con SOS', 'Respiración 4-7-8 y anclas motivacionales');

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10B981', '#06B6D4', '#F59E0B'],
      });
    } catch {}

    openSOS(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(11, 14, 20, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        padding: '2rem 1.6rem 4rem 1.6rem',
        animation: 'fadeIn 200ms ease',
      }}
    >
      <div style={{ width: '100%', maxWidth: '48rem', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar with close button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <LifeBuoy size={26} color="var(--amber-400)" />
            <div>
              <span style={{ fontSize: '1.1rem', color: 'var(--amber-400)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                PROTOCOLO DE EMERGENCIA
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF' }}>
                Urge Surfing (Surfear la Ola)
              </h2>
            </div>
          </div>

          <button
            onClick={() => openSOS(false)}
            className="touch-target"
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
            }}
            aria-label="Cerrar modo SOS"
          >
            <X size={20} />
          </button>
        </div>

        {/* Craving peak insight */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '0.1rem solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.4rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.2rem', color: 'var(--amber-400)', fontWeight: 700, marginBottom: '0.4rem' }}>
            VENTANA NEUROCIENTÍFICA DEL DESEO (3 A 5 MINUTOS)
          </div>
          <div className="tabular-nums" style={{ fontSize: '3.6rem', fontWeight: 800, color: '#FFF' }}>
            {pad(minutes)}:{pad(seconds)}
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4 }}>
            El deseo físico no es infinito: sube como una ola y se disuelve en 3-5 minutos si no lo alimentas.
          </p>
        </div>

        {/* Tool Switcher (Breathing vs Motives) */}
        <div
          style={{
            display: 'flex',
            gap: '0.8rem',
            marginBottom: '2rem',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <button
            onClick={() => setActiveSection('breathe')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: 'var(--radius-full)',
              background: activeSection === 'breathe' ? 'var(--emerald-500)' : 'transparent',
              color: activeSection === 'breathe' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '1.3rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Wind size={16} />
            <span>Respiración 4-7-8</span>
          </button>

          <button
            onClick={() => setActiveSection('motives')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: 'var(--radius-full)',
              background: activeSection === 'motives' ? 'var(--purple-500)' : 'transparent',
              color: activeSection === 'motives' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '1.3rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Heart size={16} />
            <span>Mis Motivos</span>
          </button>
        </div>

        {/* Tool Content */}
        {activeSection === 'breathe' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BreathingPacer />
          </div>
        ) : (
          <div style={{ margin: '1rem 0 2rem 0' }}>
            <WhyIDoThisCarousel />
          </div>
        )}

        {/* Overcome Button */}
        <div style={{ marginTop: '2.4rem' }}>
          <button
            onClick={handleOvercome}
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: '5.6rem',
              fontSize: '1.7rem',
              justifyContent: 'center',
              boxShadow: '0 0.8rem 2.4rem rgba(16, 185, 129, 0.4)',
            }}
          >
            <ShieldCheck size={22} />
            <span>He superado el impulso (+1 Victoria)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
