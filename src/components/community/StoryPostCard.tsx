import React from 'react';
import { CommunityPost } from '../../types/database.types';
import { useTrackerStore } from '../../store/useTrackerStore';
import { Heart, Sparkles } from 'lucide-react';

interface StoryPostCardProps {
  post: CommunityPost;
}

export const StoryPostCard: React.FC<StoryPostCardProps> = ({ post }) => {
  const togglePostCheer = useTrackerStore((state) => state.togglePostCheer);

  const getBadgeColor = (days: number) => {
    if (days <= 7) return 'var(--amber-400)';
    if (days <= 30) return 'var(--cyan-400)';
    if (days <= 90) return 'var(--purple-400)';
    return 'var(--emerald-400)';
  };

  const badgeColor = getBadgeColor(post.sober_days_at_post);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.8rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        border: '0.1rem solid var(--border-subtle)',
      }}
    >
      {/* Author and Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div
            style={{
              width: '3.2rem',
              height: '3.2rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.3rem',
              color: badgeColor,
            }}
          >
            {post.author_alias.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {post.author_alias}
            </div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              Comunidad Anónima
            </div>
          </div>
        </div>

        {/* Milestone badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `0.1rem solid ${badgeColor}`,
            color: badgeColor,
            fontSize: '1.2rem',
            fontWeight: 800,
          }}
        >
          <Sparkles size={12} />
          <span>{post.sober_days_at_post} Días</span>
        </div>
      </div>

      {/* Post Content */}
      <p style={{ fontSize: '1.45rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        "{post.content}"
      </p>

      {/* Cheer Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.8rem', borderTop: '0.1rem solid var(--border-subtle)' }}>
        <button
          onClick={() => togglePostCheer(post.id)}
          className="touch-target"
          style={{
            padding: '0.6rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: post.user_has_cheered ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            border: `0.1rem solid ${post.user_has_cheered ? 'var(--coral-400)' : 'var(--border-subtle)'}`,
            color: post.user_has_cheered ? 'var(--coral-400)' : 'var(--text-secondary)',
            fontSize: '1.3rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            transition: 'all var(--transition-fast)',
          }}
          aria-label={`Dar ánimos al post de ${post.author_alias}. Total actual: ${post.cheers_count}`}
        >
          <Heart size={16} fill={post.user_has_cheered ? 'var(--coral-400)' : 'transparent'} />
          <span>{post.cheers_count} Ánimos</span>
        </button>
      </div>
    </div>
  );
};
