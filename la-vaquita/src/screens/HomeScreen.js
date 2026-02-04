import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { executeSql, deleteAllData } from "../db/database";

export default function HomeScreen({ navigation }) {
  const [coins, setCoins] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadCoins = useCallback(async () => {
    try {
      const rows = await executeSql(`
        SELECT c.id, c.name, c.value, 
          IFNULL(SUM(r.subtotal), 0) AS total
        FROM coins c
        LEFT JOIN records r ON r.coin_id = c.id
        GROUP BY c.id
        ORDER BY c.value ASC;
      `);
      setCoins(rows ?? []);
    } catch (err) { console.log(err); }
  }, []);

  useFocusEffect(useCallback(() => { loadCoins(); }, [loadCoins]));

  const totalGeneral = coins.reduce((sum, c) => sum + (c.total ?? 0), 0);

  const handleReset = () => {
    setMenuVisible(false);
    Alert.alert("¿Vaciar la vaquita? 🐷", "Se borrará todo el historial del año permanentemente.", [
      { text: "No", style: "cancel" },
      { text: "Sí, borrar todo", style: "destructive", onPress: async () => {
          await deleteAllData();
          loadCoins();
      }}
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header con el nuevo botón de menú */}
      <View style={styles.header}>
        <Text style={styles.title}>La Vaquita</Text>
        <Pressable onPress={() => setMenuVisible(true)} style={styles.menuIcon}>
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total general ahorrado</Text>
          <Text style={styles.totalValue}>${totalGeneral.toLocaleString("es-CL")}</Text>
        </View>

        <Pressable onPress={() => navigation.navigate("History")} style={styles.historyBtn}>
          <Text style={styles.historyText}>📜 Ver historial de ingresos</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Registrar monedas</Text>
        {coins.map((coin) => (
          <Pressable key={coin.id} onPress={() => navigation.navigate("AddCoin", { coinId: coin.id })} style={styles.coinCard}>
            <View>
              <Text style={styles.coinName}>{coin.name}</Text>
              <Text style={styles.coinTotal}>Acumulado: ${Number(coin.total ?? 0).toLocaleString("es-CL")}</Text>
            </View>
            <View style={styles.addCircle}><Text style={styles.addText}>+</Text></View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Menú de Opciones */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>Configuración</Text>
            <Pressable onPress={handleReset} style={styles.menuItem}>
              <Text style={styles.resetText}>⚠️ Comenzar de 0 (Borrar todo)</Text>
            </Pressable>
            <Pressable onPress={() => setMenuVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cerrar menú</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFF4E6" },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: "900", color: "#4A008B" }, // Primary Purple
  container: { padding: 16 },
  totalCard: { backgroundColor: "#F6C1CC", padding: 24, borderRadius: 25, elevation: 4 },
  totalLabel: { color: "#5A3E2B", fontSize: 14, fontWeight: "700", opacity: 0.8 },
  totalValue: { fontSize: 38, fontWeight: "900", color: "#5A3E2B" },
  historyBtn: { backgroundColor: "#EFE7DA", padding: 18, borderRadius: 20, marginVertical: 20 },
  historyText: { textAlign: "center", color: "#5A3E2B", fontSize: 16, fontWeight: "800" },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#343A40", marginBottom: 15 },
  coinCard: { backgroundColor: "#FFF", padding: 18, borderRadius: 20, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 2, borderLeftWidth: 6, borderLeftColor: "#7B1FA2" }, // Secondary Purple
  coinName: { fontSize: 18, fontWeight: "800" },
  addCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F5C36A", justifyContent: "center", alignItems: "center" },
  addText: { color: "#FFF", fontSize: 26, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  menuBox: { backgroundColor: '#FFF', width: '80%', borderRadius: 20, padding: 25 },
  menuTitle: { fontSize: 18, fontWeight: '900', color: '#4A008B', marginBottom: 20, textAlign: 'center' },
  menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  resetText: { color: '#D32F2F', fontWeight: 'bold', textAlign: 'center' },
  closeText: { textAlign: 'center', marginTop: 15, color: '#555', fontWeight: 'bold' }
});