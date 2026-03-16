import { useEffect } from 'react';
import axios from 'axios';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushNotifications = (isAdmin: boolean) => {
    useEffect(() => {
        if (!isAdmin || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        const registerPush = async () => {
            try {
                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.warn('Push notification permission denied');
                    return;
                }

                // Register service worker
                const register = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                await navigator.serviceWorker.ready;

                // Get VAPID public key from backend
                const { data: { publicKey } } = await axios.get('/api/push/vapidPublicKey');
                const convertedVapidKey = urlBase64ToUint8Array(publicKey);

                // Subscribe to push notifications
                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });

                // Send subscription to backend
                await axios.post('/api/push/subscribe', subscription);
                console.log('Push notification subscription successful');

            } catch (error) {
                console.error('Push notification registration failed:', error);
            }
        };

        registerPush();
    }, [isAdmin]);
};
