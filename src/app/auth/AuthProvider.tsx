import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string; needsEmailVerify?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const client = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;

    client.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = client.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [client]);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    authReady: Boolean(client),
    signIn: async (email, password) => {
      if (!client) {
        return { ok: false, error: "Supabase is not configured" };
      }

      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        return { ok: false, error: error.message };
      }

      return { ok: true };
    },
    signUp: async (email, password) => {
      if (!client) {
        return { ok: false, error: "Supabase is not configured" };
      }

      const { data, error } = await client.auth.signUp({ email, password });
      if (error) {
        return { ok: false, error: error.message };
      }

      const needsEmailVerify = !data.session;
      return { ok: true, needsEmailVerify };
    },
    signOut: async () => {
      if (!client) {
        return;
      }
      await client.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
