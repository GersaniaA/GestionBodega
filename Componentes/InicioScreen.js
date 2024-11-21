import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Button, Alert, StyleSheet, Modal, TextInput } from "react-native";
import { db } from "../bd/firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
 

const InicioScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState("");

  const fetchProductos = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, "Productos"));
      setProductos(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error al obtener los productos: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProductos(); // Llama a la función para obtener los productos
    }, [])
  );
  

  const handleDelete = (id) => {
    Alert.alert("Confirmar", "¿Estás seguro de que quieres eliminar este producto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Productos", id));
            setProductos(productos.filter(producto => producto.id !== id));
          } catch (error) {
            console.error("Error al eliminar el producto: ", error);
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
      
      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setImagen(uri);
      } else {
        console.log("No se seleccionó ninguna imagen o fue cancelado");
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const handleAddProducto = async () => {
    if (!nombre || !descripcion || !cantidad || !precio || !imagen) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      const imageBase64 = await FileSystem.readAsStringAsync(imagen, { encoding: FileSystem.EncodingType.Base64 });
      
      await addDoc(collection(db, "Productos"), {
        nombre,
        descripcion,
        cantidad,
        precio,
        imagen: imageBase64,
      });
  
      setModalVisible(false);
      setNombre("");
      setDescripcion("");
      setCantidad("");
      setPrecio("");
      setImagen("");
      fetchProductos();
    } catch (error) {
      console.error("Error al agregar producto:", error);
      Alert.alert("Error", `Hubo un problema al agregar el producto: ${error.message || error.code}`);
    }
  };

  const renderProducto = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `data:image/png;base64,${item.imagen}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text>{item.descripcion}</Text>
        <Text>Cantidad: {item.cantidad}</Text>
        <Text>Precio: ${item.precio}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("ProductoList", { productos: item })} style={styles.iconButton}>
            <Icon name="edit" size={20} color="#007BFF" />
            <Text style={styles.iconButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
            <Icon name="trash" size={20} color="red" />
            <Text style={styles.iconButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={renderProducto}
      />

      <TouchableOpacity
        style={styles.floatingButtonStats}
        onPress={() => navigation.navigate("EstadisticasScreen")}
      >
        <Text style={styles.floatingButtonText}>📊</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.floatingButtonAdd}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Producto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del Producto"
              placeholderTextColor="#aaa"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              placeholderTextColor="#aaa"
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              placeholderTextColor="#aaa"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              placeholderTextColor="#aaa"
              value={precio}
              onChangeText={setPrecio}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text style={styles.imagePickerText}>Seleccionar Imagen</Text>
            </TouchableOpacity>

            {imagen ? (
              <Image source={{ uri: imagen }} style={styles.selectedImage} />
            ) : (
              <Text style={styles.imagePlaceholder}>No hay imagen seleccionada</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddProducto}
              >
                <Text style={styles.buttonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  floatingButtonStats: {
    position: "absolute",
    right: 20,
    bottom: 90,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonAdd: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#007BFF",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    color: "#333",
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    alignSelf: "center",
  },
  imagePlaceholder: {
    textAlign: "center",
    color: "#888",
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF6B6B",
  },
  addButton: {
    backgroundColor: "#28A745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#007BFF",
  },

  imagePickerButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
},
imagePlaceholder: {
  textAlign: "center",
  color: "#888",
  fontStyle: "italic",
},
});

export default InicioScreen;
