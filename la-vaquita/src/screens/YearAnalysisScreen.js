import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { executeSql } from "../db/database";

const TZ = "America/Santiago";

function formatCurrency(n) {
  return `$${Number(n ?? 0).toLocaleString("es-CL")}`;
}

function currentYear() {
  return new Intl.DateTimeFormat("es-CL", { timeZone: TZ, year: "numeric" }).format(new Date());
}

export default function YearAnalysisScreen({ navigation }) {
  const [rows, setRows] = useState([]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    // created_at es TEXT ISO -> strftime('%Y', created_at) funciona
    const data = await executeSql(`
      SELECT
        strftime('%Y', r.created_at) AS year,
        IFNULL(SUM(r.subtotal), 0) AS total,
        COUNT(*) AS movements
      FROM records r
      GROUP BY year
      ORDER BY year DESC;
    `);

    setRows(data || []);
  }

  const yearNow = useMemo(() => currentYear(), []);
  const totalNow = useMemo(() => {
    const found = rows.find((x) => String(x.year) === String(yearNow));
    return found ? Number(found.total) : 0;
  }, [rows, yearNow]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Análisis anual</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>Total {yearNow}</Text>
        <Text style={styles.highlightValue}>{formatCurrency(totalNow)}</Text>
        <Text style={styles.highlightHint}>Suma de todos los movimientos del año.</Text>
      </View>

      {rows.length === 0 ? (
        <Text style={styles.empty}>Aún no hay datos para analizar.</Text>
      ) : (
        rows.map((r) => (
          <View key={r.year} style={styles.card}>
            <Text style={styles.year}>{r.year}</Text>
            <Text style={styles.total}>{formatCurrency(r.total)}</Text>
            <Text style={styles.meta}>{Number(r.movements)} movimientos</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4E6", padding: 16 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "800", color: "#5A3E2B" },
  backBtn: { backgroundColor: "#EFE7DA", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14 },
  backText: { color: "#5A3E2B", fontWeight: "800" },

  highlightCard: {
    marginTop: 12,
    backgroundColor: "#F6C1CC",
    padding: 18,
    borderRadius: 20,
  },
  highlightLabel: { color: "#5A3E2B", fontWeight: "800" },
  highlightValue: { marginTop: 6, fontSize: 30, fontWeight: "900", color: "#5A3E2B" },
  highlightHint: { marginTop: 6, color: "#7A5C48", fontWeight: "600" },

  empty: { marginTop: 14, color: "#7A5C48", fontWeight: "700" },

  card: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
  },
  year: { fontSize: 18, fontWeight: "900", color: "#5A3E2B" },
  total: { marginTop: 6, fontSize: 20, fontWeight: "900", color: "#5A3E2B" },
  meta: { marginTop: 4, color: "#9E8574", fontWeight: "700" },
});