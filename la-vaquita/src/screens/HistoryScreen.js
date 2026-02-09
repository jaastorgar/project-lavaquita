import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { executeSql } from "../db/database";
import { Ionicons } from "@expo/vector-icons";

const TZ = "America/Santiago";

function formatMonth(dt) {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  }).format(dt);
}

function formatDay(dt) {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: TZ,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dt);
}

function formatTime(dt) {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(dt);
}

export default function HistoryScreen({ navigation }) {
  const [records, setRecords] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    const rows = await executeSql(`
      SELECT
        r.id,
        r.quantity,
        r.subtotal,
        r.created_at,
        c.name AS coin_name,
        c.value AS coin_value
      FROM records r
      INNER JOIN coins c ON c.id = r.coin_id
      ORDER BY r.created_at DESC;
    `);

    setRecords(rows || []);
  }

  const grouped = useMemo(() => {
    const byMonth = new Map();

    for (const r of records) {
      const dt = new Date(r.created_at);
      const monthLabel = formatMonth(dt);
      const dayLabel = formatDay(dt);

      if (!byMonth.has(monthLabel)) byMonth.set(monthLabel, new Map());
      const byDay = byMonth.get(monthLabel);

      if (!byDay.has(dayLabel)) byDay.set(dayLabel, []);
      byDay.get(dayLabel).push({ ...r, _dt: dt });
    }

    const out = [];
    for (const [monthLabel, byDay] of byMonth.entries()) {
      const daysArr = [];
      for (const [dayLabel, items] of byDay.entries()) {
        daysArr.push({ dayLabel, items });
      }
      out.push({ monthLabel, days: daysArr });
    }
    return out;
  }, [records]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Historial</Text>

        <Pressable
          onPress={() => navigation.navigate("YearAnalysis")}
          style={styles.analysisBtn}
        >
          <Ionicons name="stats-chart" size={18} color="#5A3E2B" />
          <Text style={styles.analysisText}>Análisis anual</Text>
        </Pressable>
      </View>

      {grouped.length === 0 ? (
        <Text style={styles.empty}>No hay registros todavía.</Text>
      ) : (
        grouped.map((m) => (
          <View key={m.monthLabel} style={styles.monthBlock}>
            <Text style={styles.monthTitle}>{m.monthLabel}</Text>

            {m.days.map((d) => (
              <View key={d.dayLabel} style={styles.dayBlock}>
                <Text style={styles.dayTitle}>{d.dayLabel}</Text>

                {d.items.map((r) => {
                  const sign = r.subtotal < 0 ? "-" : "+";
                  const absSubtotal = Math.abs(Number(r.subtotal));
                  const absQty = Math.abs(Number(r.quantity));

                  return (
                    <View key={r.id} style={styles.card}>
                      <Text style={styles.coinName}>{r.coin_name}</Text>
                      <Text style={styles.line}>
                        {sign} {absQty} monedas — ${absSubtotal.toLocaleString("es-CL")}
                      </Text>
                      <Text style={styles.time}>{formatTime(r._dt)}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4E6", padding: 16 },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: { fontSize: 22, fontWeight: "800", color: "#5A3E2B" },

  analysisBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFE7DA",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },

  analysisText: { color: "#5A3E2B", fontWeight: "800", fontSize: 14 },

  empty: { color: "#7A5C48", marginTop: 12, fontWeight: "700" },

  monthBlock: { marginTop: 12, marginBottom: 18 },
  monthTitle: { fontSize: 18, fontWeight: "900", color: "#5A3E2B", marginBottom: 8 },

  dayBlock: { marginBottom: 10 },
  dayTitle: { fontSize: 14, fontWeight: "800", color: "#7A5C48", marginBottom: 8 },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
  },

  coinName: { fontSize: 16, fontWeight: "800", color: "#5A3E2B" },
  line: { marginTop: 4, color: "#7A5C48", fontSize: 14 },
  time: { marginTop: 6, color: "#A08A7A", fontSize: 12 },
});