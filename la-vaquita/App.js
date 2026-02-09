import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Insights from "expo-insights";
import AppNavigator from "./src/AppNavigator";
import { initDatabase } from "./src/db/schema";

// Mantiene la imagen de splash (la vaquita) visible mientras carga la app
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        // 🔹 Inicializa Expo Insights (analytics de uso)
        Insights.init();
        console.log("Expo Insights activo 📊");

        // 🔹 Inicializa la base de datos
        await initDatabase();
        console.log("Base de datos lista 🐷");

        setDbReady(true);
      } catch (err) {
        console.log("Error al iniciar App:", err);
        setDbError(err);
      } finally {
        // 🔹 Oculta splash nativo cuando todo esté listo
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Pantalla de error si algo falla
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>¡Ups! Algo salió mal</Text>
        <Text style={styles.errorText}>{String(dbError)}</Text>
      </View>
    );
  }

  // Mientras carga DB + splash
  if (!dbReady) {
    return null;
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#5A3E2B",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: "#D32F2F",
    textAlign: "center",
  },
});