import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCxB55AgzirsJ4Y1OtWYVFvf7JGdzvGSIc",
  authDomain: "cloud-7f6f6.firebaseapp.com",
  projectId: "cloud-7f6f6",
  storageBucket: "cloud-7f6f6.appspot.com",

  messagingSenderId: "516056743193",
  appId: "1:516056743193:web:a9ad880f722965b7f55988"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

export default app;