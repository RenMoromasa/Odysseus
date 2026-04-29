import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBeMK3VvE-1H0GeoCCgHdgZt7gYKUq00eM',
  authDomain: 'odysseus-7cf4c.firebaseapp.com',
  projectId: 'odysseus-7cf4c',
  storageBucket: 'odysseus-7cf4c.firebasestorage.app',
  messagingSenderId: '918339848854',
  appId: '1:918339848854:web:31f63f30b9b198a21a50b7',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export default app;
