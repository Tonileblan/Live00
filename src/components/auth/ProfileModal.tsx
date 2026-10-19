import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { authService } from '../../services/authService';
import { X, User as UserIcon, Mail, LogOut, UserPlus, Check, Sparkles, RefreshCw, ShieldCheck, RotateCcw } from 'lucide-react';

const AVATAR_COLORS = [
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
];

export const ProfileModal: React.FC = () => {
  const isProfileModalOpen = useTrackerStore((state) => state.isProfileModalOpen);
  const setProfileModalOpen = useTrackerStore((state) => state.setProfileModalOpen);
  const setAuthModalOpen = useTrackerStore((state) => state.setAuthModalOpen);
  const openResetAllModal = useTrackerStore((state) => state.openResetAllModal);
  const profile = useTrackerStore((state) => state.profile);
  const authUser = useTrackerStore((state) => state.authUser);
  const setProfile = useTrackerStore((state) => state.setProfile);
  const logoutUser = useTrackerStore((state) => state.logoutUser);

  const [alias, setAlias] = useState(profile.anonymous_alias);
  const [avatarColor, setAvatarColor] = useState(profile.avatar_color || '#10B981');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isProfileModalOpen) return null;

  const handleClose = () => {
    setFeedbackMessage(null);
    setProfileModalOpen(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) return;
    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const trimmedAlias = alias.trim();
      if (authUser) {
        await authService.updateProfile(authUser.id, {
          anonymous_alias: trimmedAlias,
          avatar_color: avatarColor,
        });
      }

      setProfile({
        ...profile,
        anonymous_alias: trimmedAlias,
        avatar_color: avatarColor,
      });

      setFeedbackMessage('Perfil actualizado correctamente.');
      setTimeout(() => setFeedbackMessage(null), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar cambios.';
      setFeedbackMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    handleClose();
  };

  const handleSwitchAccount = () => {
    handleClose();
    setAuthModalOpen(true);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div
        className="modal-sheet"
        style={{
          maxWidth: '44rem',
          width: '100%',
          padding: '2.4rem',
          position: 'relative',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="touch-target"
          style={{
            position: 'absolute',
            top: '1.6rem',
            right: '1.6rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Cerrar modal de perfil"
        >
          <X size={20} />
        </button>

        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '6.4rem',
              height: '6.4rem',
              borderRadius: '50%',
              backgroundColor: avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem',
              boxShadow: `0 0 2rem ${avatarColor}40`,
              fontSize: '2.4rem',
              fontWeight: 800,
              color: '#FFF',
            }}
          >
            {alias ? alias.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 id="profile-modal-title" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {profile.anonymous_alias}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {authUser?.email ? (
              <>
                <Mail size={14} color="var(--emerald-400)" />
                <span>{authUser.email}</span>
              </>
            ) : authUser ? (
              <>
                <ShieldCheck size={14} color="var(--cyan-400)" />
                <span>Cuenta Anónima en la Nube</span>
              </>
            ) : (
              <>
                <Sparkles size={14} color="var(--amber-400)" />
                <span>Perfil Demostración Local</span>
              </>
            )}
          </div>
        </div>

        {/* In-DOM Feedback */}
        {feedbackMessage && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '0.1rem solid var(--emerald-400)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              marginBottom: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--emerald-400)',
              fontSize: '1.3rem',
              fontWeight: 600,
            }}
          >
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Edit Profile Form */}
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          <div>
            <label
              htmlFor="profile-alias-input"
              style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}
            >
              TU ALIAS ANÓNIMO
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="profile-alias-input"
                type="text"
                required
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ej. Phoenix_94"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '0.1rem solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem 1.2rem 1.2rem 4rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.4rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}>
              COLOR DEL AVATAR
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {AVATAR_COLORS.map((col) => {
                const isSelected = avatarColor === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setAvatarColor(col)}
                    aria-label={`Seleccionar color ${col}`}
                    style={{
                      width: '3.2rem',
                      height: '3.2rem',
                      borderRadius: '50%',
                      backgroundColor: col,
                      border: isSelected ? '0.25rem solid #FFF' : '0.15rem solid transparent',
                      boxShadow: isSelected ? '0 0 1rem ' + col : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform var(--transition-fast)',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {isSelected && <Check size={16} color="#FFF" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '1.2rem', fontSize: '1.4rem' }}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios de Perfil'}
          </button>
        </form>

        {/* Account Actions Divider */}
        <div style={{ height: '0.1rem', background: 'var(--border-subtle)', margin: '2rem 0' }} />

        {/* Switch / New Account & Logout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '1.2rem',
              fontSize: '1.35rem',
              gap: '0.8rem',
            }}
          >
            <UserPlus size={16} />
            <span>Crear Otra Cuenta / Cambiar Usuario</span>
          </button>

          {authUser && (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '0.1rem solid var(--coral-500)',
                color: 'var(--coral-400)',
                fontWeight: 700,
                fontSize: '1.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
              }}
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          )}

          {/* Reset All App Data Button */}
          <button
            type="button"
            onClick={() => {
              handleClose();
              openResetAllModal(true);
            }}
            className="touch-target"
            style={{
              width: '100%',
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '0.1rem solid rgba(239, 68, 68, 0.25)',
              color: 'var(--coral-400)',
              fontWeight: 700,
              fontSize: '1.35rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              marginTop: '0.4rem',
            }}
            aria-label="Abrir opciones para reiniciar toda la aplicación y empezar de cero"
          >
            <RotateCcw size={16} />
            <span>Reiniciar Todo / Empezar de Cero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
