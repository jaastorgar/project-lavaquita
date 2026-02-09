import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import AddCoinScreen from "./screens/AddCoinScreen";
import HistoryScreen from "./screens/HistoryScreen";
import YearAnalysisScreen from "./screens/YearAnalysisScreen"; // ✅ NUEVO

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddCoin"
          component={AddCoinScreen}
          options={{ title: "Registrar monedas" }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: "Historial" }}
        />
        <Stack.Screen
          name="YearAnalysis"
          component={YearAnalysisScreen}
          options={{ title: "Análisis anual" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}