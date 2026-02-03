import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { executeSql } from "../db/database";

export default function HistoryScreen() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await executeSql(`
      SELECT r.id, r.quantity, r.subtotal, r.created_at, c.name
      FROM records r
      JOIN coins c ON c.id = r.coin_id
      ORDER BY r.created_at DESC;
    `);

    setRecords(res);
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {records.map((r) => (
        <View
          key={r.id}
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#eee",
            marginBottom: 10,
          }}
        >
          <Text>{r.name}</Text>
          <Text>
            {r.quantity} monedas — ${r.subtotal.toLocaleString("es-CL")}
          </Text>
          <Text style={{ fontSize: 12 }}>{r.created_at}</Text>
        </View>
      ))}
    </ScrollView>
  );
}