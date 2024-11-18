import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { db } from "../bd/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { captureRef } from "react-native-view-shot";

const EstadisticasScreen = () => {
  const [data, setData] = useState([]);
  const [productos, setProductos] = useState([]);
  const chartRef = useRef();

  const fetchProductData = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, "Productos"));
      const productData = productsSnapshot.docs.map((doc) => doc.data());

      const chartData = productData.map((producto, index) => ({
        name: producto.nombre,
        cantidad: parseInt(producto.cantidad, 10),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
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
      // Captura la imagen del gráfico en formato URI
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 0.8
      });
  
      // Crear una lista de los productos con sus cantidades
      const productosTexto = productos
        .map((producto) => `<li>${producto.nombre}: ${producto.cantidad}</li>`)
        .join("");
  
      // HTML para el PDF, con un solo título y lista de datos
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
  
      // Generar el PDF a partir del HTML
      const { uri: pdfUri } = await Print.printToFileAsync({ html });
      console.log("PDF generado en:", pdfUri);
  
      // Compartir el PDF generado
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
            backgroundGradientFrom: "#eff3ff",
            backgroundGradientTo: "#efefef",
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  chartContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
