import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen({ navigation }) {
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    checkPin();
  }, []);

  async function checkPin() {
    const savedPin = await SecureStore.getItemAsync("user_pin");
    if (savedPin) {
      setStoredPin(savedPin);
    } else {
      setIsFirstTime(true);
    }
  }

  async function handlePress() {
    if (isFirstTime) {
      if (pin.length < 4) {
        Alert.alert("Error", "El PIN debe tener al menos 4 números.");
        return;
      }
      await SecureStore.setItemAsync("user_pin", pin);
      navigation.replace("Home");
    } else {
      if (pin === storedPin) {
        navigation.replace("Home");
      } else {
        Alert.alert("Error", "PIN incorrecto 🐷");
        setPin("");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isFirstTime ? "Crea tu PIN de seguridad" : "Ingresa tu PIN"}
      </Text>
      <Text style={styles.subtitle}>Para cuidar los ahorros de la vaquita 🐷</Text>
      
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="****"
        keyboardType="numeric"
        secureTextEntry={true}
        maxLength={6}
      />

      <Pressable style={styles.btn} onPress={handlePress}>
        <Text style={styles.btnText}>
          {isFirstTime ? "Guardar y Entrar" : "Entrar"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4E6", justifyContent: "center", padding: 30 },
  title: { fontSize: 24, fontWeight: "900", color: "#4A008B", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#5A3E2B", textAlign: "center", marginBottom: 30, marginTop: 5 },
  input: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    fontSize: 30,
    textAlign: "center",
    borderWidth: 2,
    borderColor: "#7B1FA2",
    marginBottom: 20,
  },
  btn: { backgroundColor: "#4A008B", padding: 18, borderRadius: 15, elevation: 3 },
  btnText: { color: "#FFF", textAlign: "center", fontWeight: "800", fontSize: 18 },
});