import React, { useState, useMemo } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { useSobrietyTicker } from '../../hooks/useSobrietyTicker';
import { CommunityPost } from '../../types/database.types';
import { StoryPostCard } from './StoryPostCard';
import { CreateMilestonePostModal } from './CreateMilestonePostModal';
import { Users, Plus, Shield, Sparkles } from 'lucide-react';

export const MilestoneCohortTabs: React.FC = () => {
  const communityPosts = useTrackerStore((state) => state.communityPosts);
  const { time } = useSobrietyTicker();

  const totalDays = time.days + time.months * 30;

  // Determine user's native cohort bucket
  const userCohortBucket: CommunityPost['cohort_bucket'] = useMemo(() => {
    if (totalDays <= 7) return 'day_1_to_7';
    if (totalDays <= 30) return 'day_8_to_30';
    if (totalDays <= 90) return 'day_31_to_90';
    return 'day_91_plus';
  }, [totalDays]);

  const [selectedCohort, setSelectedCohort] = useState<CommunityPost['cohort_bucket']>(userCohortBucket);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const cohortTabs: { id: CommunityPost['cohort_bucket']; label: string; range: string }[] = [
    { id: 'day_1_to_7', label: 'Día 1 - 7', range: 'Desintoxicación' },
    { id: 'day_8_to_30', label: 'Día 8 - 30', range: 'Semanas 2 a 4' },
    { id: 'day_31_to_90', label: 'Día 31 - 90', range: 'Mes 2 a 3' },
    { id: 'day_91_plus', label: '91+ Días', range: 'Consolidación' },
  ];

  const filteredPosts = useMemo(() => {
    return communityPosts.filter((p) => p.cohort_bucket === selectedCohort);
  }, [communityPosts, selectedCohort]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Intro Header */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Users size={22} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Comunidad por Cohortes</h3>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary"
            style={{ padding: '0.8rem 1.4rem', minHeight: '3.8rem', fontSize: '1.3rem' }}
          >
            <Plus size={16} />
            <span>Publicar</span>
          </button>
        </div>

        <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Conéctate con personas que están viviendo exactamente las mismas sensaciones, dudas y victorias que tú en este
          tramo de tiempo.
        </p>

        <div
          style={{
            marginTop: '1.2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 'var(--radius-full)',
            fontSize: '1.2rem',
            color: 'var(--emerald-400)',
            fontWeight: 700,
          }}
        >
          <Sparkles size={14} />
          <span>Tu cohorte actual: {cohortTabs.find((c) => c.id === userCohortBucket)?.label} ({totalDays} Días)</span>
        </div>
      </div>

      {/* Cohort Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.6rem',
        }}
      >
        {cohortTabs.map((tab) => {
          const isSelected = selectedCohort === tab.id;
          const isUserNative = userCohortBucket === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCohort(tab.id)}
              className="touch-target"
              style={{
                flexDirection: 'column',
                gap: '0.2rem',
                padding: '1rem 0.4rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `0.1rem solid ${isSelected ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                color: isSelected ? 'var(--emerald-400)' : 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{tab.label}</span>
              <span style={{ fontSize: '0.95rem', color: isSelected ? '#FFF' : 'var(--text-muted)' }}>
                {tab.range}
              </span>
              {isUserNative && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-0.3rem',
                    right: '-0.3rem',
                    width: '0.8rem',
                    height: '0.8rem',
                    borderRadius: '50%',
                    background: 'var(--amber-400)',
                    boxShadow: '0 0 0.6rem var(--amber-400)',
                  }}
                  title="Tu etapa actual"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {filteredPosts.length === 0 ? (
          <div
            className="glass-panel"
            style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}
          >
            <Shield size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
            <p style={{ fontSize: '1.4rem' }}>Sé el primero en compartir un mensaje en esta cohorte.</p>
          </div>
        ) : (
          filteredPosts.map((post) => <StoryPostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Create Post Modal */}
      <CreateMilestonePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultCohort={selectedCohort}
        soberDays={totalDays}
      />
    </div>
  );
};
