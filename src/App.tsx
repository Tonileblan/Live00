import React, { useState, useEffect } from 'react';
import { useTrackerStore } from './store/useTrackerStore';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarHeatmap } from './components/diary/CalendarHeatmap';
import { MilestoneCohortTabs } from './components/community/MilestoneCohortTabs';
import { MotivesView } from './components/motives/MotivesView';
import { UrgeSurfingOverlay } from './components/sos/UrgeSurfingOverlay';
import { MorningPledgeSheet } from './components/routines/MorningPledgeSheet';
import { EveningReviewWizard } from './components/routines/EveningReviewWizard';
import { RelapseResetModal } from './components/routines/RelapseResetModal';
import { ResetAllModal } from './components/routines/ResetAllModal';
import { AdjustCleanTimeModal } from './components/counter/AdjustCleanTimeModal';
import { SetupTrackerWizard } from './components/onboarding/SetupTrackerWizard';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';

export function App() {
  const activeTab = useTrackerStore((state) => state.activeTab);
  const isOnboardingCompleted = useTrackerStore((state) => state.isOnboardingCompleted);
  const initAuthListener = useTrackerStore((state) => state.initAuthListener);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(!isOnboardingCompleted);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initAuthListener]);

  useEffect(() => {
    if (!isOnboardingCompleted) {
      setIsOnboardingModalOpen(true);
    }
  }, [isOnboardingCompleted]);

  return (
    <>
      <AppShell onOpenOnboarding={() => setIsOnboardingModalOpen(true)}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'diary' && <CalendarHeatmap />}
        {activeTab === 'community' && <MilestoneCohortTabs />}
        {activeTab === 'profile' && <MotivesView />}
      </AppShell>

      {/* Overlays and Modals */}
      <UrgeSurfingOverlay />
      <MorningPledgeSheet />
      <EveningReviewWizard />
      <RelapseResetModal />
      <ResetAllModal />
      <AdjustCleanTimeModal />
      <AuthModal />
      <ProfileModal />

      {/* Onboarding Wizard (on initial visit or when creating new tracker) */}
      {isOnboardingModalOpen && (
        <SetupTrackerWizard
          onComplete={() => setIsOnboardingModalOpen(false)}
          onCancel={isOnboardingCompleted ? () => setIsOnboardingModalOpen(false) : undefined}
        />
      )}
    </>
  );
}

export default App;
