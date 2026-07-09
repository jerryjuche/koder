import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "./api";
import { clearCache } from "./cache";

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
        setNotifications(res.data.slice(0, 10)); // Limit to 10 most recent
        setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  const invalidateCache = () => {
    clearCache("/notifications");
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetchApi(`/notifications/${id}/read`, { method: "POST" });
      if (res.success) {
        invalidateCache();
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetchApi("/notifications/read-all", { method: "POST" });
      if (res.success) {
        invalidateCache();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    Promise.resolve().then(() => fetchNotifications());

    let timeoutId: NodeJS.Timeout;
    
    const scheduleNext = () => {
      const delay = document.visibilityState === "visible" ? 15000 : 60000;
      timeoutId = setTimeout(() => {
        fetchNotifications().finally(() => {
          scheduleNext();
        });
      }, delay);
    };

    scheduleNext();

    // Fetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
        clearTimeout(timeoutId);
        scheduleNext();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications };
}
