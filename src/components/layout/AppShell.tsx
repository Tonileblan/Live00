import React, { ReactNode } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { TopTrackerSwitcher } from './TopTrackerSwitcher';
import { InstallPwaBanner } from '../pwa/InstallPwaBanner';
import { ShieldAlert, Clock, Calendar, Users, HeartHandshake } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  onOpenOnboarding: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, onOpenOnboarding }) => {
  const activeTab = useTrackerStore((state) => state.activeTab);
  const setActiveTab = useTrackerStore((state) => state.setActiveTab);
  const openSOS = useTrackerStore((state) => state.openSOS);
  const profile = useTrackerStore((state) => state.profile);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        width: '100%',
        position: 'relative',
        paddingBottom: 'calc(8.4rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Top Header - Safe Area Inset for iPhone Notch & Dynamic Island */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(11, 14, 20, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '0.1rem solid var(--border-subtle)',
          paddingTop: 'calc(1.2rem + env(safe-area-inset-top, 0px))',
          paddingBottom: '1.2rem',
          paddingLeft: 'calc(1.6rem + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(1.6rem + env(safe-area-inset-right, 0px))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <TopTrackerSwitcher onAddNewClick={onOpenOnboarding} />
          <div
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <span
              style={{
                width: '0.8rem',
                height: '0.8rem',
                borderRadius: '50%',
                backgroundColor: profile.avatar_color,
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: 600 }}>{profile.anonymous_alias}</span>
          </div>
        </div>

        {/* Permanent SOS Emergency Button */}
        <button
          onClick={() => openSOS(true)}
          className="btn-sos"
          aria-label="Abrir modo de emergencia SOS para surfear el deseo"
        >
          <ShieldAlert size={18} color="#FFF" />
          <span>SOS</span>
        </button>
      </header>

      {/* PWA Install Banner */}
      <InstallPwaBanner />

      {/* Main Screen Content */}
      <main style={{ flex: 1, padding: '1.6rem', width: '100%' }}>
        {children}
      </main>

      {/* Bottom Navigation with Safe Area for Home Indicator */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '48rem',
          height: 'calc(7rem + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(15, 20, 30, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '0.1rem solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingLeft: '0.8rem',
          paddingRight: '0.8rem',
          zIndex: 60,
          boxShadow: '0 -0.8rem 2.4rem rgba(0, 0, 0, 0.6)',
        }}
        aria-label="Navegación principal"
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className="touch-target"
          style={{
            flex: 1,
            flexDirection: 'column',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'dashboard' ? 'var(--emerald-400)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)',
          }}
          aria-label="Pestaña Contador y Dashboard de Hoy"
        >
          <Clock size={20} />
          <span style={{ fontSize: '1.1rem', fontWeight: activeTab === 'dashboard' ? 700 : 500 }}>
            Hoy
          </span>
        </button>

        <button
          onClick={() => setActiveTab('diary')}
          className="touch-target"
          style={{
            flex: 1,
            flexDirection: 'column',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'diary' ? 'var(--emerald-400)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)',
          }}
          aria-label="Pestaña Diario y Calendario de Sobriedad"
        >
          <Calendar size={20} />
          <span style={{ fontSize: '1.1rem', fontWeight: activeTab === 'diary' ? 700 : 500 }}>
            Diario
          </span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className="touch-target"
          style={{
            flex: 1,
            flexDirection: 'column',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'community' ? 'var(--emerald-400)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)',
          }}
          aria-label="Pestaña Comunidad de Cohortes Anónima"
        >
          <Users size={20} />
          <span style={{ fontSize: '1.1rem', fontWeight: activeTab === 'community' ? 700 : 500 }}>
            Comunidad
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className="touch-target"
          style={{
            flex: 1,
            flexDirection: 'column',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'profile' ? 'var(--emerald-400)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)',
          }}
          aria-label="Pestaña Motivos y Anclas Personales"
        >
          <HeartHandshake size={20} />
          <span style={{ fontSize: '1.1rem', fontWeight: activeTab === 'profile' ? 700 : 500 }}>
            Motivos
          </span>
        </button>
      </nav>
    </div>
  );
};
