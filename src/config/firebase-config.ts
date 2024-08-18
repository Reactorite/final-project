// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBi8kkrnHChNChz-lg8WKAhhfw_Aea2UEE",
  authDomain: "iquiz-343e7.firebaseapp.com",
  projectId: "iquiz-343e7",
  storageBucket: "iquiz-343e7.appspot.com",
  messagingSenderId: "728109302465",
  appId: "1:728109302465:web:3779fde58c9cf101d84a40",
  databaseURL: "https://iquiz-343e7-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// the Firebase authentication handler
export const auth = getAuth(app);
// the Realtime Database handler
export const db = getDatabase(app);
// the Firebase Storage
export const storage = getStorage(app);