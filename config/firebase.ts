import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getDocs, getFirestore } from 'firebase/firestore';

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

const fetchCourses = async (programId: 'BSCS' | 'BSIS' | 'BSIT') => {
  const snap = await getDocs(collection(db, 'programs', programId, 'courses'));
  return snap.docs.map(doc => doc.data() as Course);
};