import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { db } from "../bd/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

const EstadisticasScreen = () => {
  const [data, setData] = useState([]);
  const [productos, setProductos] = useState([]);
  const chartRef = useRef();

  const fetchProductData = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, "Productos"));
      const productData = productsSnapshot.docs.map((doc) => doc.data());

      const chartData = productData.map((producto) => ({
        name: producto.nombre,
        cantidad: parseInt(producto.cantidad, 10),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        legendFontColor: "#333",
        legendFontSize: 14,
      }));

      setData(chartData);
      setProductos(productData);
    } catch (error) {
      console.error("Error al obtener los datos del producto: ", error);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  const generarPDF = async () => {
    try {
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 0.8,
      });

      const productosTexto = productos
        .map((producto) => `<li>${producto.nombre}: ${producto.cantidad}</li>`)
        .join("");

      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Estadísticas</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              h1 { color: #333; }
              img { max-width: 100%; height: auto; margin-top: 20px; }
              ul { text-align: left; margin-top: 20px; list-style-type: none; padding: 0; }
              li { font-size: 16px; color: #333; }
            </style>
          </head>
          <body>
            <h1>Reporte de Estadísticas de Productos</h1>
            <img src="${uri}" alt="Gráfico de Estadísticas" />
            <ul>
              ${productosTexto}
            </ul>
          </body>
        </html>
      `;

      const { uri: pdfUri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(pdfUri);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas de Productos</Text>
      <View ref={chartRef} collapsable={false} style={styles.chartContainer}>
        <PieChart
          data={data}
          width={Dimensions.get("window").width - 50}
          height={250}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f4f6fc",
            backgroundGradientTo: "#eff3ff",
            color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"cantidad"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={generarPDF}>
        <Text style={styles.buttonText}>Generar PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f7f9fc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  chartContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EstadisticasScreen;
