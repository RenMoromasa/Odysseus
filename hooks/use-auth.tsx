import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────
export type UserProfile = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  idNumber: string;
  program: string;
  yearLevel: number;
  createdAt: string;
  isOnboarded?: boolean;
  completedCourses?: string[];
  studentType?: string;
};

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    idNumber: string;
    password: string;
    program: string;
    yearLevel: number;
  }) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          const profile = profileDoc.exists()
            ? (profileDoc.data() as UserProfile)
            : null;
          setState({ user, profile, loading: false, error: null });
        } catch {
          setState({ user, profile: null, loading: false, error: null });
        }
      } else {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return unsubscribe;
  }, []);

  // ── Login ──
  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setState((s) => ({ ...s, error: message }));
      throw new Error(message);
    }
  };

  // ── Register ──
  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    idNumber: string;
    password: string;
    program: string;
    yearLevel: number;
  }) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Save profile to Firestore
      const profile: UserProfile = {
        uid: cred.user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        idNumber: data.idNumber,
        program: data.program,
        yearLevel: data.yearLevel,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), profile);
      setState((s) => ({ ...s, profile }));
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setState((s) => ({ ...s, error: message }));
      throw new Error(message);
    }
  };

// ── Update Profile ──
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      throw new Error("No user logged in");
    }
    setState((s) => ({ ...s, error: null }));
    try {
      const userDocRef = doc(db, "users", state.user.uid);
      await updateDoc(userDocRef, updates);
      // Update local state
      setState((s) => ({
        ...s,
        profile: s.profile ? { ...s.profile, ...updates } : null,
      }));
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setState((s) => ({ ...s, error: message }));
      throw new Error(message);
    }
  };

  // ── Logout ──
  const logout = async () => {
    await signOut(auth);
  };

  // ── Reset Password ──
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      throw new Error(message);
    }
  };

  // ── Clear Error ──
  const clearError = () => {
    setState((s) => ({ ...s, error: null }));
  };

return (
    <AuthContext.Provider
      value={{ ...state, login, register, updateProfile, logout, resetPassword, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// ─── Friendly error messages ─────────────────────────────────────────────────
function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
