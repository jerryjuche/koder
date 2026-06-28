package api

import (
	"context"
	"sync"
	"time"
)

type cacheEntry[T any] struct {
	data    T
	expires time.Time
}

type userCache[T any] struct {
	mu       sync.RWMutex
	entries  map[string]cacheEntry[T]
	ttl      time.Duration
}

func newUserCache[T any](ttl time.Duration) *userCache[T] {
	c := &userCache[T]{
		entries: make(map[string]cacheEntry[T]),
		ttl:     ttl,
	}
	// Start cleanup goroutine
	go func() {
		ticker := time.NewTicker(ttl)
		defer ticker.Stop()
		for range ticker.C {
			c.mu.Lock()
			now := time.Now()
			for k, v := range c.entries {
				if now.After(v.expires) {
					delete(c.entries, k)
				}
			}
			c.mu.Unlock()
		}
	}()
	return c
}

func (c *userCache[T]) get(key string) (T, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	entry, ok := c.entries[key]
	if !ok || time.Now().After(entry.expires) {
		var zero T
		return zero, false
	}
	return entry.data, true
}

func (c *userCache[T]) set(key string, data T) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.entries[key] = cacheEntry[T]{
		data:    data,
		expires: time.Now().Add(c.ttl),
	}
}

func (c *userCache[T]) invalidate(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.entries, key)
}

// Global caches for user and profile data
var (
	profileCache = newUserCache[profileResponse](30 * time.Second)
	userCacheMap = newUserCache[meResponse](30 * time.Second)
)

var cacheCtxKey = struct{}{}

// Caching helper functions used by handlers
func cacheProfile(ctx context.Context, userID string, data profileResponse) {
	profileCache.set(userID, data)
}

func getCachedProfile(ctx context.Context, userID string) (profileResponse, bool) {
	return profileCache.get(userID)
}

func cacheUser(ctx context.Context, userID string, data meResponse) {
	userCacheMap.set(userID, data)
}

func getCachedUser(ctx context.Context, userID string) (meResponse, bool) {
	return userCacheMap.get(userID)
}

// InvalidateUserCache clears cached data for a user (called on profile updates)
func InvalidateUserCache(userID string) {
	profileCache.invalidate(userID)
	userCacheMap.invalidate(userID)
}
