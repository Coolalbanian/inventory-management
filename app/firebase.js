// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCa31VTllTcVByitGwkdS4LAIgXLQIr8c",
  authDomain: "inventory-management-app-b4a24.firebaseapp.com",
  projectId: "inventory-management-app-b4a24",
  storageBucket: "inventory-management-app-b4a24.appspot.com",
  messagingSenderId: "105927147470",
  appId: "1:105927147470:web:38a5a66fc516bd094ab59f",
  measurementId: "G-0WKW5JGZ06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const firestore = getFirestore(app);

export { firestore };

