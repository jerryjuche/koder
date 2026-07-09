package broker

import (
	"testing"
	"time"
)

func TestNew(t *testing.T) {
	b := New()
	if b == nil {
		t.Fatal("New() returned nil")
	}
}

func TestSubscribe_ReturnsUniqueIDs(t *testing.T) {
	b := New()
	id1, ch1 := b.Subscribe()
	id2, ch2 := b.Subscribe()

	if id1 == id2 {
		t.Error("expected unique subscription IDs")
	}
	if ch1 == nil {
		t.Error("expected non-nil channel")
	}
	if ch2 == nil {
		t.Error("expected non-nil channel")
	}
}

func TestPublish_DeliversToSubscribers(t *testing.T) {
	b := New()
	_, ch := b.Subscribe()

	event := Event{Type: "test.event", Data: "hello"}
	b.Publish(event)

	select {
	case received := <-ch:
		if received.Type != event.Type {
			t.Errorf("expected type %q, got %q", event.Type, received.Type)
		}
		if received.Data != "hello" {
			t.Errorf("expected data 'hello', got %v", received.Data)
		}
		if received.Time.IsZero() {
			t.Error("expected non-zero timestamp")
		}
	case <-time.After(100 * time.Millisecond):
		t.Fatal("timed out waiting for event")
	}
}

func TestPublish_DeliversToAllSubscribers(t *testing.T) {
	b := New()
	_, ch1 := b.Subscribe()
	_, ch2 := b.Subscribe()

	b.Publish(Event{Type: "broadcast"})

	for i, ch := range []<-chan Event{ch1, ch2} {
		select {
		case <-ch:
		case <-time.After(100 * time.Millisecond):
			t.Errorf("subscriber %d did not receive event", i+1)
		}
	}
}

func TestPublishEvent(t *testing.T) {
	b := New()
	_, ch := b.Subscribe()

	b.PublishEvent("test.type", map[string]int{"key": 42})

	select {
	case received := <-ch:
		if received.Type != "test.type" {
			t.Errorf("expected type 'test.type', got %q", received.Type)
		}
	case <-time.After(100 * time.Millisecond):
		t.Fatal("timed out waiting for PublishEvent")
	}
}

func TestUnsubscribe_RemovesClient(t *testing.T) {
	b := New()
	id, ch := b.Subscribe()
	b.Unsubscribe(id)

	// Publishing should not panic and should not deliver to unsubscribed client
	b.Publish(Event{Type: "should.not.deliver"})

	select {
	case _, ok := <-ch:
		if ok {
			t.Error("channel should be closed after unsubscribe")
		}
	default:
	}
}

func TestUnsubscribe_NonExistent(t *testing.T) {
	b := New()
	// Should not panic
	b.Unsubscribe("non-existent-id")
}

func TestPublish_SlowClientMissesEvent(t *testing.T) {
	b := New()
	_, ch := b.Subscribe()

	// Fill the buffer (buffer is 32)
	for i := 0; i < 33; i++ {
		b.Publish(Event{Type: "overflow"})
	}

	// Drain the channel, first 32 should be received
	count := 0
	for i := 0; i < 32; i++ {
		select {
		case <-ch:
			count++
		case <-time.After(100 * time.Millisecond):
			t.Fatalf("only received %d events", count)
		}
	}

	if count != 32 {
		t.Errorf("expected 32 events, got %d", count)
	}
}

func TestEvent_TimeIsSetOnPublish(t *testing.T) {
	b := New()
	_, ch := b.Subscribe()

	before := time.Now()
	event := Event{Type: "timed"}
	b.Publish(event)
	after := time.Now()

	select {
	case received := <-ch:
		if received.Time.Before(before) || received.Time.After(after) {
			t.Error("event time should be between publish start and end")
		}
	case <-time.After(100 * time.Millisecond):
		t.Fatal("timed out")
	}
}

func TestConcurrentPublishSubscribe(t *testing.T) {
	b := New()

	// Subscribe then publish from multiple goroutines
	done := make(chan struct{}, 10)
	for i := 0; i < 10; i++ {
		go func() {
			id, ch := b.Subscribe()
			defer b.Unsubscribe(id)
			for j := 0; j < 5; j++ {
				select {
				case <-ch:
				case <-time.After(100 * time.Millisecond):
					t.Error("timed out")
					return
				}
			}
			done <- struct{}{}
		}()
	}

	time.Sleep(10 * time.Millisecond) // let subscribers register
	for i := 0; i < 5; i++ {
		b.Publish(Event{Type: "concurrent"})
	}

	for i := 0; i < 10; i++ {
		select {
		case <-done:
		case <-time.After(500 * time.Millisecond):
			t.Fatal("timed out waiting for goroutines")
		}
	}
}
