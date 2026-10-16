import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';
import { User, Listing, ListingReport, VerificationRequest } from '../types/listing.ts';

// Extract Firebase configuration
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  appId: rawConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId,
  storageBucket: rawConfig.storageBucket,
  messagingSenderId: rawConfig.messagingSenderId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to browser language (Arabic for Egyptian users)

// Initialize Firestore (with databaseId support)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Validates connection to Firestore at app startup (Mandatory skill check)
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Connected to Cloud Firestore successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline/cache mode.');
    }
  }
}

/**
 * Converts local Egyptian phone format to international E.164 (+201xxxxxxxxx)
 */
export function formatEgyptianPhoneToE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('01') && digits.length === 11) {
    return `+20${digits.substring(1)}`;
  }
  if (digits.startsWith('201') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith('1') && digits.length === 10) {
    return `+20${digits}`;
  }
  if (rawPhone.startsWith('+')) {
    return rawPhone;
  }
  return `+20${digits}`;
}

/**
 * Validates if the phone number is a valid Egyptian mobile number (010, 011, 012, 015)
 */
export function isValidEgyptianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('20')) {
    return /^201[0125]\d{8}$/.test(digits);
  }
  return /^01[0125]\d{8}$/.test(digits);
}

/**
 * Deterministic internal phone identifier for Firebase Auth password security
 */
export function phoneToInternalEmail(e164Phone: string): string {
  const sanitized = e164Phone.replace(/\D/g, '');
  return `phone_${sanitized}@auth.ardak.eg`;
}

// -------------------------------------------------------------
// RECAPTCHA & PHONE AUTHENTICATION (SMS OTP)
// -------------------------------------------------------------

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Initializes invisible or visible RecaptchaVerifier on the specified container
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  // Clear any existing verifier
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // Ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('Recaptcha verified for SMS sending.');
    },
    'expired-callback': () => {
      console.warn('Recaptcha expired. Please try again.');
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Sends real SMS OTP via Firebase Phone Auth
 */
export async function sendFirebasePhoneOtp(
  phone: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const e164Phone = formatEgyptianPhoneToE164(phone);
  const verifier = setupRecaptcha(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, e164Phone, verifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

/**
 * Confirms OTP code and signs the user into Firebase
 */
export async function confirmFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<FirebaseUser> {
  const userCredential = await confirmationResult.confirm(otpCode);
  return userCredential.user;
}

// -------------------------------------------------------------
// FIRESTORE COLLECTIONS & PERSISTENCE
// -------------------------------------------------------------

export const COLLECTIONS = {
  USERS: 'users',
  LISTINGS: 'listings',
  REPORTS: 'reports',
  VERIFICATIONS: 'verifications',
  AUDIT_LOGS: 'audit_logs',
};

/**
 * Persists a user document to Firestore
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(userRef, { ...user, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Failed to save user to Firestore:', error);
  }
}

/**
 * Fetches user profile from Firestore by ID
 */
export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user from Firestore:', error);
    return null;
  }
}

/**
 * Fetches all users from Firestore
 */
export async function getAllUsersFromFirestore(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map((d) => d.data() as User);
  } catch (error) {
    console.error('Failed to get users from Firestore:', error);
    return [];
  }
}

/**
 * Persists a land listing to Firestore
 */
export async function saveListingToFirestore(listing: Listing): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.LISTINGS, listing.id);
    await setDoc(ref, { ...listing, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Failed to save listing to Firestore:', error);
  }
}

/**
 * Deletes a listing from Firestore
 */
export async function deleteListingFromFirestore(listingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LISTINGS, listingId));
  } catch (error) {
    console.error('Failed to delete listing from Firestore:', error);
  }
}

/**
 * Fetches all listings from Firestore
 */
export async function getAllListingsFromFirestore(): Promise<Listing[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LISTINGS));
    return snap.docs.map((d) => d.data() as Listing);
  } catch (error) {
    console.error('Failed to get listings from Firestore:', error);
    return [];
  }
}

/**
 * Saves a report to Firestore
 */
export async function saveReportToFirestore(report: ListingReport): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.REPORTS, report.id);
    await setDoc(ref, { ...report, timestamp: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Failed to save report to Firestore:', error);
  }
}

/**
 * Fetches reports from Firestore
 */
export async function getAllReportsFromFirestore(): Promise<ListingReport[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.REPORTS));
    return snap.docs.map((d) => d.data() as ListingReport);
  } catch (error) {
    console.error('Failed to get reports from Firestore:', error);
    return [];
  }
}

/**
 * Saves a verification request to Firestore
 */
export async function saveVerificationToFirestore(req: VerificationRequest): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.VERIFICATIONS, req.id);
    await setDoc(ref, { ...req, timestamp: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Failed to save verification request to Firestore:', error);
  }
}

/**
 * Fetches all verification requests from Firestore
 */
export async function getAllVerificationsFromFirestore(): Promise<VerificationRequest[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.VERIFICATIONS));
    return snap.docs.map((d) => d.data() as VerificationRequest);
  } catch (error) {
    console.error('Failed to get verification requests from Firestore:', error);
    return [];
  }
}
