import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { executeSql } from "../db/database";

export default function AddCoinScreen({ route, navigation }) {
  const { coinId, mode = "add" } = route.params || {};
  const [coin, setCoin] = useState(null);
  const [qty, setQty] = useState("");

  useEffect(() => {
    loadCoin();
  }, []);

  async function loadCoin() {
    const rows = await executeSql(`SELECT * FROM coins WHERE id = ?;`, [coinId]);
    setCoin(rows?.[0] ?? null);
  }

  async function getAvailableQtyForCoin() {
    const rows = await executeSql(
      `SELECT IFNULL(SUM(quantity), 0) AS qtyTotal FROM records WHERE coin_id = ?;`,
      [coinId]
    );
    return Number(rows?.[0]?.qtyTotal ?? 0);
  }

  async function handleSave() {
    if (!coin) return;

    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("Cantidad inválida", "Ingresa un número mayor a 0.");
      return;
    }

    // Si es descuento, validar stock
    if (mode === "subtract") {
      const available = await getAvailableQtyForCoin();
      if (n > available) {
        Alert.alert(
          "No alcanza",
          `Tienes ${available} monedas de ${coin.name}. No puedes descontar ${n}.`
        );
        return;
      }
    }

    const signedQty = mode === "subtract" ? -n : n;
    const signedSubtotal = signedQty * Number(coin.value);

    await executeSql(
      `
      INSERT INTO records (coin_id, quantity, subtotal, created_at)
      VALUES (?, ?, ?, ?);
    `,
      [coinId, signedQty, signedSubtotal, new Date().toISOString()]
    );

    navigation.goBack();
  }

  const title = mode === "subtract" ? "Descontar" : "Registrar";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title} {coin ? coin.name : ""}
      </Text>

      <Text style={styles.label}>Cantidad de monedas</Text>
      <TextInput
        value={qty}
        onChangeText={setQty}
        placeholder="Ej: 5"
        keyboardType="numeric"
        style={styles.input}
      />

      <Pressable onPress={handleSave} style={styles.btn}>
        <Text style={styles.btnText}>Guardar</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()} style={styles.btnSecondary}>
        <Text style={styles.btnSecondaryText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4E6", padding: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#5A3E2B", marginBottom: 16 },
  label: { color: "#5A3E2B", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnSecondary: {
    marginTop: 10,
    backgroundColor: "#EFE7DA",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnSecondaryText: { color: "#5A3E2B", fontWeight: "700", fontSize: 16 },
});