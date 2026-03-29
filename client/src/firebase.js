import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "VITE_FIREBASE_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bold-upgrade-477115-v9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bold-upgrade-477115-v9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bold-upgrade-477115-v9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "729787413309",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:729787413309:web:af2ff02bb2993c97e98b54"
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "VITE_FIREBASE_VAPID_KEY_HERE";

const app = initializeApp(firebaseConfig);

// Safe messaging initialization
let messaging = null;

const initMessaging = async () => {
  if (messaging) return messaging;
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    }
    console.warn('Firebase Messaging is not supported in this browser.');
    return null;
  } catch (err) {
    console.warn('❌ Failed to initialize Firebase Messaging:', err);
    return null;
  }
};

export const requestForToken = async () => {
  try {
    const msg = await initMessaging();
    if (!msg) return null;

    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const currentToken = await getToken(msg, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        console.log('✅ FCM Token generated:', currentToken);
        return currentToken;
      }
    }
    return null;
  } catch (err) {
    console.error('❌ FCM Request Error:', err);
    return null;
  }
};

export const onMessageListener = async () => {
  const msg = await initMessaging();
  if (!msg) return null;

  return new Promise((resolve) => {
    onMessage(msg, (payload) => {
      resolve(payload);
    });
  });
};

export { app };
