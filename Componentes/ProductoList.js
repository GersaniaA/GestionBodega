import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Image, ScrollView, StyleSheet, Text, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { db } from "../bd/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const ProductoList = ({ route, navigation }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState("");
  const [imagenVisual, setImagenVisual] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { id } = route.params?.productos || {};

  useEffect(() => {
    if (id) {
      cargarProducto();
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      const docRef = doc(db, "Productos", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setCantidad(data.cantidad.toString());
        setPrecio(data.precio.toString());
        setImagen(data.imagen);
        setImagenVisual(`data:image/png;base64,${data.imagen}`);
      } else {
        Alert.alert("Error", "Producto no encontrado");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error al cargar producto: ", error);
      Alert.alert("Error", "No se pudo cargar el producto");
    }
  };

  const actualizarProducto = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const productoRef = doc(db, "Productos", id);
      await updateDoc(productoRef, {
        nombre,
        descripcion,
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio),
        imagen,
      });
      Alert.alert("Éxito", "Producto actualizado correctamente");
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      Alert.alert("Error", "No se pudo actualizar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se necesitan permisos para acceder a las imágenes.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const newUri = result.assets[0].uri;
      const imageBase64 = await FileSystem.readAsStringAsync(newUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImagen(imageBase64);
      setImagenVisual(`data:image/png;base64,${imageBase64}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Actualizar Producto</Text>
      
      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      
      <TextInput
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={[styles.input, styles.textArea]}
        multiline
      />
      
      <TextInput
        placeholder="Cantidad"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        style={styles.input}
      />
      
      <TextInput
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        style={styles.input}
      />
      
      <TouchableOpacity style={styles.button} onPress={seleccionarImagen}>
        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {imagenVisual ? (
        <Image source={{ uri: imagenVisual }} style={styles.image} />
      ) : (
        <Text style={styles.imagePlaceholder}>No hay imagen seleccionada</Text>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={actualizarProducto}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Actualizar Producto</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 15,
  },
  imagePlaceholder: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 15,
  },
});

export default ProductoList;
