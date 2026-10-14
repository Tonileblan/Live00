import React from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { useSobrietyTicker } from '../../hooks/useSobrietyTicker';
import { useMilestoneEngine } from '../../hooks/useMilestoneEngine';
import { SobrietyClock } from '../counter/SobrietyClock';
import { MilestoneRing } from '../counter/MilestoneRing';
import { BiologicalStatusCard } from '../counter/BiologicalStatusCard';
import { SavingsMetricsGrid } from '../counter/SavingsMetricsGrid';
import { Sun, Moon, CheckCircle2, RefreshCcw } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const activeTrackerId = useTrackerStore((state) => state.activeTrackerId);
  const activeTracker = useTrackerStore((state) =>
    state.trackers.find((t) => t.id === activeTrackerId)
  );
  const pledges = useTrackerStore((state) => state.pledges);
  const reviews = useTrackerStore((state) => state.reviews);
  const openMorningPledge = useTrackerStore((state) => state.openMorningPledge);
  const openEveningReview = useTrackerStore((state) => state.openEveningReview);
  const openResetModal = useTrackerStore((state) => state.openResetModal);

  const { time, savings, elapsedSeconds } = useSobrietyTicker();
  const milestoneProgress = useMilestoneEngine(elapsedSeconds);

  // Time-of-day logic from PRD 3.B
  // 05:00 to 15:59 -> Morning window (Pledge)
  // 16:00 to 04:59 -> Evening window (Review)
  const currentHour = new Date().getHours();
  const isMorningWindow = currentHour >= 5 && currentHour < 16;

  const todayStr = new Date().toISOString().split('T')[0];
  const hasPledgedToday = pledges.some(
    (p) => p.tracker_id === activeTrackerId && p.pledge_date === todayStr
  );
  const hasReviewedToday = reviews.some(
    (r) => r.tracker_id === activeTrackerId && r.review_date === todayStr
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Dynamic Routine Action Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.6rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isMorningWindow
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(18, 24, 36, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(18, 24, 36, 0.9) 100%)',
          borderLeft: `0.4rem solid ${isMorningWindow ? 'var(--amber-400)' : 'var(--purple-400)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {isMorningWindow ? (
            <Sun size={24} color="var(--amber-400)" />
          ) : (
            <Moon size={24} color="var(--purple-400)" />
          )}
          <div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              {isMorningWindow ? 'Rutina Matutina' : 'Rutina Nocturna'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isMorningWindow
                ? hasPledgedToday
                  ? 'Compromiso de hoy firmado'
                  : 'Firma tu compromiso de hoy'
                : hasReviewedToday
                ? 'Día evaluado con éxito'
                : 'Revisa y cierra tu día'}
            </div>
          </div>
        </div>

        <div>
          {isMorningWindow ? (
            hasPledgedToday ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--emerald-400)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={18} />
                <span>Firmado</span>
              </div>
            ) : (
              <button
                onClick={() => openMorningPledge(true)}
                className="btn-primary"
                style={{
                  padding: '0.8rem 1.6rem',
                  minHeight: '4rem',
                  fontSize: '1.35rem',
                  background: 'linear-gradient(135deg, var(--amber-500) 0%, #D97706 100%)',
                }}
              >
                Firmar (1.5s)
              </button>
            )
          ) : hasReviewedToday ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--purple-400)',
                fontSize: '1.3rem',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} />
              <span>Evaluado</span>
            </div>
          ) : (
            <button
              onClick={() => openEveningReview(true)}
              className="btn-primary"
              style={{
                padding: '0.8rem 1.6rem',
                minHeight: '4rem',
                fontSize: '1.35rem',
                background: 'linear-gradient(135deg, var(--purple-500) 0%, #7C3AED 100%)',
              }}
            >
              Revisar Día
            </button>
          )}
        </div>
      </div>

      {/* 1. Sobriety Clock */}
      <SobrietyClock time={time} habitName={activeTracker?.habit_name} />

      {/* 2. Milestone Progress Ring */}
      <MilestoneRing progress={milestoneProgress} />

      {/* 3. Biological Health Status */}
      <BiologicalStatusCard progress={milestoneProgress} />

      {/* 4. Savings Metrics */}
      <SavingsMetricsGrid
        money={savings.money}
        calories={savings.calories}
        hoursGained={savings.hoursGained}
      />

      {/* Secondary Actions: Quick Review and Reset */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
        <button
          onClick={() => openEveningReview(true)}
          className="btn-secondary"
          style={{ flex: 1, fontSize: '1.35rem' }}
        >
          <Moon size={16} />
          <span>Evaluar Día</span>
        </button>

        <button
          onClick={() => openResetModal(true)}
          className="btn-danger"
          style={{ flex: 1, fontSize: '1.35rem' }}
        >
          <RefreshCcw size={16} />
          <span>Reiniciar...</span>
        </button>
      </div>
    </div>
  );
};
