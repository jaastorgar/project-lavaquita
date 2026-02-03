import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AppNavigator from "./src/AppNavigator";
import { initDatabase } from "./src/db/schema";

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        console.log("Base de datos lista 🐷");
        setDbReady(true);
      } catch (err) {
        console.log("Error DB:", err);
        setDbError(err);
      }
    })();
  }, []);

  if (dbError) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
          Error inicializando la base de datos
        </Text>
        <Text>{String(dbError)}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Cargando La Vaquita… 🐷</Text>
      </View>
    );
  }

  return <AppNavigator />;
}