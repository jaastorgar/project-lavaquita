import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { executeSql } from "../db/database";

export default function AddCoinScreen({ route, navigation }) {
  const { coinId } = route.params;
  const [qty, setQty] = useState("");

  async function save() {
    const quantity = parseInt(qty);
    
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida de monedas");
      return;
    }

    try {
      // 1. Buscamos el valor de la moneda seleccionada
      const rows = await executeSql(
        `SELECT id, value FROM coins WHERE id = ?;`,
        [coinId]
      );

      if (rows.length === 0) return;
      const coin = rows[0];

      // 2. Calculamos el subtotal y el tiempo actual
      const subtotal = coin.value * quantity;
      const now = Date.now(); // Timestamp en milisegundos

      // 3. Insertamos el registro
      await executeSql(
        `INSERT INTO records (coin_id, quantity, subtotal, created_at) VALUES (?, ?, ?, ?);`,
        [coin.id, quantity, subtotal, now]
      );

      // Volvemos a la pantalla anterior
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo registrar. Reintenta.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>¿Cuántas monedas vas a guardar?</Text>
      <TextInput
        value={qty}
        onChangeText={setQty}
        keyboardType="numeric"
        style={styles.input}
        placeholder="Ej: 10"
        autoFocus
      />
      <Pressable onPress={save} style={styles.btn}>
        <Text style={styles.btnText}>Confirmar y Guardar 🐷</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF4E6" },
  label: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#5A3E2B" },
  input: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    fontSize: 20,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  btn: {
    backgroundColor: "#F5C36A",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    elevation: 3,
  },
  btnText: { textAlign: "center", fontSize: 18, fontWeight: "800", color: "#FFF" },
});