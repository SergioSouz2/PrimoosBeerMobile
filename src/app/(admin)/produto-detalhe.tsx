import { Redirect } from "expo-router";

export default function Index() {
  const user = {
    role: "admin", // ou "user"
  };

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === "admin") {
    return <Redirect href="/(admin)/pedido" />;
  }

  return <Redirect href="/(user)/inicio" />;
}