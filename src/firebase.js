import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAkpUoxNVsIy_q0dC5zBwFY9-vDyZXm0eQ",
  authDomain: "chat-rage.firebaseapp.com",
  databaseURL: "https://chat-rage.firebaseio.com",
  projectId: "chat-rage",
  storageBucket: "chat-rage.appspot.com",
  messagingSenderId: "541953838601",
  appId: "1:541953838601:web:750dfd279ee1599d5c72d8",
  measurementId: "G-5SQ15ML3YT",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
