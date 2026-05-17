package lib

import (
	"testing"
	"time"
)

func TestCacheServiceTTLForContentPrefixes(t *testing.T) {
	cache := &CacheService{}
	staticTTL := time.Duration(CacheTTLStatic) * time.Second
	dynamicTTL := time.Duration(CacheTTLDynamic) * time.Second

	for _, key := range []string{
		"asbabun-nuzul:all:page:0:size:20",
		"history:slug:perang-badar",
		"tokoh-tarikh:id:1",
		"jarh-tadil:perawi:1",
	} {
		if got := cache.ttlForKey(key); got != staticTTL {
			t.Fatalf("expected static ttl for %s, got %s", key, got)
		}
	}

	if got := cache.ttlForKey("forum:questions:page:1:limit:20"); got != dynamicTTL {
		t.Fatalf("expected dynamic ttl for forum key, got %s", got)
	}
}
