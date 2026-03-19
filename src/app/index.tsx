import { Redirect } from "expo-router";

type Role = "admin" | "user" | null;

export default function Index() {
  const role = "admin" as Role;
  // const role = "user" as Role;
  // const role = null as Role;

  if (role === null) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === "admin") {
    return <Redirect href="/(admin)/pedido" />;
  }

  return <Redirect href="/(user)/inicio" />;
}