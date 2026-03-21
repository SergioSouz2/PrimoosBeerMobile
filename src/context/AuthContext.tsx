import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    avatar_url: string | null;
}

interface AuthContextData {
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    async function carregarPerfil(userId: string) {
        const { data } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();


        if (data) setUser(data);
    }

    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    }

    useEffect(() => {
        async function inicializar() {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session) {
                await carregarPerfil(session.user.id); // 👈 aguarda o perfil
            }

            setLoading(false); // 👈 só aqui depois de tudo
        }

        inicializar();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                if (session) {
                    carregarPerfil(session.user.id);
                } else {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}