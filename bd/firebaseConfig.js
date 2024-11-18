import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCd4H3W9E3PJecDmY5CU35_yFUiSzLH91c",
  authDomain: "bodega-8aa33.firebaseapp.com",
  projectId: "bodega-8aa33",
  storageBucket: "bodega-8aa33.appspot.com", // Correcto .appspot.com
  messagingSenderId: "864552528657",
  appId: "1:864552528657:web:43f1a52cbf60d5f2b17ab0"
};

// Inicializar Firebase solo si no está inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Inicializar Firestore y Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
