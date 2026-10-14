import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || isDismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback visual modal in DOM
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <div
        className="glass-panel"
        style={{
          margin: '0.8rem 1.6rem',
          padding: '1.2rem 1.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '0.1rem solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(18, 24, 36, 0.95) 100%)',
          boxShadow: '0 0.8rem 2.4rem rgba(0, 0, 0, 0.4)',
          position: 'relative',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div
            style={{
              width: '3.6rem',
              height: '3.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isIos ? <Smartphone size={18} color="var(--emerald-400)" /> : <Download size={18} color="var(--emerald-400)" />}
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF' }}>
              Instala LIVE00 como App
            </div>
            <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
              Acceso instantáneo sin navegador, offline y en pantalla completa
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={handleInstallClick}
            className="btn-primary"
            style={{
              minHeight: '3.6rem',
              padding: '0.6rem 1.4rem',
              fontSize: '1.25rem',
            }}
          >
            <Download size={14} />
            <span>Instalar</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
            aria-label="Cerrar aviso de instalación"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div className="modal-overlay" onClick={() => setShowIosGuide(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Smartphone size={24} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Instalar en iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="touch-target"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Safari en iOS te permite instalar LIVE00 en 2 sencillos toques:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginBottom: '2.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ padding: '0.8rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <Share size={20} color="var(--cyan-400)" />
                </div>
                <div style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                  1. Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ padding: '0.8rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <PlusSquare size={20} color="var(--emerald-400)" />
                </div>
                <div style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                  2. Baja y pulsa <strong>"Añadir a la pantalla de inicio"</strong>.
                </div>
              </div>
            </div>

            <button onClick={() => setShowIosGuide(false)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
