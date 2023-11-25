package db

import (
	"context"

	"github.com/agambondan/islamic-explorer/app/config"
	"github.com/go-redis/redis/v8"
)

type RedisService struct {
	Client *redis.Client
}

func NewRedisDB(env *config.Environment) (*RedisService, error) {
	redisService := RedisService{}
	redisService.Client = redis.NewClient(&redis.Options{
		Addr:     *env.RedisHost + ":" + *env.RedisPort,
		Password: *env.RedisPassword,
		DB:       *env.RedisIndex,
	})
	_, err := redisService.Client.Ping(context.Background()).Result()
	if err != nil {
		return nil, err
	}
	return &redisService, nil
}
