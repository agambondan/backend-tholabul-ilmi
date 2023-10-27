package config

import (
	"github.com/agambondan/islamic-explorer/app/lib"
	"github.com/spf13/viper"
)

type Environment struct {
	Port            *string
	Endpoint        *string
	Environment     *string
	DBHost          *string
	DBPort          *string
	DBDriver        *string
	DBUser          *string
	DBPassword      *string
	DBName          *string
	DBTablePrefix   *string
	RedisHost       *string
	RedisPort       *string
	RedisPassword   *string
	RedisIndex      *int
	Prefork         *bool
	Aes             *string
	Salt            *string
	CacheTtlSeconds *float64
}

func (env *Environment) Init() *Environment {
	env.Port = lib.Strptr(viper.GetString("PORT"))
	env.Endpoint = lib.Strptr(viper.GetString("ENDPOINT"))
	env.Environment = lib.Strptr(viper.GetString("ENVIRONMENT"))
	env.DBHost = lib.Strptr(viper.GetString("DB_HOST"))
	env.DBPort = lib.Strptr(viper.GetString("DB_PORT"))
	env.DBDriver = lib.Strptr(viper.GetString("DB_DRIVER"))
	env.DBUser = lib.Strptr(viper.GetString("DB_USER"))
	env.DBPassword = lib.Strptr(viper.GetString("DB_PASS"))
	env.DBName = lib.Strptr(viper.GetString("DB_NAME"))
	env.RedisHost = lib.Strptr(viper.GetString("REDIS_HOST"))
	env.RedisPort = lib.Strptr(viper.GetString("REDIS_PORT"))
	env.RedisPassword = lib.Strptr(viper.GetString("REDIS_PASSWORD"))
	env.RedisIndex = lib.Intptr(viper.GetInt("REDIS_INDEX"))
	env.Prefork = lib.Boolptr(viper.GetBool("Prefork"))
	env.Aes = lib.Strptr(viper.GetString("AES"))
	env.Salt = lib.Strptr(viper.GetString("SALT"))
	env.CacheTtlSeconds = lib.Float64ptr(viper.GetFloat64("CACHE_TTL_SECONDS"))
	return env
}
