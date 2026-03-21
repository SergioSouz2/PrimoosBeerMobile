import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export interface Produto {
    id: string;
    nome: string;
    preco: number;
    foto: string | null;
    estoque: number;
}

export function useProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);

    async function carregarProdutos() {
        setLoading(true);
        const { data, error } = await supabase
            .from("produtos")
            .select("id, nome, preco, foto, estoque")
            .order("nome");

        if (error) {
            Alert.alert("Erro", "Não foi possível carregar os produtos.");
            setLoading(false);
            return;
        }

        setProdutos(data);
        setLoading(false);
    }

    useEffect(() => {
        carregarProdutos();
    }, []);

    return { produtos, loading, recarregar: carregarProdutos };
}