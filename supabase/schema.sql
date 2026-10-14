-- ============================================================================
-- LIVE00: ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE / POSTGRESQL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Perfiles de usuario (vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    anonymous_alias VARCHAR(50) NOT NULL UNIQUE,
    avatar_color VARCHAR(20) DEFAULT '#10B981',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trackers de Adicción / Hábito
CREATE TABLE IF NOT EXISTS public.trackers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL DEFAULT 'alcohol',
    habit_name VARCHAR(100) NOT NULL DEFAULT 'Alcohol',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cost_per_day NUMERIC(10, 2) NOT NULL DEFAULT 8.50,
    time_spent_minutes_per_day INT NOT NULL DEFAULT 90,
    calories_per_day INT NOT NULL DEFAULT 600,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rachas históricas y activas
CREATE TABLE IF NOT EXISTS public.tracker_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    reset_reason TEXT,
    triggers_noted TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Compromisos diarios (Morning Pledge)
CREATE TABLE IF NOT EXISTS public.daily_pledges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pledge_date DATE NOT NULL,
    pledged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tracker_id, pledge_date)
);

-- 5. Evaluaciones nocturnas (Evening Reviews)
CREATE TABLE IF NOT EXISTS public.daily_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,
    stayed_sober BOOLEAN NOT NULL DEFAULT TRUE,
    difficulty_rating INT CHECK (difficulty_rating BETWEEN 1 AND 5),
    triggers TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tracker_id, review_date)
);

-- 6. Anclas Motivacionales ("¿Por qué quiero estar sobrio?")
CREATE TABLE IF NOT EXISTS public.motivation_anchors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Registro de Crisis Superadas (Botón SOS)
CREATE TABLE IF NOT EXISTS public.urge_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    intensity INT CHECK (intensity BETWEEN 1 AND 10),
    trigger_detected VARCHAR(50),
    coping_tool_used VARCHAR(50) DEFAULT 'Respiración 4-7-8',
    overcame_urge BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Catálogo Maestro de Hitos Fisiológicos
CREATE TABLE IF NOT EXISTS public.milestone_definitions (
    id VARCHAR(30) PRIMARY KEY,
    category VARCHAR(50) NOT NULL DEFAULT 'alcohol',
    target_seconds BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    biological_fact TEXT NOT NULL,
    badge_icon VARCHAR(50) NOT NULL
);

-- 9. Posts de Comunidad por Cohorte
CREATE TABLE IF NOT EXISTS public.community_milestone_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_alias VARCHAR(50) NOT NULL,
    cohort_bucket VARCHAR(30) NOT NULL,
    sober_days_at_post INT NOT NULL,
    content TEXT NOT NULL,
    cheers_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reacciones / Cheers a Posts
CREATE TABLE IF NOT EXISTS public.community_post_cheers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_milestone_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Trigger: Creación automática de perfil al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_alias VARCHAR(50);
    v_color VARCHAR(20);
BEGIN
    v_alias := COALESCE(
        NEW.raw_user_meta_data->>'anonymous_alias',
        'Sobrio_' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 6)
    );
    v_color := COALESCE(
        NEW.raw_user_meta_data->>'avatar_color',
        '#10B981'
    );

    INSERT INTO public.profiles (id, anonymous_alias, avatar_color)
    VALUES (NEW.id, v_alias, v_color)
    ON CONFLICT (id) DO UPDATE
    SET anonymous_alias = EXCLUDED.anonymous_alias,
        avatar_color = EXCLUDED.avatar_color,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger A: Al crear un Tracker, abrir automáticamente su primera racha
CREATE OR REPLACE FUNCTION public.fn_init_first_streak()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tracker_streaks (tracker_id, started_at)
    VALUES (NEW.id, NEW.start_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_after_tracker_insert ON public.trackers;
CREATE TRIGGER trg_after_tracker_insert
    AFTER INSERT ON public.trackers
    FOR EACH ROW EXECUTE FUNCTION public.fn_init_first_streak();

-- Trigger B: Actualizar contador de Cheers atómicamente
CREATE OR REPLACE FUNCTION public.fn_update_cheers_counter()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_milestone_posts
        SET cheers_count = cheers_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_milestone_posts
        SET cheers_count = GREATEST(0, cheers_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cheers_counter ON public.community_post_cheers;
CREATE TRIGGER trg_cheers_counter
    AFTER INSERT OR DELETE ON public.community_post_cheers
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_cheers_counter();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivation_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_milestone_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_cheers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users manage own trackers" ON public.trackers;
DROP POLICY IF EXISTS "Users manage streaks" ON public.tracker_streaks;
DROP POLICY IF EXISTS "Users manage pledges" ON public.daily_pledges;
DROP POLICY IF EXISTS "Users manage reviews" ON public.daily_reviews;
DROP POLICY IF EXISTS "Users manage anchors" ON public.motivation_anchors;
DROP POLICY IF EXISTS "Users manage urge logs" ON public.urge_logs;
DROP POLICY IF EXISTS "Allow read milestones" ON public.milestone_definitions;
DROP POLICY IF EXISTS "Allow read posts" ON public.community_milestone_posts;
DROP POLICY IF EXISTS "Allow authenticated insert posts" ON public.community_milestone_posts;
DROP POLICY IF EXISTS "Users manage cheers" ON public.community_post_cheers;

-- Create Policies according to Supabase best practices
CREATE POLICY "Allow read profiles" ON public.profiles
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users manage own trackers" ON public.trackers
    FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users manage streaks" ON public.tracker_streaks
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.trackers t WHERE t.id = tracker_streaks.tracker_id AND t.user_id = (select auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.trackers t WHERE t.id = tracker_streaks.tracker_id AND t.user_id = (select auth.uid())));

CREATE POLICY "Users manage pledges" ON public.daily_pledges
    FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users manage reviews" ON public.daily_reviews
    FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users manage anchors" ON public.motivation_anchors
    FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users manage urge logs" ON public.urge_logs
    FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow read milestones" ON public.milestone_definitions
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow read posts" ON public.community_milestone_posts
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow authenticated insert posts" ON public.community_milestone_posts
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users manage cheers" ON public.community_post_cheers
    FOR ALL TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Semillas de Hitos
INSERT INTO public.milestone_definitions (id, category, target_seconds, title, biological_fact, badge_icon)
VALUES 
    ('1d', 'alcohol', 86400, '24 Horas', 'El nivel de azúcar en sangre empieza a normalizarse y el hígado inicia la desintoxicación aguda.', 'Sparkles'),
    ('3d', 'alcohol', 259200, '3 Días', 'La fase crítica de resaca química remite. Los niveles de hidratación celular se estabilizan.', 'Activity'),
    ('7d', 'alcohol', 604800, '1 Semana', 'El ciclo de sueño REM mejora drásticamente; despiertas con mayor energía cognitiva.', 'Moon'),
    ('14d', 'alcohol', 1209600, '2 Semanas', 'Se reduce el reflujo gástrico y desaparece gran parte de la inflamación facial.', 'Heart'),
    ('30d', 'alcohol', 2592000, '1 Mes', 'La grasa hepática disminuye hasta un 15% y la presión arterial desciende de forma medible.', 'ShieldCheck'),
    ('90d', 'alcohol', 7776000, '3 Meses', 'Regulación dopaminérgica avanzada: disminuye la ansiedad basal y mejora la memoria de trabajo.', 'Brain'),
    ('365d', 'alcohol', 31536000, '1 Año', 'Riesgo cardiovascular reducido significativamente y regeneración metabólica consolidada.', 'Trophy')
ON CONFLICT (id) DO NOTHING;
