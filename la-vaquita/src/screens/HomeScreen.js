import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { executeSql } from "../db/database";

export default function HomeScreen({ navigation }) {
  const [coins, setCoins] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadCoins();
    }, [])
  );

  async function loadCoins() {
    const data = await executeSql(`
      SELECT c.id, c.name, c.value,
        IFNULL(SUM(r.subtotal), 0) AS total
      FROM coins c
      LEFT JOIN records r ON r.coin_id = c.id
      GROUP BY c.id
      ORDER BY c.value ASC;
    `);

    setCoins(data);
  }

  const totalGeneral = coins.reduce((s, c) => s + (c.total ?? 0), 0);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: "700" }}>🐷 La Vaquita</Text>

      <View
        style={{
          backgroundColor: "#fdecef",
          padding: 16,
          borderRadius: 16,
          marginVertical: 16,
        }}
      >
        <Text>Total general</Text>
        <Text style={{ fontSize: 28, fontWeight: "800" }}>
          ${totalGeneral.toLocaleString("es-CL")}
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate("History")}
        style={{
          backgroundColor: "#e0e0e0",
          padding: 14,
          borderRadius: 14,
          marginBottom: 20,
        }}
      >
        <Text style={{ textAlign: "center" }}>📜 Ver historial</Text>
      </Pressable>

      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
        Registrar monedas
      </Text>

      {coins.map((coin) => (
        <Pressable
          key={coin.id}
          onPress={() => navigation.navigate("AddCoin", { coinId: coin.id })}
          style={{
            backgroundColor: "#f2f2f2",
            padding: 16,
            borderRadius: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>{coin.name}</Text>
          <Text>Total: ${(coin.total ?? 0).toLocaleString("es-CL")}</Text>
          <Text style={{ color: "#555", marginTop: 4 }}>
            ➕ Tocar para registrar
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}