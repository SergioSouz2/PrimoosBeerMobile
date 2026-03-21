import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export interface Pedido {
    id: string;
    status: "pendente" | "preparando" | "enviado" | "entregue" | "cancelado";
    total: number;
    created_at: string;
}

export function usePedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    async function carregarPedidos() {
        setLoading(true);

        const { data, error } = await supabase
            .from("pedidos")
            .select("id, status, total, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            Alert.alert("Erro", "Não foi possível carregar os pedidos.");
            setLoading(false);
            return;
        }

        setPedidos(data);
        setLoading(false);
    }

    useEffect(() => {
        carregarPedidos();
    }, []);

    return { pedidos, loading, recarregar: carregarPedidos };
}