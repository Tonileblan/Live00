import React, { useState } from 'react';
import { useTrackerStore } from '../../store/useTrackerStore';
import { authService } from '../../services/authService';
import { X, Mail, Lock, User as UserIcon, Shield, Sparkles, Check, AlertCircle, ArrowRight } from 'lucide-react';

const AVATAR_COLORS = [
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
];

export const AuthModal: React.FC = () => {
  const isAuthModalOpen = useTrackerStore((state) => state.isAuthModalOpen);
  const setAuthModalOpen = useTrackerStore((state) => state.setAuthModalOpen);
  const setProfile = useTrackerStore((state) => state.setProfile);
  const setAuthUser = useTrackerStore((state) => state.setAuthUser);
  const resetAppDataForNewUser = useTrackerStore((state) => state.resetAppDataForNewUser);

  const [mode, setMode] = useState<'register' | 'login' | 'anonymous'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [avatarColor, setAvatarColor] = useState('#10B981');
  const [initialCleanDays, setInitialCleanDays] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Por favor, introduce tu correo y una contraseña.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        const effectiveAlias = alias.trim() || `Sobrio_${Math.floor(Math.random() * 900 + 100)}`;

        const data = await authService.signUp(email.trim(), password, effectiveAlias, avatarColor);

        if (data.user) {
          const initialStartDate = new Date(Date.now() - initialCleanDays * 86400000).toISOString();
          resetAppDataForNewUser(data.user, effectiveAlias, avatarColor, initialStartDate);
        }

        setSuccessMessage('¡Cuenta creada con éxito! Todo listo para empezar tu camino.');
        setTimeout(() => {
          handleClose();
        }, 1200);

      } else if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Introduce tu email y contraseña.');
        }

        const data = await authService.signIn(email.trim(), password);

        if (data.user) {
          setAuthUser(data.user);
          const profile = await authService.getProfile(data.user.id);
          if (profile) {
            setProfile(profile);
          } else {
            setProfile({
              id: data.user.id,
              anonymous_alias: (data.user.user_metadata?.anonymous_alias as string) || 'Usuario_Sobrio',
              avatar_color: (data.user.user_metadata?.avatar_color as string) || '#10B981',
              created_at: new Date().toISOString(),
            });
          }
        }

        setSuccessMessage('¡Bienvenido de nuevo! Sesión iniciada.');
        setTimeout(() => {
          handleClose();
        }, 1000);

      } else if (mode === 'anonymous') {
        const effectiveAlias = alias.trim() || `Sobrio_${Math.floor(Math.random() * 900 + 100)}`;
        const data = await authService.signInAnonymously(effectiveAlias, avatarColor);

        if (data.user) {
          const initialStartDate = new Date(Date.now() - initialCleanDays * 86400000).toISOString();
          resetAppDataForNewUser(data.user, effectiveAlias, avatarColor, initialStartDate);
        }

        setSuccessMessage('Sesión anónima iniciada. ¡Bienvenido!');
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ha ocurrido un error inesperado al procesar la autenticación.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
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
        aria-labelledby="auth-modal-title"
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
          aria-label="Cerrar modal de autenticación"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '4.8rem',
              height: '4.8rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '0.1rem solid var(--emerald-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem',
            }}
          >
            <Shield size={24} color="var(--emerald-400)" />
          </div>
          <h2 id="auth-modal-title" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            {mode === 'register' && 'Crear Nueva Cuenta'}
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'anonymous' && 'Acceso Rápido Anónimo'}
          </h2>
          <p style={{ fontSize: '1.35rem', color: 'var(--text-secondary)' }}>
            {mode === 'register' && 'Crea tu cuenta segura en Supabase con total privacidad.'}
            {mode === 'login' && 'Accede a tus rachas, notas y anclas en la nube.'}
            {mode === 'anonymous' && 'Comienza al instante sin email con persistencia en la nube.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem',
            marginBottom: '2rem',
            gap: '0.4rem',
          }}
          role="tablist"
        >
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: '0.8rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'register' ? 'var(--emerald-500)' : 'transparent',
              color: mode === 'register' ? '#FFF' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '1.25rem',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            role="tab"
            aria-selected={mode === 'register'}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: '0.8rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'login' ? 'var(--emerald-500)' : 'transparent',
              color: mode === 'login' ? '#FFF' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '1.25rem',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            role="tab"
            aria-selected={mode === 'login'}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('anonymous');
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: '0.8rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'anonymous' ? 'var(--emerald-500)' : 'transparent',
              color: mode === 'anonymous' ? '#FFF' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '1.25rem',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            role="tab"
            aria-selected={mode === 'anonymous'}
          >
            Anónimo
          </button>
        </div>

        {/* Feedback Alert in DOM (No alert() dialogs per accessibility rules) */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '0.1rem solid var(--coral-500)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              marginBottom: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--coral-400)',
              fontSize: '1.3rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
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
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          {/* Alias & Color (for Register and Anonymous) */}
          {(mode === 'register' || mode === 'anonymous') && (
            <>
              <div>
                <label
                  htmlFor="auth-alias"
                  style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}
                >
                  ALIAS EN LA COMUNIDAD (ANÓNIMO)
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="auth-alias"
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ej. Sobrio_Luz, Renacer_99"
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
                  COLOR DE AVATAR
                </span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {AVATAR_COLORS.map((col) => {
                    const isSelected = avatarColor === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAvatarColor(col)}
                        aria-label={`Seleccionar color de avatar ${col}`}
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

              {/* Optional current clean time presets */}
              <div>
                <span style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}>
                  ¿CUÁNTO TIEMPO LLEVAS LIMPIO? (OPCIONAL)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {[
                    { label: 'Hoy (Día 0)', days: 0 },
                    { label: '3 días', days: 3 },
                    { label: '1 semana (7d)', days: 7 },
                    { label: '2 semanas (14d)', days: 14 },
                    { label: '1 mes (30d)', days: 30 },
                    { label: '3+ meses', days: 90 },
                  ].map((preset) => {
                    const isSelected = initialCleanDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setInitialCleanDays(preset.days)}
                        style={{
                          padding: '0.6rem 1rem',
                          borderRadius: 'var(--radius-full)',
                          background: isSelected ? 'var(--emerald-400)' : 'rgba(255, 255, 255, 0.05)',
                          border: `0.1rem solid ${isSelected ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                          color: isSelected ? '#000' : 'var(--text-secondary)',
                          fontSize: '1.2rem',
                          fontWeight: isSelected ? 800 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Email and Password (for Register and Login) */}
          {mode !== 'anonymous' && (
            <>
              <div>
                <label
                  htmlFor="auth-email"
                  style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}
                >
                  CORREO ELECTRÓNICO
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
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
                <label
                  htmlFor="auth-password"
                  style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}
                >
                  CONTRASEÑA
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '1.4rem',
              fontSize: '1.5rem',
              marginTop: '0.8rem',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <span>Procesando...</span>
            ) : (
              <>
                {mode === 'register' && <span>Crear Mi Cuenta</span>}
                {mode === 'login' && <span>Entrar a Mi Cuenta</span>}
                {mode === 'anonymous' && <span>Entrar como Invitado Anónimo</span>}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security / Privacy notice */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.4rem',
            borderTop: '0.1rem solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '1.2rem',
          }}
        >
          <Sparkles size={14} color="var(--emerald-400)" />
          <span>Privacidad total garantizada con Supabase Row Level Security</span>
        </div>
      </div>
    </div>
  );
};
