import { useTheme } from "@/hook/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

type IconName = keyof typeof Ionicons.glyphMap;


interface Tab {
  name: string;
  title: string;
  icon: {
    focused: IconName;
    unfocused: IconName;
  };
}

const tabs: Tab[] = [
  {
    name: "pedido",
    title: "Pedidos",
    icon: {
      focused: "clipboard",
      unfocused: "clipboard-outline",
    },
  },
  {
    name: "produto",
    title: "Produtos",
    icon: {
      focused: "list",
      unfocused: "list-outline",
    },
  },
  {
    name: "promocao",
    title: "Promoções",
    icon: {
      focused: "pricetag",
      unfocused: "pricetag-outline",
    },
  },
  {
    name: "relatorio",
    title: "Relatórios",
    icon: {
      focused: "bar-chart",
      unfocused: "bar-chart-outline",
    },
  },
  {
    name: "perfil",
    title: "Perfil",
    icon: {
      focused: "person",
      unfocused: "person-outline",
    },
  },
];

export default function TabAdminLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 65,
          paddingBottom: 8,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? tab.icon.focused : tab.icon.unfocused}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}

      {/* esconder telas internas */}
      <Tabs.Screen name="pedido-detalhe" options={{ href: null }} />
      <Tabs.Screen name="produto-detalhe" options={{ href: null }} />
    </Tabs>
  );
}