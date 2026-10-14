import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Profile } from '../types/database.types';
import { User, Session } from '@supabase/supabase-js';

export interface AuthStateChangePayload {
  event: string;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
}

export const authService = {
  /**
   * Obtiene la sesión actual de Supabase
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err) {
      console.warn('No se pudo obtener la sesión:', err);
      return null;
    }
  },

  /**
   * Obtiene el usuario autenticado actual
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data.user;
    } catch {
      return null;
    }
  },

  /**
   * Carga o crea el perfil en la tabla public.profiles
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si no existe perfil todavía, intentamos crearlo
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      return null;
    }
  },

  /**
   * Registra un nuevo usuario con Email y Contraseña + Metadatos de Alias y Avatar
   */
  async signUp(
    email: string,
    password: string,
    anonymousAlias: string,
    avatarColor: string = '#10B981'
  ) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado con claves válidas en el entorno.');
    }

    const trimmedAlias = anonymousAlias.trim();
    if (!trimmedAlias) {
      throw new Error('Debes indicar un alias anónimo para la comunidad.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          anonymous_alias: trimmedAlias,
          avatar_color: avatarColor,
        },
      },
    });

    if (error) throw error;

    // Si el trigger de Postgres creó el perfil, lo recuperamos; de lo contrario aseguramos su inserción
    if (data.user) {
      const profile = await this.getProfile(data.user.id);
      if (!profile) {
        const { error: insertErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          anonymous_alias: trimmedAlias,
          avatar_color: avatarColor,
        });
        if (insertErr) console.warn('Aviso al insertar perfil manual:', insertErr.message);
      }
    }

    // Enviar confirmación y registrar en Acumbamail de forma segura vía Serverless Function
    try {
      await fetch('/api/acumbamail-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          alias: trimmedAlias,
          list_id: '1127337',
        }),
      });
    } catch (acumbaErr) {
      console.warn('Aviso al suscribir en Acumbamail:', acumbaErr);
    }

    return data;
  },

  /**
   * Inicia sesión con Email y Contraseña
   */
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado con claves válidas.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Registro e inicio de sesión anónimo en la nube (1 solo clic)
   */
  async signInAnonymously(anonymousAlias: string, avatarColor: string = '#10B981') {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado.');
    }

    const trimmedAlias = anonymousAlias.trim() || `Sobrio_${Math.floor(Math.random() * 9000 + 1000)}`;

    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          anonymous_alias: trimmedAlias,
          avatar_color: avatarColor,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        anonymous_alias: trimmedAlias,
        avatar_color: avatarColor,
      });
    }

    return data;
  },

  /**
   * Actualiza los datos de alias o avatar del perfil en Supabase
   */
  async updateProfile(userId: string, updates: { anonymous_alias?: string; avatar_color?: string }) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Cierra la sesión activa
   */
  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Escucha cambios de estado de autenticación (Login, Logout, Token refresh)
   */
  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user ?? null);
    });

    return {
      unsubscribe: () => {
        data.subscription.unsubscribe();
      },
    };
  },
};
