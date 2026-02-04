import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
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
        // 1. Inicializa la base de datos de los ahorros
        await initDatabase();
        console.log("Base de datos lista 🐷");
        
        // Opcional: Pequeña pausa para que tu mamá vea la imagen de inicio
        // await new Promise(resolve => setTimeout(resolve, 1000));

        setDbReady(true);
      } catch (err) {
        console.log("Error al iniciar App:", err);
        setDbError(err);
      } finally {
        // 2. Oculta la imagen de splash una vez que todo cargó
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Pantalla de error por si algo falla con la base de datos
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>¡Ups! Algo salió mal</Text>
        <Text style={styles.errorText}>{String(dbError)}</Text>
      </View>
    );
  }

  // Mientras dbReady sea false, Expo mantendrá el Splash nativo visible automáticamente
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