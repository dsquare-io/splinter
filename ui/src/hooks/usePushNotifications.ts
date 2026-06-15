import { useCallback, useState } from 'react';

import { ApiRoutes, urlWithArgs } from '@/api-types';
import { axiosInstance } from '@/axios';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

const SUBSCRIPTION_UID_KEY = 'push_subscription_uid';

export type PushPermission = 'unsupported' | 'default' | 'granted' | 'denied';

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>(() => {
    if (!('PushManager' in window) || !('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    // 'granted' only when subscription is actually registered
    if (Notification.permission === 'granted' && localStorage.getItem(SUBSCRIPTION_UID_KEY)) return 'granted';
    return 'default';
  });
  const [isPending, setIsPending] = useState(false);

  const requestPermission = useCallback(async () => {
    if (!('PushManager' in window) || !('Notification' in window)) return;
    setIsPending(true);
    try {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        setPermission(result as PushPermission);
        return;
      }
      await registerSubscription();
      setPermission('granted');
    } catch {
      setPermission('default');
    } finally {
      setIsPending(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsPending(true);
    try {
      const uid = localStorage.getItem(SUBSCRIPTION_UID_KEY);
      if (uid) {
        await axiosInstance.delete(
          urlWithArgs(ApiRoutes.PUSH_SUBSCRIPTION_DETAIL, { subscription_uid: uid })
        );
        localStorage.removeItem(SUBSCRIPTION_UID_KEY);
      }
      const sw = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.getSubscription();
      await sub?.unsubscribe();
      setPermission('default');
    } finally {
      setIsPending(false);
    }
  }, []);

  return { permission, isPending, requestPermission, unsubscribe };
}

async function subscribe(
  pushManager: PushManager,
  applicationServerKey: Uint8Array<ArrayBuffer>
): Promise<PushSubscription> {
  const existing = await pushManager.getSubscription();
  return existing ?? (await pushManager.subscribe({ userVisibleOnly: true, applicationServerKey }));
}

async function registerSubscription(): Promise<void> {
  const sw = await navigator.serviceWorker.ready;

  const { data: vapid } = await axiosInstance.get<{ publicKey: string }>(ApiRoutes.VAPID_PUBLIC_KEY);
  if (!vapid.publicKey) return;

  const applicationServerKey = urlBase64ToUint8Array(vapid.publicKey);

  const sub = await subscribe(sw.pushManager, applicationServerKey);

  const json = sub.toJSON();
  const { data } = await axiosInstance.post<{ uid: string }>(ApiRoutes.PUSH_SUBSCRIPTION, {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
  });

  localStorage.setItem(SUBSCRIPTION_UID_KEY, data.uid);
}
