import { useState } from 'react';

import { ApiRoutes, urlWithArgs } from '@/api-types';
import { axiosInstance } from '@/axios';
import { Button } from '@/components/primitives';
import { usePushNotifications } from '@/hooks/usePushNotifications.ts';

export function PushNotification() {
  const { permission, isPending, requestPermission, unsubscribe } = usePushNotifications();
  const [isSendingTest, setIsSendingTest] = useState(false);

  const sendTest = async () => {
    setIsSendingTest(true);
    try {
      const uid = localStorage.getItem('push_subscription_uid');
      if (!uid) return;
      await axiosInstance.post(urlWithArgs(ApiRoutes.PUSH_SUBSCRIPTION_DETAIL, { subscription_uid: uid }));
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {permission === 'unsupported' && (
        <p className="text-sm text-gray-500">
          Push notifications aren't supported in this browser. Try opening Splinter from your home screen or a
          supported browser.
        </p>
      )}
      {permission === 'denied' && (
        <p className="text-sm text-gray-500">
          You've blocked notifications for Splinter. To re-enable, update the notification permission for this
          site in your browser settings, then reload the page.
        </p>
      )}
      {permission === 'default' && (
        <Button
          variant="outlined"
          isPending={isPending}
          onPress={requestPermission}
        >
          Enable push notifications
        </Button>
      )}
      {permission === 'granted' && (
        <>
          <Button
            variant="outlined"
            isPending={isSendingTest}
            onPress={sendTest}
          >
            Send test notification
          </Button>
          <Button
            variant="outlined"
            color="danger"
            isPending={isPending}
            onPress={unsubscribe}
          >
            Disable notifications
          </Button>
        </>
      )}
    </div>
  );
}
