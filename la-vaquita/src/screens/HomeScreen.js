import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { executeSql } from "../db/database";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [coins, setCoins] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadCoins();
    }, [])
  );

  async function loadCoins() {
    const data = await executeSql(`
      SELECT c.id, c.name, c.value,
        IFNULL(SUM(r.subtotal), 0) AS total,
        IFNULL(SUM(r.quantity), 0) AS qtyTotal
      FROM coins c
      LEFT JOIN records r ON r.coin_id = c.id
      GROUP BY c.id
      ORDER BY c.value ASC;
    `);
    setCoins(data);
  }

  const totalGeneral = coins.reduce((s, c) => s + (c.total ?? 0), 0);

  function confirmReset() {
    Alert.alert(
      "Reestablecer todo",
      "Esto eliminará TODOS los registros de monedas.\n\n¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, reestablecer",
          style: "destructive",
          onPress: resetAll,
        },
      ]
    );
  }

  async function resetAll() {
    await executeSql(`DELETE FROM records;`);
    loadCoins();
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>La Vaquita</Text>

        <Pressable onPress={confirmReset} style={styles.resetBtn}>
          <Ionicons name="trash-outline" size={22} color="#8B0000" />
        </Pressable>
      </View>

      {/* CONTENIDO */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* TOTAL */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total general</Text>
          <Text style={styles.totalValue}>
            ${totalGeneral.toLocaleString("es-CL")}
          </Text>
        </View>

        {/* HISTORIAL */}
        <Pressable
          onPress={() => navigation.navigate("History")}
          style={styles.historyBtn}
        >
          <Ionicons name="time-outline" size={18} color="#5A3E2B" />
          <Text style={styles.historyText}>Ver historial</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Registrar / Descontar</Text>

        {/* MONEDAS */}
        {coins.map((coin) => (
          <View key={coin.id} style={styles.coinCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.coinName}>{coin.name}</Text>
              <Text style={styles.coinTotal}>
                Total: $
                {Number(coin.total ?? 0).toLocaleString("es-CL")}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  navigation.navigate("AddCoin", {
                    coinId: coin.id,
                    mode: "subtract",
                  })
                }
                style={[styles.circleBtn, styles.minusBtn]}
              >
                <Ionicons name="remove" size={22} color="#FFF" />
              </Pressable>

              <Pressable
                onPress={() =>
                  navigation.navigate("AddCoin", {
                    coinId: coin.id,
                    mode: "add",
                  })
                }
                style={[styles.circleBtn, styles.plusBtn]}
              >
                <Ionicons name="add" size={22} color="#FFF" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF4E6",
  },

  header: {
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#5A3E2B",
  },

  resetBtn: {
    backgroundColor: "#FCECEC",
    padding: 10,
    borderRadius: 14,
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  totalCard: {
    backgroundColor: "#F6C1CC",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  totalLabel: {
    color: "#5A3E2B",
    fontSize: 16,
  },

  totalValue: {
    fontSize: 34,
    fontWeight: "800",
    color: "#5A3E2B",
  },

  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFE7DA",
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
  },

  historyText: {
    color: "#5A3E2B",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5A3E2B",
    marginBottom: 12,
  },

  coinCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  coinName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5A3E2B",
  },

  coinTotal: {
    marginTop: 4,
    color: "#7A5C48",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  plusBtn: {
    backgroundColor: "#F5C36A",
  },

  minusBtn: {
    backgroundColor: "#F36A6A",
  },
});