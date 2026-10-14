1. Arquitectura Interna y Árbol del Proyecto
Para que la aplicación funcione con respuesta instantánea (latencia 0 ms en el contador y en el modo de emergencia SOS), la estructura interna separa el Motor de Dominio Local (cálculos matemáticos en cliente y persistencia en caché) de la Capa de Sincronización en Nube (Supabase).

Plaintext
src/
├── assets/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx            # Contenedor móvil max-w-md centrado + BottomNav
│   │   └── TopTrackerSwitcher.tsx  # Selector superior si el usuario traquea >1 adicción
│   ├── counter/
│   │   ├── SobrietyClock.tsx       # Reloj tabular-nums de 4 niveles (Meses/Días/Horas/Seg)
│   │   ├── MilestoneRing.tsx       # Barra/anillo de progreso no lineal hacia el próximo hito
│   │   ├── BiologicalStatusCard.tsx# Estado fisiológico actual (ej. "Fase: Sueño REM reparado")
│   │   └── SavingsMetricsGrid.tsx  # Tarjetas de dinero ahorrado, calorías y horas ganadas
│   ├── routines/
│   │   ├── MorningPledgeSheet.tsx  # Drawer matutino con botón de pulsación larga (Hold-to-pledge)
│   │   ├── EveningReviewWizard.tsx # Wizard de 3 pasos: ¿Sobrio? -> Dificultad (1-5) -> Triggers
│   │   └── RelapseResetModal.tsx   # Flujo empático de reinicio + captura de causa raíz
│   ├── sos/
│   │   ├── UrgeSurfingOverlay.tsx  # Pantalla completa de emergencia
│   │   ├── BreathingPacer.tsx      # Animación CSS/Canvas 4-7-8
│   │   └── WhyIDoThisCarousel.tsx  # Carrusel de fotos y motivos personales del usuario
│   └── community/
│       ├── MilestoneCohortTabs.tsx # Pestañas automáticas según el día exacto del usuario
│       └── StoryPostCard.tsx       # Tarjeta anónima con contador de "Cheers"
├── hooks/
│   ├── useSobrietyTicker.ts        # Loop optimizado con requestAnimationFrame / visibilidad
│   ├── useMilestoneEngine.ts       # Cruza segundos actuales con la matriz de hitos y salud
│   └── useTriggerAnalytics.ts      # Calcula mapas de calor por día de la semana y detonante
├── store/
│   └── useTrackerStore.ts          # Zustand con persistencia en localStorage (Offline-First)
├── services/
│   ├── supabaseClient.ts
│   ├── trackerService.ts           # Llamadas a RPCs de PostgreSQL
│   └── storageService.ts           # Subida de fotos motivacionales al bucket privado
└── types/
    └── database.types.ts           # Tipado estricto sincronizado con el esquema SQL
2. Ingeniería de Base de Datos Avanzada (Tablas Ocultas, Triggers y RPCs)
Al inspeccionar a fondo la lógica de I Am Sober, el primer esquema básico se queda corto en tres puntos clave: las anclas emocionales (fotos/motivos que el usuario sube para ver cuando quiere recaer), los hitos fisiológicos y las transacciones atómicas al reiniciar una racha.

SQL
-- ============================================================================
-- 1. TABLAS ADICIONALES DE DOMINIO PROFUNDO
-- ============================================================================

-- Anclas Motivacionales ("¿Por qué quiero estar sobrio?")
CREATE TABLE public.motivation_anchors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL, -- Ej: "Por mis hijos", "Para recuperar mi claridad mental"
    image_path TEXT,             -- Ruta en Supabase Storage (bucket privado 'anchors')
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de Crisis Superadas (Botón SOS usado sin llegar a recaer)
CREATE TABLE public.urge_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracker_id UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    intensity INT CHECK (intensity BETWEEN 1 AND 10),
    trigger_detected VARCHAR(50), -- Ej: 'Ansiedad', 'Evento social', 'Insomnio'
    coping_tool_used VARCHAR(50), -- Ej: 'Respiración 4-7-8', 'Ver mis motivos', 'Comunidad'
    overcame_urge BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo Maestro de Hitos Fisiológicos y de Tiempo (Seed Data)
CREATE TABLE public.milestone_definitions (
    id VARCHAR(30) PRIMARY KEY,   -- Ej: '24_hours', '3_days', '30_days'
    category VARCHAR(50) NOT NULL,-- 'alcohol'
    target_seconds BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    biological_fact TEXT NOT NULL,-- Explicación clínica de qué se recupera en ese punto
    badge_icon VARCHAR(50) NOT NULL
);

-- ============================================================================
-- 2. TRIGGERS AUTOMÁTICOS (Integridad sin depender del Frontend)
-- ============================================================================

-- Trigger A: Al crear un Tracker, abrir automáticamente su primera racha en tracker_streaks
CREATE OR REPLACE FUNCTION public.fn_init_first_streak()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tracker_streaks (tracker_id, started_at)
    VALUES (NEW.id, NEW.start_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_after_tracker_insert
AFTER INSERT ON public.trackers
FOR EACH ROW EXECUTE FUNCTION public.fn_init_first_streak();

-- Trigger B: Actualizar contador de "Cheers" en tiempo real sin condiciones de carrera
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

CREATE TRIGGER trg_cheers_counter
AFTER INSERT OR DELETE ON public.community_post_cheers
FOR EACH ROW EXECUTE FUNCTION public.fn_update_cheers_counter();

-- ============================================================================
-- 3. TRANSACCIÓN ATÓMICA DE REINICIO (RPC para cuando ocurre una recaída)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_reset_sobriety_counter(
    p_tracker_id UUID,
    p_relapse_timestamp TIMESTAMPTZ,
    p_reason TEXT,
    p_triggers TEXT[]
)
RETURNS VOID AS $$
BEGIN
    -- 1. Cerrar la racha activa actual
    UPDATE public.tracker_streaks
    SET ended_at = p_relapse_timestamp,
        reset_reason = p_reason,
        triggers_noted = p_triggers
    WHERE tracker_id = p_tracker_id AND ended_at IS NULL;

    -- 2. Abrir la nueva racha desde el momento del reinicio
    INSERT INTO public.tracker_streaks (tracker_id, started_at)
    VALUES (p_tracker_id, p_relapse_timestamp);

    -- 3. Actualizar la fecha base del tracker principal
    UPDATE public.trackers
    SET start_date = p_relapse_timestamp
    WHERE id = p_tracker_id AND user_id = auth.uid();

    -- 4. Registrar automáticamente la revisión de ese día como recaída
    INSERT INTO public.daily_reviews (tracker_id, user_id, review_date, stayed_sober, difficulty_rating, triggers, notes)
    VALUES (p_tracker_id, auth.uid(), p_relapse_timestamp::DATE, FALSE, 5, p_triggers, p_reason)
    ON CONFLICT (tracker_id, review_date)
    DO UPDATE SET stayed_sober = FALSE, difficulty_rating = 5, triggers = p_triggers, notes = p_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
3. Motores Lógicos Internos (Especificación de Dominio)
A. Motor de Progresión No Lineal de Hitos (useMilestoneEngine.ts)
I Am Sober no usa una barra de progreso lineal fija de 30 días. Durante la primera semana, la psicología del usuario necesita recompensas cortas (1 día, 3 días, 7 días) porque la abstinencia física es crítica; después los saltos se espacian.

TypeScript
export const ALCOHOL_MILESTONES = [
  { id: '1d', seconds: 86400, label: '24 Horas', bio: 'El nivel de azúcar en sangre empieza a normalizarse y el hígado inicia la desintoxicación aguda.' },
  { id: '3d', seconds: 259200, label: '3 Días', bio: 'La fase crítica de resaca química remite. Los niveles de hidratación celular se estabilizan.' },
  { id: '7d', seconds: 604800, label: '1 Semana', bio: 'El ciclo de sueño REM mejora drásticamente; despiertas con mayor energía cognitiva.' },
  { id: '14d', seconds: 1209600, label: '2 Semanas', bio: 'Se reduce el reflujo gástrico y desaparece gran parte de la inflamación facial.' },
  { id: '30d', seconds: 2592000, label: '1 Mes', bio: 'La grasa hepática disminuye hasta un 15% y la presión arterial desciende de forma medible.' },
  { id: '90d', seconds: 7776000, label: '3 Meses', bio: 'Regulación dopaminérgica avanzada: disminuye la ansiedad basal y mejora la memoria de trabajo.' },
  { id: '365d', seconds: 31536000, label: '1 Año', bio: 'Riesgo cardiovascular reducido significativamente y regeneración metabólica consolidada.' },
];

export function getMilestoneProgress(elapsedSeconds: number) {
  const nextIndex = ALCOHOL_MILESTONES.findIndex(m => m.seconds > elapsedSeconds);
  
  if (nextIndex === -1) {
    return { current: ALCOHOL_MILESTONES.at(-1)!, next: null, percentage: 100 };
  }

  const prevSeconds = nextIndex === 0 ? 0 : ALCOHOL_MILESTONES[nextIndex - 1].seconds;
  const nextMilestone = ALCOHOL_MILESTONES[nextIndex];
  
  // Cálculo relativo al tramo actual (no desde cero, para no desmotivar tras hitos largos)
  const segmentTotal = nextMilestone.seconds - prevSeconds;
  const segmentElapsed = elapsedSeconds - prevSeconds;
  const percentage = Math.min(100, Math.max(0, (segmentElapsed / segmentTotal) * 100));

  return {
    current: nextIndex === 0 ? null : ALCOHOL_MILESTONES[nextIndex - 1],
    next: nextMilestone,
    percentage: Number(percentage.toFixed(1))
  };
}
B. Máquina de Estados del Ciclo Diario y Fricción Antirrecaída
Ventana de Compromiso (05:00 a 15:59 hora local):

El usuario ve activo el CTA "Firmar compromiso de hoy".

Micro-interacción clave: No es un clic simple; es un botón de mantener pulsado durante 1,5 segundos (onPointerDown con barra de llenado y vibración háptica navigator.vibrate(50)). Esto genera un anclaje psicológico consciente, evitando el clic mecánico.

Ventana de Evaluación (16:00 a 04:59 hora local):

El CTA muta automáticamente a "Revisar mi día".

Fricción Positiva en el Botón de Reinicio:

Cuando el usuario pulsa "Reiniciar contador", nunca se ejecuta el borrado directo.

Paso 1 del Modal: Muestra primero el carrusel WhyIDoThisCarousel (sus propias fotos y motivos) con la pregunta: "¿Estás teniendo un deseo fuerte ahora mismo o ya ocurrió el consumo?".

Si responde "Estoy teniendo el deseo ahora", lo redirige automáticamente al Modo SOS (Urge Surfing), salvando el día. Si confirma "Ya ocurrió", abre el formulario de fecha/hora y ejecuta rpc_reset_sobriety_counter.

C. Motor de Analítica de Vulnerabilidad (useTriggerAnalytics.ts)
Cruza los registros de daily_reviews y urge_logs para detectar patrones invisibles para el usuario:

Índice de Peligro por Día de la Semana: Agrupa las revisiones con difficulty_rating >= 4 por EXTRACT(DOW FROM review_date) para mostrar una alerta preventiva (ej. "Tus registros indican que los viernes entre las 19:00 y las 23:00 tu dificultad sube un 70%. Activa un plan alternativo hoy").

Top 3 Detonantes: Cuenta la frecuencia de cada elemento dentro del array triggers y calcula cuál está más correlacionado con reinicios previos en tracker_streaks.

4. Plan de Ejecución Exacto (Hoja de Ruta Paso a Paso)
Este plan está estructurado en 6 bloques secuenciales cerrados. Cada bloque produce una parte funcional y verificable sin romper la anterior.

Bloque 1: Infraestructura de Datos, RLS y Storage (Backend)
Objetivo: Dejar la base de datos 100% operativa con lógica transaccional en el servidor.

Acciones exactas:

Ejecutar el script SQL de tablas principales (profiles, trackers, tracker_streaks, daily_pledges, daily_reviews, community_milestone_posts, community_post_cheers).

Ejecutar el script SQL avanzado de este documento (motivation_anchors, urge_logs, milestone_definitions, Triggers A/B y la función rpc_reset_sobriety_counter).

Crear en Supabase Storage un bucket privado llamado anchors con política RLS: auth.uid()::text = (storage.foldername(name))[1].

Insertar las filas semilla (seed) en milestone_definitions para la categoría alcohol.

Criterio de validación: Crear un usuario de prueba e insertar una fila en trackers; verificar que trg_after_tracker_insert haya creado automáticamente la fila correspondiente en tracker_streaks.

Bloque 2: Onboarding, Estado Local-First y Shell de Navegación
Objetivo: Capturar los parámetros base del usuario y levantar la carcasa visual Dark Mode.

Archivos a construir:

src/store/useTrackerStore.ts

src/components/onboarding/SetupTrackerWizard.tsx

src/components/layout/AppShell.tsx

Flujo exacto de Onboarding (4 pantallas):

Selección: Alcohol (preseleccionado) + Alias anónimo autogenerado editable.

Último consumo: DateTime picker exacto (permite fechas pasadas si ya lleva días sin beber, o "Ahora mismo").

Impacto semanal: "¿Cuántos días por semana bebías?" y "¿Cuánto gastabas de media cada vez?" -> calcula internamente cost_per_day y time_spent_minutes_per_day.

Primera Ancla: "¿Cuál es tu razón #1 para dar este paso?" (guarda el primer registro en motivation_anchors).

Criterio de validación: Al terminar el wizard, el estado queda guardado tanto en Supabase como en localStorage y redirige al Dashboard sin parpadeos.

Bloque 3: El Motor del Reloj, Anillo de Hitos y Salud Biológica
Objetivo: Construir el corazón visual de la aplicación (Tab 1: Dashboard).

Archivos a construir:

src/hooks/useSobrietyTicker.ts

src/hooks/useMilestoneEngine.ts

src/components/counter/SobrietyClock.tsx

src/components/counter/MilestoneRing.tsx

src/components/counter/BiologicalStatusCard.tsx

src/components/counter/SavingsMetricsGrid.tsx

Detalles de implementación:

El reloj debe permitir alternar con un toque (tap) entre Vista Detallada (14 Días : 08 Horas : 42 Min : 19 Seg), Vista Total en Horas (344,7 Horas) y Vista en Segundos.

Debajo del reloj, renderizar BiologicalStatusCard mostrando qué está reparando su cuerpo en ese momento exacto y una barra de progreso porcentual de su recuperación física.

Criterio de validación: El contador avanza cada segundo con tipografía tabular-nums (sin saltos horizontales de layout) y recalcula el ahorro económico en vivo.

Bloque 4: Ciclo Diario (Hold-to-Pledge, Revisión Nocturna y Flujo de Reinicio)
Objetivo: Implementar el bucle de retención diaria y el protocolo seguro de recaídas.

Archivos a construir:

src/components/routines/MorningPledgeSheet.tsx

src/components/routines/EveningReviewWizard.tsx

src/components/routines/RelapseResetModal.tsx

src/components/diary/CalendarHeatmap.tsx

Detalles de implementación:

Implementar el botón HoldToPledgeButton: usa un temporizador de 1500ms con animación SVG circular alrededor del botón; al completarse, dispara confeti sutil en tonos esmeralda y guarda en daily_pledges.

En CalendarHeatmap (Tab 2: Diario), pintar cada día del mes con código de color:

Verde Esmeralda (#10B981): Día sobrio con dificultad baja (1-2).

Ámbar (#F59E0B): Día sobrio pero con dificultad alta (4-5, victoria difícil).

Rojo Coral (#EF4444): Día con registro de reinicio.

Borde punteado: Compromiso matutino firmado, pendiente de revisión nocturna.

Criterio de validación: Probar el botón "Reiniciar contador", verificar la pantalla intermedia de fricción y comprobar que al confirmar el reinicio se ejecuta rpc_reset_sobriety_counter, llevando el reloj a cero pero conservando el historial en la pestaña de Diario.

Bloque 5: Kit de Emergencia SOS ("Urge Surfing") y Analítica de Detonantes
Objetivo: Dar al usuario una herramienta de intervención inmediata cuando siente ganas de beber y mostrarle sus patrones de riesgo.

Archivos a construir:

src/components/sos/UrgeSurfingOverlay.tsx

src/components/sos/BreathingPacer.tsx

src/components/sos/WhyIDoThisCarousel.tsx

src/hooks/useTriggerAnalytics.ts

Detalles de implementación:

El botón SOS debe estar siempre visible en el AppShell (esquina superior derecha con icono de escudo/salvavidas en tono ámbar/rojo).

Al abrir UrgeSurfingOverlay:

Muestra un temporizador de 5 minutos (la neurociencia indica que el pico agudo de un craving dura entre 3 y 5 minutos).

Inicia la guía visual de respiración 4-7-8 (círculo que se expande en 4s, mantiene en 7s y contrae en 8s).

Muestra debajo las tarjetas de WhyIDoThisCarousel (fotos y textos subidos por el usuario).

Al cerrar con el botón "He superado el impulso", guarda un registro en urge_logs y suma +1 a su estadística de "Crisis vencidas".

Bloque 6: Comunidad Anónima por Cohortes de Tiempo
Objetivo: Conectar al usuario únicamente con personas que están exactamente en su misma etapa del proceso.

Archivos a construir:

src/components/community/MilestoneCohortTabs.tsx

src/components/community/StoryPostCard.tsx

src/components/community/CreateMilestonePostModal.tsx

Detalles de implementación:

La vista se abre por defecto en el milestone_bucket que coincide con los días actuales del usuario (ej. si lleva 4 días, ve el feed de day_1_to_7).

Cada tarjeta muestra el alias del autor, una insignia con sus días exactos en el momento de publicar, el texto de reflexión y el botón de reacción rápida ("Dar ánimo" / Cheer) con actualización optimista en UI.

¿Empezamos generando el código completo del Bloque 1 (Script SQL unificado listo para el SQL Editor de Supabase) y el Bloque 2 (Store + Onboarding), o prefieres ir directo a maquetar la interfaz del Dashboard?