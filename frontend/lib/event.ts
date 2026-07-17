import { useEffect, useRef, useCallback } from 'react';

const WS_RECONNECT_BASE = 1000;
const WS_RECONNECT_MAX = 30000;

export type EventType =
  | 'problem.updated'
  | 'problem.publish-all'
  | 'broadcast.created'
  | 'broadcast.updated'
  | 'broadcast.deleted'
  | 'feedback.submitted'
  | 'lesson.completed'
  | 'user.xp.updated'
  | 'progress.updated';

type EventCallback = (data: any) => void;

const subscribers = new Map<EventType, Set<EventCallback>>();

function getWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const proto = base.startsWith('https') ? 'wss' : 'ws';
  return `${proto}://${base.replace(/^https?:\/\//, '')}/ws`;
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

function connect() {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
    return;
  }

  try {
    ws = new WebSocket(getWsUrl());

    ws.onopen = () => {
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type && subscribers.has(msg.type)) {
          const cbs = subscribers.get(msg.type);
          if (cbs) {
            cbs.forEach((cb) => {
              try { cb(msg.data); } catch {}
            });
          }
        }
      } catch {}
    };

    ws.onclose = () => {
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch {
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  const delay = Math.min(
    WS_RECONNECT_BASE * Math.pow(2, reconnectAttempts),
    WS_RECONNECT_MAX,
  );
  reconnectAttempts++;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function ensureConnected() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connect();
  }
}

export function subscribe(type: EventType, callback: EventCallback): () => void {
  if (!subscribers.has(type)) {
    subscribers.set(type, new Set());
  }
  subscribers.get(type)!.add(callback);
  ensureConnected();

  return () => {
    const set = subscribers.get(type);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        subscribers.delete(type);
      }
    }
  };
}

export function useWebSocket(
  handlers: Partial<Record<EventType, EventCallback>>,
  deps: any[] = [],
) {
  const handlerRef = useRef(handlers);

  useEffect(() => {
    handlerRef.current = handlers;
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    for (const [type, callback] of Object.entries(handlers)) {
      if (callback) {
        const unsub = subscribe(
          type as EventType,
          callback as EventCallback,
        );
        unsubs.push(unsub);
      }
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
