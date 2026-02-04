import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

export default function SplashScreen({ navigation }) {
  
  // Opcional: Redirigir automáticamente después de 3 segundos
  // si tu mamá no presiona la pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.replace("Login")} // Redirige al PIN de seguridad
    >
      <Image
        source={require("../../assets/images/splash-vaquita.png")}
        style={styles.image}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6", // Fondo crema suave que definimos
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Ocupa toda la pantalla sin dejar bordes blancos
  },
});