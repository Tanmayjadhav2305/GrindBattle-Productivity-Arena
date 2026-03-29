import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "VITE_FIREBASE_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bold-upgrade-477115-v9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bold-upgrade-477115-v9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bold-upgrade-477115-v9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "729787413309",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:729787413309:web:af2ff02bb2993c97e98b54"
};

// Also ensure VAPID key has a default
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "VITE_FIREBASE_VAPID_KEY_HERE";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    // 1. Explicitly check/request for permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // 2. Register service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // 3. Get FCM Token
      const currentToken = await getToken(messaging, { 
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
    console.error('❌ Messaging Error:', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
