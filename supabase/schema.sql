-- ============================================================================
-- LIVE00: ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE / POSTGRESQL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Perfiles de usuario (anónimos o autenticados)
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
    cohort_bucket VARCHAR(30) NOT NULL, -- 'day_1_to_7', 'day_8_to_30', 'day_31_to_90', 'day_91_plus'
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

-- ============================================================================
-- TRIGGERS Y FUNCIONES
-- ============================================================================

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

-- RPC: Reinicio Atómico de Sobriedad con preservación de racha
CREATE OR REPLACE FUNCTION public.rpc_reset_sobriety_counter(
    p_tracker_id UUID,
    p_relapse_timestamp TIMESTAMPTZ,
    p_reason TEXT,
    p_triggers TEXT[]
)
RETURNS VOID AS $$
BEGIN
    -- 1. Cerrar racha actual
    UPDATE public.tracker_streaks
    SET ended_at = p_relapse_timestamp,
        reset_reason = p_reason,
        triggers_noted = p_triggers
    WHERE tracker_id = p_tracker_id AND ended_at IS NULL;

    -- 2. Abrir nueva racha
    INSERT INTO public.tracker_streaks (tracker_id, started_at)
    VALUES (p_tracker_id, p_relapse_timestamp);

    -- 3. Actualizar fecha en el tracker
    UPDATE public.trackers
    SET start_date = p_relapse_timestamp,
        updated_at = NOW()
    WHERE id = p_tracker_id;

    -- 4. Registrar en diario como recaída
    INSERT INTO public.daily_reviews (tracker_id, user_id, review_date, stayed_sober, difficulty_rating, triggers, notes)
    SELECT p_tracker_id, user_id, p_relapse_timestamp::DATE, FALSE, 5, p_triggers, p_reason
    FROM public.trackers WHERE id = p_tracker_id
    ON CONFLICT (tracker_id, review_date)
    DO UPDATE SET stayed_sober = FALSE, difficulty_rating = 5, triggers = p_triggers, notes = p_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
