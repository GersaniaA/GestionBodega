import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InicioScreen from "./Componentes/InicioScreen";
import ProductoList from "./Componentes/ProductoList";
import EstadisticasScreen from "./Componentes/EstadisticasScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Productos" component={InicioScreen} />
        <Stack.Screen name="ProductoList" component={ProductoList} />
        <Stack.Screen name="EstadisticasScreen" component={EstadisticasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}