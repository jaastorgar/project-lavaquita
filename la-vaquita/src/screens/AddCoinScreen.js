import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { executeSql } from "../db/database";

export default function AddCoinScreen({ route, navigation }) {
  const { coinId } = route.params;
  const [coin, setCoin] = useState(null);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    loadCoin();
  }, []);

  async function loadCoin() {
    const res = await executeSql(
      `SELECT * FROM coins WHERE id = ?`,
      [coinId]
    );
    setCoin(res[0]);
  }

  async function save() {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida");
      return;
    }

    const subtotal = qty * coin.value;

    await executeSql(
      `INSERT INTO records (coin_id, quantity, subtotal, created_at)
       VALUES (?, ?, ?, datetime('now'));`,
      [coinId, qty, subtotal]
    );

    navigation.goBack();
  }

  if (!coin) return null;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22 }}>{coin.name}</Text>

      <TextInput
        placeholder="Cantidad de monedas"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12 }}
      />

      <Pressable
        onPress={save}
        style={{ padding: 14, borderRadius: 14, backgroundColor: "#4CAF50" }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Guardar
        </Text>
      </Pressable>
    </View>
  );
}