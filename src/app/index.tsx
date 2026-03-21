import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { session, user, loading } = useAuth();

  // Aguarda sessão E perfil carregarem
  if (loading || (session && !user)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === "admin") {
    return <Redirect href="/(admin)/pedido" />;
  }

  return <Redirect href="/(user)/inicio" />;
}