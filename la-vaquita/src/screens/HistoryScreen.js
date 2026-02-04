import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { executeSql } from "../db/database";

export default function HistoryScreen() {
  const [records, setRecords] = useState([]);

  const loadRecords = useCallback(async () => {
    try {
      const rows = await executeSql(`
        SELECT r.id, r.quantity, r.subtotal, r.created_at, c.name
        FROM records r
        JOIN coins c ON c.id = r.coin_id
        ORDER BY r.created_at DESC;
      `);
      setRecords(rows || []);
    } catch (err) { 
      console.error("Error al cargar historial:", err); 
    }
  }, []);

  useFocusEffect(useCallback(() => { loadRecords(); }, [loadRecords]));

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "---";
    // Convertimos a Number para evitar el error 'Invalid Date'
    const date = new Date(Number(timestamp)); 
    return date.toLocaleString("es-CL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // Función para que tu mamá elimine un error específico
  const deleteOne = (id) => {
    Alert.alert(
      "Eliminar registro", 
      "¿Estás segura de borrar este ingreso? El total se ajustará automáticamente. 🐷", 
      [
        { text: "No, cancelar", style: "cancel" },
        { 
          text: "Sí, borrar", 
          style: "destructive", 
          onPress: async () => {
            await executeSql(`DELETE FROM records WHERE id = ?`, [id]);
            loadRecords(); // Refresca la lista tras borrar
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {records.length === 0 ? (
        <Text style={styles.empty}>La alcancía está vacía. 🐷</Text>
      ) : (
        records.map((r) => (
          <Pressable 
            key={r.id} 
            onLongPress={() => deleteOne(r.id)} // Mantener presionado para borrar
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.7 }
            ]}
          >
            <View style={styles.row}>
              <Text style={styles.coinName}>{r.name}</Text>
              <Text style={styles.total}>${Number(r.subtotal).toLocaleString("es-CL")}</Text>
            </View>
            <Text style={styles.qty}>{r.quantity} monedas guardadas</Text>
            <Text style={styles.date}>{formatDateTime(r.created_at)}</Text>
            <Text style={styles.hint}>Mantén presionado para borrar 👆</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4E6", padding: 16 },
  empty: { textAlign: 'center', marginTop: 50, color: '#7A5C48', fontWeight: 'bold' },
  card: { 
    backgroundColor: "#FFF", 
    padding: 18, 
    borderRadius: 18, 
    marginBottom: 12, 
    elevation: 3, 
    borderLeftWidth: 6, 
    borderLeftColor: "#7B1FA2" // Púrpura secundario
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  coinName: { fontSize: 18, fontWeight: "900", color: "#343A40" },
  total: { fontSize: 18, fontWeight: "900", color: "#4A008B" }, // Púrpura primario
  qty: { color: "#555555", marginTop: 4, fontWeight: '600' },
  date: { color: "#9E8574", fontSize: 12, marginTop: 10 },
  hint: { fontSize: 10, color: "#7B1FA2", textAlign: 'right', marginTop: 5, fontStyle: 'italic' }
});