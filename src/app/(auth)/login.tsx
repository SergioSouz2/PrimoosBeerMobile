import { FormLogin } from "@/components/FormLogin";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTheme } from "@/hook/useTheme";
import { Image, StyleSheet, Text, View } from "react-native";

const Login = () => {
  const { colors } = useTheme();
 
  return (
    <ScreenContainer >
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/logo.png")}
          style={styles.logo}
        />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Bem-vindo(a)</Text>
      <Text style={[styles.description, { color: colors.textPrimary }]}>Entre com sua email e senha</Text>

      <FormLogin />

      <Text style={[styles.footer, { color: colors.text }]}>
        Ao entrar, você concorda com nossos Termos de Serviço.

      </Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
  },

  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  description: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 20,
  },

  footer: {
    marginTop: 26,
    textAlign: "center",
    fontSize: 12,
  }
});

export default Login;