import { GoBack } from '@/components/GoBack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ProdutoDetalhe() {
  const router = useRouter();

  function handleGoBack() {
    router.push("/(admin)/produto");
  }

  return (
    <ScreenContainer>
      {/* Header Superior */}
      <View style={styles.header}>
        <GoBack onPress={handleGoBack} />
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text>Aqui vai o restante do conteúdo...</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  }
});