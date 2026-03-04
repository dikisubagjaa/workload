// src/components/notification/NotificationBell.js
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import useFcmToken from '@/components/hook/useFcmToken';
import DrawerNotification from '@/components/utils/DrawerNotification';

async function fetchUnread(userId) {
  const url = userId
    ? `/api/notification/unread-count?userId=${userId}`
    : `/api/notification/unread-count`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // API baru mengembalikan { unread }, fallback ke { count } jika masih versi lama
  if (typeof data?.unread === 'number') return data.unread;
  if (typeof data?.count === 'number') return data.count;
  return 0;
}

export default function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const unread = await fetchUnread(userId);
      setCount(unread ?? 0);
    } catch {
      // silent
    }
  }, [userId]);

  console.log("ddd", userId);
  // Daftarkan FCM; saat ada push di foreground, refresh badge
  useFcmToken({
    userId,
    onForegroundMessage: () => {
      refresh();
    },
  });

  // Ambil nilai awal + refresh saat window fokus (fallback ringan, tanpa interval)
  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const onChanged = () => {
    // Dipanggil dari DrawerNotification saat mark as read / read all
    refresh();
  };

  return (
    <>
      <Badge count={count} overflowCount={99}>
        <Button
          aria-label="Notifications"
          shape="circle"
          icon={<BellOutlined />}
          onClick={() => setOpen(true)}
        />
      </Badge>

      <DrawerNotification
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        onChanged={onChanged}
      />
    </>
  );
}
