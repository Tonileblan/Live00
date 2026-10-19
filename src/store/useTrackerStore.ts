import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import {
  Profile,
  Tracker,
  TrackerStreak,
  DailyPledge,
  DailyReview,
  MotivationAnchor,
  UrgeLog,
  CommunityPost,
  ClockViewMode,
} from '../types/database.types';

export const ALCOHOL_MILESTONES = [
  { id: '1d', category: 'alcohol', target_seconds: 86400, title: '24 Horas', biological_fact: 'El nivel de azúcar en sangre empieza a normalizarse y el hígado inicia la desintoxicación aguda.', badge_icon: 'Sparkles' },
  { id: '3d', category: 'alcohol', target_seconds: 259200, title: '3 Días', biological_fact: 'La fase crítica de resaca química remite. Los niveles de hidratación celular se estabilizan.', badge_icon: 'Activity' },
  { id: '7d', category: 'alcohol', target_seconds: 604800, title: '1 Semana', biological_fact: 'El ciclo de sueño REM mejora drásticamente; despiertas con mayor energía cognitiva.', badge_icon: 'Moon' },
  { id: '14d', category: 'alcohol', target_seconds: 1209600, title: '2 Semanas', biological_fact: 'Se reduce el reflujo gástrico y desaparece gran parte de la inflamación facial.', badge_icon: 'Heart' },
  { id: '30d', category: 'alcohol', target_seconds: 2592000, title: '1 Mes', biological_fact: 'La grasa hepática disminuye hasta un 15% y la presión arterial desciende de forma medible.', badge_icon: 'ShieldCheck' },
  { id: '90d', category: 'alcohol', target_seconds: 7776000, title: '3 Meses', biological_fact: 'Regulación dopaminérgica avanzada: disminuye la ansiedad basal y mejora la memoria de trabajo.', badge_icon: 'Brain' },
  { id: '365d', category: 'alcohol', target_seconds: 31536000, title: '1 Año', biological_fact: 'Riesgo cardiovascular reducido significativamente y regeneración metabólica consolidada.', badge_icon: 'Trophy' },
];

const INITIAL_PROFILE: Profile = {
  id: 'usr-default-01',
  anonymous_alias: 'Phoenix_94',
  avatar_color: '#10B981',
  created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
};

// Start date: 14 days and 8 hours ago for demonstration
const INITIAL_START_DATE = new Date(Date.now() - (14 * 86400 + 8 * 3600 + 42 * 60 + 19) * 1000).toISOString();

const INITIAL_TRACKER: Tracker = {
  id: 'trk-alcohol-01',
  user_id: 'usr-default-01',
  category: 'alcohol',
  habit_name: 'Alcohol',
  start_date: INITIAL_START_DATE,
  cost_per_day: 12.50,
  time_spent_minutes_per_day: 120,
  calories_per_day: 650,
  is_active: true,
  created_at: INITIAL_START_DATE,
  updated_at: new Date().toISOString(),
};

const INITIAL_ANCHORS: MotivationAnchor[] = [
  {
    id: 'anc-1',
    tracker_id: 'trk-alcohol-01',
    user_id: 'usr-default-01',
    title: 'Recuperar mi lucidez y presencia con mi familia',
    description: 'Estar al 100% despierto en los desayunos y no perderme momentos irrepetibles.',
    image_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    display_order: 1,
    created_at: INITIAL_START_DATE,
  },
  {
    id: 'anc-2',
    tracker_id: 'trk-alcohol-01',
    user_id: 'usr-default-01',
    title: 'Mi salud cardíaca y energía matutina',
    description: 'Dormir profundamente y no despertarme con palpitaciones a las 4 AM.',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    display_order: 2,
    created_at: INITIAL_START_DATE,
  },
  {
    id: 'anc-3',
    tracker_id: 'trk-alcohol-01',
    user_id: 'usr-default-01',
    title: 'Libertad financiera y respeto a mí mismo',
    description: 'Ahorrar más de 350€ al mes para viajar y construir mi negocio propio.',
    image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    display_order: 3,
    created_at: INITIAL_START_DATE,
  },
];

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author_alias: 'ClaritySeeker',
    cohort_bucket: 'day_8_to_30',
    sober_days_at_post: 14,
    content: 'Hoy cumplo dos semanas exactas. Lo más increíble no es solo el dinero ahorrado (unos 170€), sino que la niebla mental por fin se disipó. El primer fin de semana fue un infierno, pero el modo SOS con la respiración 4-7-8 me salvó el sábado. ¡Fuerza a todos!',
    cheers_count: 42,
    user_has_cheered: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'post-2',
    author_alias: 'BraveHeart_88',
    cohort_bucket: 'day_8_to_30',
    sober_days_at_post: 12,
    content: 'Ayer salí a cenar con amigos del trabajo. Todos bebiendo cerveza y cócteles. Pedí agua con gas y lima. Al principio sentí vergüenza ajena, pero despertarme hoy a las 7:00 AM fresco como una rosa valió cada segundo.',
    cheers_count: 38,
    user_has_cheered: true,
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
  },
  {
    id: 'post-3',
    author_alias: 'ResetAndRise',
    cohort_bucket: 'day_1_to_7',
    sober_days_at_post: 3,
    content: 'Día 3. El dolor de cabeza está cediendo. Los temblores leves han parado. Gracias a los que me mandaron ánimos el día 1, no sabéis cuánto ayuda ver que se puede.',
    cheers_count: 56,
    user_has_cheered: false,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'post-4',
    author_alias: 'MountainMind',
    cohort_bucket: 'day_31_to_90',
    sober_days_at_post: 45,
    content: 'Mes y medio sobrio. Mi hígado y mi presión arterial han vuelto a valores normales de laboratorio. Mi médico no se lo creía. El cuerpo tiene una capacidad milagrosa de regenerarse si dejas de envenenarlo.',
    cheers_count: 94,
    user_has_cheered: false,
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'post-5',
    author_alias: 'TitaniumWill',
    cohort_bucket: 'day_91_plus',
    sober_days_at_post: 180,
    content: '6 meses hoy. Para los que están en los días 1 a 7: la dopamina natural VUELVE. Vuelves a disfrutar de una buena comida, de una película, de una conversación sin necesidad de tener un vaso en la mano.',
    cheers_count: 142,
    user_has_cheered: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// Helper to generate realistic daily history for heatmap
function generateInitialReviews(
  startDateIso: string,
  trackerId: string = 'trk-alcohol-01',
  userId: string = 'usr-default-01'
): DailyReview[] {
  const reviews: DailyReview[] = [];
  const start = new Date(startDateIso);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));

  for (let i = 0; i < diffDays; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    
    // Vary difficulty for demonstration and realism
    const isHardDay = i % 7 === 4;
    reviews.push({
      id: `rev-${dateStr}-${trackerId}`,
      tracker_id: trackerId,
      user_id: userId,
      review_date: dateStr,
      stayed_sober: true,
      difficulty_rating: isHardDay ? 4 : (i % 2 === 0 ? 1 : 2),
      triggers: isHardDay ? ['Evento social', 'Estrés laboral'] : ['Aburrimiento nocturno'],
      notes: isHardDay ? 'Cena social o momentos de tentación, superados con calma y firmeza.' : 'Día limpio, energía en aumento y lucidez.',
      created_at: new Date(d.getTime() + 20 * 3600000).toISOString(),
    });
  }
  return reviews;
}

interface TrackerStoreState {
  profile: Profile;
  authUser: User | null;
  trackers: Tracker[];
  activeTrackerId: string;
  streaks: TrackerStreak[];
  pledges: DailyPledge[];
  reviews: DailyReview[];
  anchors: MotivationAnchor[];
  urgeLogs: UrgeLog[];
  communityPosts: CommunityPost[];
  
  // UI State
  clockMode: ClockViewMode;
  activeTab: 'dashboard' | 'diary' | 'community' | 'profile';
  isSOSOpen: boolean;
  isMorningPledgeOpen: boolean;
  isEveningReviewOpen: boolean;
  isResetModalOpen: boolean;
  isResetAllModalOpen: boolean;
  isAdjustCleanTimeModalOpen: boolean;
  isOnboardingCompleted: boolean;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;

  // Actions
  setClockMode: (mode: ClockViewMode) => void;
  setActiveTab: (tab: 'dashboard' | 'diary' | 'community' | 'profile') => void;
  openSOS: (open: boolean) => void;
  openMorningPledge: (open: boolean) => void;
  openEveningReview: (open: boolean) => void;
  openResetModal: (open: boolean) => void;
  openResetAllModal: (open: boolean) => void;
  openAdjustCleanTimeModal: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setProfile: (profile: Profile) => void;
  setAuthUser: (user: User | null) => void;
  logoutUser: () => Promise<void>;
  updateUserProfile: (alias: string, avatarColor: string) => Promise<void>;
  initAuthListener: () => () => void;
  
  // Business logic actions
  initNewTracker: (trackerData: Partial<Tracker>, firstAnchorTitle?: string) => void;
  switchTracker: (trackerId: string) => void;
  adjustTrackerCleanTime: (trackerId: string, newStartDate: string) => void;
  signMorningPledge: () => void;
  submitEveningReview: (stayedSober: boolean, difficulty: number, triggers: string[], notes: string) => void;
  resetSobriety: (relapseTimestamp: string, reason: string, triggers: string[]) => void;
  logUrgeOvercome: (intensity: number, trigger: string, copingTool: string) => void;
  addMotivationAnchor: (title: string, description?: string, imageUrl?: string) => void;
  deleteMotivationAnchor: (id: string) => void;
  addCommunityPost: (content: string, cohort: CommunityPost['cohort_bucket'], soberDays: number) => void;
  togglePostCheer: (postId: string) => void;
  resetAppDataForNewUser: (user: User, alias: string, avatarColor: string, initialStartDate?: string) => void;
  resetToInitialDemo: () => void;
  resetAllData: (mode: 'clean_zero' | 'reconfigure' | 'demo') => void;
}

export const useTrackerStore = create<TrackerStoreState>()(
  persist(
    (set, get) => ({
      profile: INITIAL_PROFILE,
      trackers: [INITIAL_TRACKER],
      activeTrackerId: 'trk-alcohol-01',
      streaks: [
        {
          id: 'strk-1',
          tracker_id: 'trk-alcohol-01',
          started_at: INITIAL_START_DATE,
          created_at: INITIAL_START_DATE,
        },
      ],
      pledges: [
        {
          id: 'pld-today',
          tracker_id: 'trk-alcohol-01',
          user_id: 'usr-default-01',
          pledge_date: new Date().toISOString().split('T')[0],
          pledged_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ],
      reviews: generateInitialReviews(INITIAL_START_DATE),
      anchors: INITIAL_ANCHORS,
      urgeLogs: [
        {
          id: 'urg-1',
          tracker_id: 'trk-alcohol-01',
          user_id: 'usr-default-01',
          intensity: 8,
          trigger_detected: 'Evento social',
          coping_tool_used: 'Respiración 4-7-8',
          overcame_urge: true,
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'urg-2',
          tracker_id: 'trk-alcohol-01',
          user_id: 'usr-default-01',
          intensity: 6,
          trigger_detected: 'Ansiedad / Estrés',
          coping_tool_used: 'Ver mis motivos personales',
          overcame_urge: true,
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ],
      communityPosts: INITIAL_COMMUNITY_POSTS,

      // UI
      clockMode: 'detailed',
      activeTab: 'dashboard',
      isSOSOpen: false,
      isMorningPledgeOpen: false,
      isEveningReviewOpen: false,
      isResetModalOpen: false,
      isResetAllModalOpen: false,
      isAdjustCleanTimeModalOpen: false,
      isOnboardingCompleted: true,
      authUser: null,
      isAuthModalOpen: false,
      isProfileModalOpen: false,

      setClockMode: (mode) => set({ clockMode: mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      openSOS: (open) => set({ isSOSOpen: open }),
      openMorningPledge: (open) => set({ isMorningPledgeOpen: open }),
      openEveningReview: (open) => set({ isEveningReviewOpen: open }),
      openResetModal: (open) => set({ isResetModalOpen: open }),
      openResetAllModal: (open) => set({ isResetAllModalOpen: open }),
      openAdjustCleanTimeModal: (open) => set({ isAdjustCleanTimeModalOpen: open }),
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
      setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
      setProfile: (profile) =>
        set((state) => ({
          profile,
          trackers: state.trackers.map((t) =>
            t.user_id === 'usr-default-01' ? { ...t, user_id: profile.id } : t
          ),
          anchors: state.anchors.map((a) =>
            a.user_id === 'usr-default-01' ? { ...a, user_id: profile.id } : a
          ),
          pledges: state.pledges.map((p) =>
            p.user_id === 'usr-default-01' ? { ...p, user_id: profile.id } : p
          ),
          reviews: state.reviews.map((r) =>
            r.user_id === 'usr-default-01' ? { ...r, user_id: profile.id } : r
          ),
        })),
      setAuthUser: (user) => set({ authUser: user }),

      logoutUser: async () => {
        try {
          await authService.signOut();
        } catch (err) {
          console.warn('Error al cerrar sesión:', err);
        }
        set({
          authUser: null,
          profile: INITIAL_PROFILE,
        });
      },

      updateUserProfile: async (alias: string, avatarColor: string) => {
        const currentProfile = get().profile;
        const authUser = get().authUser;
        const updated: Profile = {
          ...currentProfile,
          anonymous_alias: alias,
          avatar_color: avatarColor,
        };
        set({ profile: updated });

        if (authUser) {
          try {
            await authService.updateProfile(authUser.id, {
              anonymous_alias: alias,
              avatar_color: avatarColor,
            });
          } catch (err) {
            console.error('Error al sincronizar perfil con Supabase:', err);
          }
        }
      },

      initAuthListener: () => {
        authService.getSession().then((session) => {
          if (session?.user) {
            set({ authUser: session.user });
            authService.getProfile(session.user.id).then((profile) => {
              if (profile) {
                get().setProfile(profile);
              }
            });
          }
        });

        const { unsubscribe } = authService.onAuthStateChange((_session, user) => {
          set({ authUser: user });
          if (user) {
            authService.getProfile(user.id).then((profile) => {
              if (profile) {
                get().setProfile(profile);
              }
            });
          }
        });

        return unsubscribe;
      },

      initNewTracker: (trackerData, firstAnchorTitle) => {
        const newId = `trk-${Date.now()}`;
        const newStartDate = trackerData.start_date || new Date().toISOString();
        const newTracker: Tracker = {
          id: newId,
          user_id: get().profile.id,
          category: trackerData.category || 'alcohol',
          habit_name: trackerData.habit_name || 'Alcohol',
          start_date: newStartDate,
          cost_per_day: trackerData.cost_per_day ?? 10,
          time_spent_minutes_per_day: trackerData.time_spent_minutes_per_day ?? 90,
          calories_per_day: trackerData.calories_per_day ?? 600,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const newStreak: TrackerStreak = {
          id: `strk-${Date.now()}`,
          tracker_id: newId,
          started_at: newStartDate,
          created_at: new Date().toISOString(),
        };

        let newAnchors = [...get().anchors];
        if (firstAnchorTitle) {
          newAnchors.unshift({
            id: `anc-${Date.now()}`,
            tracker_id: newId,
            user_id: get().profile.id,
            title: firstAnchorTitle,
            description: 'Mi motivo prioritario',
            image_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
            display_order: 1,
            created_at: new Date().toISOString(),
          });
        }

        const generatedReviews = generateInitialReviews(newStartDate, newId, get().profile.id);
        const isFreshUser = !get().isOnboardingCompleted || get().trackers.some((t) => t.user_id === 'usr-default-01');
        const updatedTrackers = isFreshUser ? [newTracker] : [newTracker, ...get().trackers];
        const updatedStreaks = isFreshUser ? [newStreak] : [newStreak, ...get().streaks];
        const updatedReviews = isFreshUser ? generatedReviews : [...generatedReviews, ...get().reviews];

        set({
          trackers: updatedTrackers,
          activeTrackerId: newId,
          streaks: updatedStreaks,
          reviews: updatedReviews,
          anchors: newAnchors,
          isOnboardingCompleted: true,
          activeTab: 'dashboard',
        });
      },

      switchTracker: (trackerId) => {
        set({ activeTrackerId: trackerId });
      },

      adjustTrackerCleanTime: (trackerId, newStartDate) => {
        const currentUserId = get().authUser?.id || get().profile.id || 'usr-default-01';
        const trackers = get().trackers.map((t) =>
          t.id === trackerId ? { ...t, start_date: newStartDate, updated_at: new Date().toISOString() } : t
        );

        let streaks = get().streaks.map((s) =>
          s.tracker_id === trackerId ? { ...s, started_at: newStartDate } : s
        );

        if (!streaks.some((s) => s.tracker_id === trackerId)) {
          streaks = [
            {
              id: `strk-${Date.now()}`,
              tracker_id: trackerId,
              started_at: newStartDate,
              created_at: new Date().toISOString(),
            },
            ...streaks,
          ];
        }

        const generatedReviews = generateInitialReviews(newStartDate, trackerId, currentUserId);
        const otherReviews = get().reviews.filter((r) => r.tracker_id !== trackerId);

        set({
          trackers,
          streaks,
          reviews: [...generatedReviews, ...otherReviews],
          isAdjustCleanTimeModalOpen: false,
        });
      },

      signMorningPledge: () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const activeTracker = get().trackers.find((t) => t.id === get().activeTrackerId);
        if (!activeTracker) return;

        const alreadyPledged = get().pledges.some(
          (p) => p.tracker_id === activeTracker.id && p.pledge_date === todayStr
        );

        if (alreadyPledged) return;

        const newPledge: DailyPledge = {
          id: `pld-${Date.now()}`,
          tracker_id: activeTracker.id,
          user_id: get().profile.id,
          pledge_date: todayStr,
          pledged_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          pledges: [newPledge, ...state.pledges],
          isMorningPledgeOpen: false,
        }));
      },

      submitEveningReview: (stayedSober, difficulty, triggers, notes) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const activeTracker = get().trackers.find((t) => t.id === get().activeTrackerId);
        if (!activeTracker) return;

        const newReview: DailyReview = {
          id: `rev-${todayStr}`,
          tracker_id: activeTracker.id,
          user_id: get().profile.id,
          review_date: todayStr,
          stayed_sober: stayedSober,
          difficulty_rating: difficulty,
          triggers,
          notes,
          created_at: new Date().toISOString(),
        };

        // Filter out existing for today if updating
        const filtered = get().reviews.filter(
          (r) => !(r.tracker_id === activeTracker.id && r.review_date === todayStr)
        );

        set({
          reviews: [newReview, ...filtered],
          isEveningReviewOpen: false,
        });

        // If user reported relapse in evening review, trigger counter reset
        if (!stayedSober) {
          get().resetSobriety(new Date().toISOString(), notes || 'Recaída registrada en evaluación', triggers);
        }
      },

      resetSobriety: (relapseTimestamp, reason, triggers) => {
        const activeTracker = get().trackers.find((t) => t.id === get().activeTrackerId);
        if (!activeTracker) return;

        // 1. Close current active streak
        const updatedStreaks = get().streaks.map((s) => {
          if (s.tracker_id === activeTracker.id && !s.ended_at) {
            return {
              ...s,
              ended_at: relapseTimestamp,
              reset_reason: reason,
              triggers_noted: triggers,
            };
          }
          return s;
        });

        // 2. Open new streak
        const newStreak: TrackerStreak = {
          id: `strk-${Date.now()}`,
          tracker_id: activeTracker.id,
          started_at: relapseTimestamp,
          created_at: new Date().toISOString(),
        };

        // 3. Update tracker start_date
        const updatedTrackers = get().trackers.map((t) => {
          if (t.id === activeTracker.id) {
            return {
              ...t,
              start_date: relapseTimestamp,
              updated_at: new Date().toISOString(),
            };
          }
          return t;
        });

        // 4. Mark today's review as relapse
        const todayStr = relapseTimestamp.split('T')[0];
        const relapseReview: DailyReview = {
          id: `rev-${todayStr}`,
          tracker_id: activeTracker.id,
          user_id: get().profile.id,
          review_date: todayStr,
          stayed_sober: false,
          difficulty_rating: 5,
          triggers,
          notes: reason,
          created_at: new Date().toISOString(),
        };

        const filteredReviews = get().reviews.filter(
          (r) => !(r.tracker_id === activeTracker.id && r.review_date === todayStr)
        );

        set({
          trackers: updatedTrackers,
          streaks: [newStreak, ...updatedStreaks],
          reviews: [relapseReview, ...filteredReviews],
          isResetModalOpen: false,
        });
      },

      logUrgeOvercome: (intensity, trigger, copingTool) => {
        const activeTracker = get().trackers.find((t) => t.id === get().activeTrackerId);
        if (!activeTracker) return;

        const newLog: UrgeLog = {
          id: `urg-${Date.now()}`,
          tracker_id: activeTracker.id,
          user_id: get().profile.id,
          intensity,
          trigger_detected: trigger,
          coping_tool_used: copingTool,
          overcame_urge: true,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          urgeLogs: [newLog, ...state.urgeLogs],
        }));
      },

      addMotivationAnchor: (title, description, imageUrl) => {
        const activeTracker = get().trackers.find((t) => t.id === get().activeTrackerId);
        if (!activeTracker) return;

        const newAnchor: MotivationAnchor = {
          id: `anc-${Date.now()}`,
          tracker_id: activeTracker.id,
          user_id: get().profile.id,
          title,
          description,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
          display_order: get().anchors.length + 1,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          anchors: [...state.anchors, newAnchor],
        }));
      },

      deleteMotivationAnchor: (id) => {
        set((state) => ({
          anchors: state.anchors.filter((a) => a.id !== id),
        }));
      },

      addCommunityPost: (content, cohort, soberDays) => {
        const newPost: CommunityPost = {
          id: `post-${Date.now()}`,
          author_alias: get().profile.anonymous_alias,
          cohort_bucket: cohort,
          sober_days_at_post: soberDays,
          content,
          cheers_count: 1,
          user_has_cheered: true,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          communityPosts: [newPost, ...state.communityPosts],
        }));
      },

      togglePostCheer: (postId) => {
        set((state) => ({
          communityPosts: state.communityPosts.map((p) => {
            if (p.id === postId) {
              const hasCheered = p.user_has_cheered;
              return {
                ...p,
                cheers_count: hasCheered ? Math.max(0, p.cheers_count - 1) : p.cheers_count + 1,
                user_has_cheered: !hasCheered,
              };
            }
            return p;
          }),
        }));
      },

      resetToInitialDemo: () => {
        const newStartDate = new Date(Date.now() - (14 * 86400 + 8 * 3600 + 42 * 60 + 19) * 1000).toISOString();
        const tracker: Tracker = {
          ...INITIAL_TRACKER,
          start_date: newStartDate,
        };
        set({
          profile: INITIAL_PROFILE,
          trackers: [tracker],
          activeTrackerId: tracker.id,
          streaks: [{ id: 'strk-1', tracker_id: tracker.id, started_at: newStartDate, created_at: newStartDate }],
          pledges: [{ id: 'pld-today', tracker_id: tracker.id, user_id: 'usr-default-01', pledge_date: new Date().toISOString().split('T')[0], pledged_at: new Date().toISOString(), created_at: new Date().toISOString() }],
          reviews: generateInitialReviews(newStartDate),
          anchors: INITIAL_ANCHORS,
          urgeLogs: [
            { id: 'urg-1', tracker_id: tracker.id, user_id: 'usr-default-01', intensity: 8, trigger_detected: 'Evento social', coping_tool_used: 'Respiración 4-7-8', overcame_urge: true, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 'urg-2', tracker_id: tracker.id, user_id: 'usr-default-01', intensity: 6, trigger_detected: 'Ansiedad / Estrés', coping_tool_used: 'Ver mis motivos personales', overcame_urge: true, created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
          ],
          communityPosts: INITIAL_COMMUNITY_POSTS,
          clockMode: 'detailed',
          activeTab: 'dashboard',
          isSOSOpen: false,
          isMorningPledgeOpen: false,
          isEveningReviewOpen: false,
          isResetModalOpen: false,
          isOnboardingCompleted: true,
        });
      },

      resetAppDataForNewUser: (user: User, alias: string, avatarColor: string, initialStartDate?: string) => {
        const nowIso = new Date().toISOString();
        const effectiveStartDate = initialStartDate || nowIso;
        const newTrackerId = `trk-${Date.now()}`;
        const newTracker: Tracker = {
          id: newTrackerId,
          user_id: user.id,
          category: 'alcohol',
          habit_name: 'Alcohol',
          start_date: effectiveStartDate,
          cost_per_day: 10,
          time_spent_minutes_per_day: 60,
          calories_per_day: 500,
          is_active: true,
          created_at: nowIso,
          updated_at: nowIso,
        };

        const newStreak: TrackerStreak = {
          id: `strk-${Date.now()}`,
          tracker_id: newTrackerId,
          started_at: effectiveStartDate,
          created_at: nowIso,
        };

        const starterAnchor: MotivationAnchor = {
          id: `anc-${Date.now()}`,
          tracker_id: newTrackerId,
          user_id: user.id,
          title: 'Recuperar mi claridad mental y control',
          description: 'Vivir cada día con total lucidez, salud y libertad.',
          image_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
          display_order: 1,
          created_at: nowIso,
        };

        const cleanCommunityPosts = get().communityPosts.map((p) => ({
          ...p,
          user_has_cheered: false,
        }));

        const initialReviews = generateInitialReviews(effectiveStartDate, newTrackerId, user.id);

        set({
          authUser: user,
          profile: {
            id: user.id,
            anonymous_alias: alias,
            avatar_color: avatarColor,
            created_at: nowIso,
          },
          trackers: [newTracker],
          activeTrackerId: newTrackerId,
          streaks: [newStreak],
          pledges: [],
          reviews: initialReviews,
          urgeLogs: [],
          anchors: [starterAnchor],
          communityPosts: cleanCommunityPosts,
          clockMode: 'detailed',
          activeTab: 'dashboard',
          isSOSOpen: false,
          isMorningPledgeOpen: false,
          isEveningReviewOpen: false,
          isResetModalOpen: false,
          isResetAllModalOpen: false,
          isAdjustCleanTimeModalOpen: false,
          isOnboardingCompleted: false,
          isAuthModalOpen: false,
          isProfileModalOpen: false,
        });
      },

      resetAllData: (mode) => {
        if (mode === 'demo') {
          get().resetToInitialDemo();
          set({
            isResetAllModalOpen: false,
            isProfileModalOpen: false,
            isResetModalOpen: false,
            activeTab: 'dashboard',
          });
          return;
        }

        const nowIso = new Date().toISOString();
        const currentUserId = get().authUser?.id || get().profile.id || 'usr-default-01';

        // Reset trackers to start from this exact moment
        const currentTrackers = get().trackers;
        const resetTrackers: Tracker[] = currentTrackers.length > 0
          ? currentTrackers.map((t) => ({
              ...t,
              start_date: nowIso,
            }))
          : [
              {
                ...INITIAL_TRACKER,
                id: `trk-${Date.now()}`,
                user_id: currentUserId,
                start_date: nowIso,
              },
            ];

        const activeId = resetTrackers[0].id;

        const newStreaks: TrackerStreak[] = resetTrackers.map((t) => ({
          id: `strk-${Date.now()}-${t.id}`,
          tracker_id: t.id,
          started_at: nowIso,
          created_at: nowIso,
        }));

        const cleanStarterAnchor: MotivationAnchor = {
          id: `anc-${Date.now()}`,
          tracker_id: activeId,
          user_id: currentUserId,
          title: 'Recuperar mi claridad mental y control',
          description: 'Vivir cada día con total lucidez, salud y libertad.',
          image_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
          display_order: 1,
          created_at: nowIso,
        };

        const cleanCommunityPosts = get().communityPosts.map((p) => ({
          ...p,
          user_has_cheered: false,
        }));

        set({
          trackers: resetTrackers,
          activeTrackerId: activeId,
          streaks: newStreaks,
          pledges: [],
          reviews: [],
          urgeLogs: [],
          anchors: [cleanStarterAnchor],
          communityPosts: cleanCommunityPosts,
          clockMode: 'detailed',
          activeTab: 'dashboard',
          isSOSOpen: false,
          isMorningPledgeOpen: false,
          isEveningReviewOpen: false,
          isResetModalOpen: false,
          isResetAllModalOpen: false,
          isProfileModalOpen: false,
          isOnboardingCompleted: mode === 'clean_zero',
        });
      },
    }),
    {
      name: 'live00-sobriety-storage',
      partialize: (state) => ({
        profile: state.profile,
        trackers: state.trackers,
        activeTrackerId: state.activeTrackerId,
        streaks: state.streaks,
        pledges: state.pledges,
        reviews: state.reviews,
        anchors: state.anchors,
        urgeLogs: state.urgeLogs,
        communityPosts: state.communityPosts,
        clockMode: state.clockMode,
        isOnboardingCompleted: state.isOnboardingCompleted,
      }),
    }
  )
);
