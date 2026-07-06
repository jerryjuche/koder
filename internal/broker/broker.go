package broker

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

// Event represents a real-time event published to all connected clients.
type Event struct {
	Type string      `json:"type"`
	Data interface{} `json:"data,omitempty"`
	Time time.Time   `json:"time"`
}

// Broker manages WebSocket event subscriptions.
type Broker struct {
	mu      sync.RWMutex
	clients map[string]chan Event
}

// New creates a new Broker.
func New() *Broker {
	return &Broker{
		clients: make(map[string]chan Event),
	}
}

// Subscribe adds a client and returns a unique ID and event channel.
// The caller MUST call Unsubscribe with the returned ID when done.
func (b *Broker) Subscribe() (string, <-chan Event) {
	b.mu.Lock()
	defer b.mu.Unlock()
	id := uuid.New().String()
	ch := make(chan Event, 32)
	b.clients[id] = ch
	return id, ch
}

// Unsubscribe removes a client by ID and closes its channel.
func (b *Broker) Unsubscribe(id string) {
	b.mu.Lock()
	defer b.mu.Unlock()
	if ch, ok := b.clients[id]; ok {
		close(ch)
		delete(b.clients, id)
	}
}

// Publish sends an event to all connected clients.
// Slow clients that don't read fast enough will miss the event (non-blocking send).
func (b *Broker) Publish(event Event) {
	event.Time = time.Now()
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, ch := range b.clients {
		select {
		case ch <- event:
		default:
		}
	}
}

// PublishEvent is a convenience wrapper for publishing ad-hoc events.
func (b *Broker) PublishEvent(eventType string, data interface{}) {
	b.Publish(Event{Type: eventType, Data: data, Time: time.Now()})
}
