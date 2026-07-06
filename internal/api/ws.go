package api

import (
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/jerryjuche/koder/internal/broker"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// WSHandler handles WebSocket connections for live events.
type WSHandler struct {
	broker *broker.Broker
}

// NewWSHandler creates a new WSHandler.
func NewWSHandler(b *broker.Broker) *WSHandler {
	return &WSHandler{broker: b}
}

func (h *WSHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("ws: upgrade failed", "error", err)
		return
	}

	id, ch := h.broker.Subscribe()
	defer h.broker.Unsubscribe(id)

	// Write deadline to detect stale connections
	var mu sync.Mutex
	write := func(msg interface{}) error {
		mu.Lock()
		defer mu.Unlock()
		conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		return conn.WriteJSON(msg)
	}

	// Read pump — just detects client disconnect
	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}()

	// Write pump — forwards broker events to the WebSocket
	for {
		select {
		case event, ok := <-ch:
			if !ok {
				return
			}
			if err := write(event); err != nil {
				return
			}
		case <-done:
			return
		case <-r.Context().Done():
			return
		}
	}
}
