import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJp4jK1s-oRzONIQxP3X7L7f9SyA7HcVk",
  authDomain: "scrollerapp-73cbc.firebaseapp.com",
  projectId: "scrollerapp-73cbc",
  storageBucket: "scrollerapp-73cbc.appspot.com",
  appId: "1:255017727911:ios:af799ff04e80cc67f7a882",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };