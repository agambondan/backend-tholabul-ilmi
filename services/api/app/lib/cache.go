package lib

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	cacheHits = promauto.NewCounter(prometheus.CounterOpts{
		Name: "api_cache_hits_total",
		Help: "Total number of cache hits",
	})
	cacheMisses = promauto.NewCounter(prometheus.CounterOpts{
		Name: "api_cache_misses_total",
		Help: "Total number of cache misses",
	})
)

const (
	CacheTTLDefault = 60
	CacheTTLStatic  = 300
	CacheTTLDynamic = 30
)

var cacheTTLByPrefix = map[string]int{
	"surah:":    CacheTTLStatic,
	"asmaul:":   CacheTTLStatic,
	"doa:":      CacheTTLStatic,
	"dzikir:":   CacheTTLStatic,
	"fiqh:":     CacheTTLStatic,
	"tahlil:":   CacheTTLStatic,
	"manasik:":  CacheTTLStatic,
	"books:":    CacheTTLStatic,
	"themes:":   CacheTTLStatic,
	"chapters:": CacheTTLStatic,
	"perawi:":   CacheTTLStatic,
	"tafsir:":   CacheTTLStatic,
	"siroh:":    CacheTTLStatic,
	"kajian:":   CacheTTLStatic,
	"hijri:":    CacheTTLStatic,
}

type CacheService struct {
	client *redis.Client
	ttl    time.Duration
	ctx    context.Context
}

func NewCacheService(client *redis.Client, ttlSeconds int64) *CacheService {
	if client == nil {
		return nil
	}
	ttl := time.Duration(ttlSeconds) * time.Second
	if ttl <= 0 {
		ttl = 60 * time.Second
	}
	return &CacheService{
		client: client,
		ttl:    ttl,
		ctx:    context.Background(),
	}
}

func (c *CacheService) ttlForKey(key string) time.Duration {
	for prefix, ttl := range cacheTTLByPrefix {
		if strings.HasPrefix(key, prefix) {
			return time.Duration(ttl) * time.Second
		}
	}
	return time.Duration(CacheTTLDefault) * time.Second
}

func (c *CacheService) Get(key string, dest interface{}) error {
	if c == nil {
		return redis.Nil
	}
	val, err := c.client.Get(c.ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			cacheMisses.Inc()
		}
		return err
	}
	cacheHits.Inc()
	return json.Unmarshal(val, dest)
}

func (c *CacheService) Set(key string, value interface{}) error {
	if c == nil {
		return nil
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.client.Set(c.ctx, key, data, c.ttl).Err()
}

func (c *CacheService) SetTTL(key string, value interface{}, ttl time.Duration) error {
	if c == nil {
		return nil
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.client.Set(c.ctx, key, data, ttl).Err()
}

func (c *CacheService) Del(keys ...string) error {
	if c == nil {
		return nil
	}
	return c.client.Del(c.ctx, keys...).Err()
}

func (c *CacheService) Remember(key string, dest interface{}, fn func() (interface{}, error)) error {
	if c == nil {
		data, err := fn()
		if err != nil {
			return err
		}
		b, _ := json.Marshal(data)
		return json.Unmarshal(b, dest)
	}

	if err := c.Get(key, dest); err == nil {
		return nil
	}

	data, err := fn()
	if err != nil {
		return err
	}

	b, _ := json.Marshal(data)
	if err := c.SetTTL(key, data, c.ttlForKey(key)); err != nil {
		return err
	}

	return json.Unmarshal(b, dest)
}

func (c *CacheService) Invalidate(patterns ...string) error {
	if c == nil {
		return nil
	}
	for _, pattern := range patterns {
		iter := c.client.Scan(c.ctx, 0, pattern, 0).Iterator()
		for iter.Next(c.ctx) {
			c.client.Del(c.ctx, iter.Val())
		}
		if err := iter.Err(); err != nil {
			return err
		}
	}
	return nil
}
