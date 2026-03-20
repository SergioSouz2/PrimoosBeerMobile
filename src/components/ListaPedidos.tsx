import { useRouter } from "expo-router";
import { FlatList } from "react-native";
import { CardPedidos } from "./CardPedido";

export interface Pedido {
    id: string;
    numeroPedido: string;
    data: Date; // Agora tipado estritamente como Date
    status: "pendente" | "preparando" | "enviado" | "entregue" | "cancelado";
    total: number;
    itens: {
        id: string;
        nome: string;
        quantidade: number;
        precoUnitario: number;
        image: string;
    }[];
}

export const PEDIDOS_MOCK: Pedido[] = [
    {
        id: "ord_1",
        numeroPedido: "#1050",
        data: new Date("2024-05-20T14:30:00Z"), // Convertido para Date
        status: "entregue",
        total: 54.90,
        itens: [

            {
                id: "1",
                nome: "Cerveja Brahma Chopp",
                quantidade: 10,
                precoUnitario: 4.50,
                image: "https://m.media-amazon.com/images/I/61-8RM8nm9L._AC_SX342_SY445_QL70_ML2_.jpg",
            },
            {
                id: "2",
                nome: "Cerveja Heineken 330ml",
                quantidade: 5,
                precoUnitario: 6.90,
                image: "https://m.media-amazon.com/images/I/61OR0pOvcKL._AC_SX679_.jpg",
            },
            {
                id: "3",
                nome: "Vinho Tinto Cabernet",
                quantidade: 2,
                precoUnitario: 45.90,
                image: "https://divvino.vtexassets.com/arquivos/ids/161805-1200-auto?v=638929625106200000&width=1200&height=auto&aspect=true",
            },
        ]
    },
    {
        id: "ord_2",
        numeroPedido: "#1051",
        data: new Date("2024-05-21T10:15:00Z"), // Convertido para Date
        status: "preparando",
        total: 120.00,
        itens: [
            {
                id: "4",
                nome: "Gin Tanqueray London",
                quantidade: 1,
                precoUnitario: 120.00,
                image: "https://m.magazineluiza.com.br/a-static/420x420/gin-tanqueray-tradicional-london-dry-750ml/drinksbyelo/12774130325/c2b63998cda202c82173d41bcfe794af.jpg",

            }
        ]
    }
];


export function ListaPedidos() {

    const router = useRouter();
    function handlePressPedido(pedido: Pedido) {
        console.log("Pedido selecionado:", pedido);
        // Aqui você pode navegar para a tela de detalhes do pedido, passando o ID ou os dados necessários
        router.push({
            pathname: "/(admin)/pedido/[id]", // ✅ nova rota
            params: { id: pedido.id }
        });

    }
    return (
        <FlatList
            data={PEDIDOS_MOCK}
            keyExtractor={(item) => item.id}

            contentContainerStyle={{
                paddingBottom: 100,
                paddingTop: 10,
                gap: 16,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <CardPedidos pedido={item} onPress={() => handlePressPedido(item)} />}
        />
    );
}