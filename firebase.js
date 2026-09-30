import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Colocando as chaves direto aqui, o Firebase nunca iniciará vazio
const firebaseConfig = {
  apiKey: "AIzaSyB-5M4PBd-t3nNtp6bMkRnKT2TJDKfCC3k",
  authDomain: "alivie-project.firebaseapp.com",
  projectId: "alivie-project",
  storageBucket: "alivie-project.firebasestorage.app",
  messagingSenderId: "263866194556",
  appId: "1:263866194556:web:6f1e05e43ec173aa0c87f9",
  measurementId: "G-QRY40YC97E"
};

// Inicializa o app com a configuração local
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
