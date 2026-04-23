import { Pedido } from "@/hook/usePedidos";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";
import { CardPedidos } from "./CardPedido";

interface ListaPedidosProps {
    pedidos: Pedido[];
    loading: boolean;
}

export function ListaPedidos({ pedidos, loading }: ListaPedidosProps) {
    const router = useRouter();

    function handlePressPedido(pedido: Pedido) {
        router.push({
            pathname: "/(admin)/pedido/[id]",
            params: { id: pedido.id }
        });
    }

    if (loading) {                                                                                                                                                                                                                                                                                                                                  
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FlatList
            data={pedidos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
                paddingBottom: 100,
                paddingTop: 10,
                gap: 16,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <CardPedidos pedido={item} onPress={() => handlePressPedido(item)} />
            )}
        />
    );
}