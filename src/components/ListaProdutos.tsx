import { CardProdutos } from "@/components/CardProdutos";
import { useRouter } from "expo-router";
import { FlatList } from "react-native";

export const BEBIDAS_MOCK = [
    {
        id: "1",
        nome: "Cerveja Brahma Chopp",
        preco: 4.50,
        image: "https://m.media-amazon.com/images/I/61-8RM8nm9L._AC_SX342_SY445_QL70_ML2_.jpg",
    },
    {
        id: "2",
        nome: "Cerveja Heineken 330ml",
        preco: 6.90,
        image: "https://m.media-amazon.com/images/I/61OR0pOvcKL._AC_SX679_.jpg",
    },
    {
        id: "3",
        nome: "Vinho Tinto Cabernet",
        preco: 45.90,
        image: "https://divvino.vtexassets.com/arquivos/ids/161805-1200-auto?v=638929625106200000&width=1200&height=auto&aspect=true",
    },
    {
        id: "4",
        nome: "Gin Tanqueray London",
        preco: 120.00,
        image: "https://m.magazineluiza.com.br/a-static/420x420/gin-tanqueray-tradicional-london-dry-750ml/drinksbyelo/12774130325/c2b63998cda202c82173d41bcfe794af.jpg",
    },
    {
        id: "5",
        nome: "Vodka Absolut",
        preco: 89.90,
        image: "https://carrefourbr.vtexassets.com/arquivos/ids/181418188/vodka-absolut---1-litro-1.jpg?v=638695356716800000",
    },
    {
        id: "6",
        nome: "Whisky Jack Daniel's",
        preco: 145.00,
        image: "https://http2.mlstatic.com/D_NQ_NP_2X_730072-MLB108801276201_032026-F.webp",
    },
    {
        id: "7",
        nome: "Tequila José Cuervo",
        preco: 110.00,
        image: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?q=80&w=400&auto=format&fit=crop",
    },



];


export function ListaProdutos() {
    const router = useRouter();

    function handlePressProduto(produto: any) {
        console.log("Produto selecionado:", produto.id);

        // Navega para a tela passando o ID como parâmetro de busca (query param)
        router.push({
            pathname: "/(admin)/produto/[id]", // ✅ nova rota
            params: { id: produto.id }
        });
    }


    return (
        <FlatList
            data={BEBIDAS_MOCK}
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
                <CardProdutos name={item.nome} price={item.preco} imageUrl={item.image} onpress={() => handlePressProduto(item)} />
            )}
        />
    );
}