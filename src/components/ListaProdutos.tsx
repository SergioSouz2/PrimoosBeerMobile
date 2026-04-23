import { CardProdutos } from "@/components/CardProdutos";
import { Produto } from "@/hook/useProdutos";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";

interface ListaProdutosProps {
    produtos: Produto[];
    loading: boolean;
}

export function ListaProdutos({ produtos, loading }: ListaProdutosProps) {
    const router = useRouter();

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    function handlePressProduto(produto: Produto) {
        router.push({
            pathname: "/(admin)/produto/[id]",
            params: { id: produto.id }
        });
    }

    return (
        <FlatList
            data={produtos}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: 16,
                gap: 16,
            }}
            contentContainerStyle={{
                paddingBottom: 100,
                paddingTop: 10
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <CardProdutos
                    name={item.nome}
                    estoque={item.estoque}
                    price={item.preco}
                    imageUrl={item.foto ?? undefined}
                    onpress={() => handlePressProduto(item)}
                />
            )}
        />
    );
}