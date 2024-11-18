import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Image, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { db } from "../bd/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';

const ProductoList = ({ route, navigation }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState("");
  const [imagenVisual, setImagenVisual] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { id } = route.params?.productos || {}; // ID del producto a cargar

  useEffect(() => {
    if (id) {
      cargarProducto();
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      const docRef = doc(db, 'Productos', id);
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
        Alert.alert('Error', 'Producto no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al cargar producto: ', error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    }
  };

  const actualizarProducto = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const productoRef = doc(db, 'Productos', id);
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
      console.log("Error al actualizar el producto:", error);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesitan permisos para acceder a las imágenes.');
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
        style={styles.input}
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
      <Button title="Seleccionar Imagen" onPress={seleccionarImagen} />

      {imagenVisual ? (
        <Image
          source={{ uri: imagenVisual }}
          style={styles.image}
        />
      ) : (
        <Text>No hay imagen seleccionada</Text>
      )}
      
      <Button title="Actualizar Producto" onPress={actualizarProducto} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 20,
  },
});

export default ProductoList;
