import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "./api";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetchApi<Notification[]>("/notifications", { method: "GET" });
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetchApi(`/notifications/${id}/read`, { method: "POST" });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    Promise.resolve().then(() => fetchNotifications());

    // Polling setup (every 30s)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 30000);

    // Fetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, markAsRead, fetchNotifications };
}
