import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface ItemCarrinho {
    produto_id: string;
    nome: string;
    preco: number;
    foto: string | null;
    quantidade: number;
}

interface CarrinhoContextData {
    items: ItemCarrinho[];
    total: number;
    totalItens: number;
    adicionar: (produto: Omit<ItemCarrinho, "quantidade">) => void;
    remover: (produto_id: string) => void;
    incrementar: (produto_id: string) => void;
    decrementar: (produto_id: string) => void;
    limpar: () => void;
}

const CarrinhoContext = createContext<CarrinhoContextData>({} as CarrinhoContextData);

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ItemCarrinho[]>([]);

    const adicionar = useCallback((produto: Omit<ItemCarrinho, "quantidade">) => {
        setItems((prev) => {
            const existe = prev.find((i) => i.produto_id === produto.produto_id);
            if (existe) {
                // Se já existe, incrementa a quantidade
                return prev.map((i) =>
                    i.produto_id === produto.produto_id
                        ? { ...i, quantidade: i.quantidade + 1 }
                        : i
                );
            }
            return [...prev, { ...produto, quantidade: 1 }];
        });
    }, []);

    const remover = useCallback((produto_id: string) => {
        setItems((prev) => prev.filter((i) => i.produto_id !== produto_id));
    }, []);

    const incrementar = useCallback((produto_id: string) => {
        setItems((prev) =>
            prev.map((i) =>
                i.produto_id === produto_id ? { ...i, quantidade: i.quantidade + 1 } : i
            )
        );
    }, []);

    const decrementar = useCallback((produto_id: string) => {
        setItems((prev) => {
            const item = prev.find((i) => i.produto_id === produto_id);
            if (!item) return prev;
            if (item.quantidade <= 1) {
                // Remove se chegar a 0
                return prev.filter((i) => i.produto_id !== produto_id);
            }
            return prev.map((i) =>
                i.produto_id === produto_id ? { ...i, quantidade: i.quantidade - 1 } : i
            );
        });
    }, []);

    const limpar = useCallback(() => setItems([]), []);

    const total = useMemo(
        () => items.reduce((sum, i) => sum + i.preco * i.quantidade, 0),
        [items]
    );

    const totalItens = useMemo(
        () => items.reduce((sum, i) => sum + i.quantidade, 0),
        [items]
    );

    return (
        <CarrinhoContext.Provider
            value={{ items, total, totalItens, adicionar, remover, incrementar, decrementar, limpar }}
        >
            {children}
        </CarrinhoContext.Provider>
    );
}

export function useCarrinho() {
    const context = useContext(CarrinhoContext);
    if (!context) throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider");
    return context;
}