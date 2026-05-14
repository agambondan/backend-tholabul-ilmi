package middlewares

import (
	"log/slog"
	"time"

	"github.com/getsentry/sentry-go"
	sentryfiber "github.com/getsentry/sentry-go/fiber"
	"github.com/gofiber/fiber/v2"
	"github.com/spf13/viper"
)

func SetupSentry() error {
	dsn := viper.GetString("SENTRY_DSN")
	if dsn == "" {
		slog.Info("sentry disabled: SENTRY_DSN not set")
		return nil
	}
	err := sentry.Init(sentry.ClientOptions{
		Dsn:              dsn,
		Environment:      viper.GetString("ENVIRONMENT"),
		TracesSampleRate: 0.1,
	})
	if err != nil {
		return err
	}
	return nil
}

func SentryMiddleware() fiber.Handler {
	return sentryfiber.New(sentryfiber.Options{
		Repanic:         true,
		WaitForDelivery: false,
	})
}

func CaptureError(err error, context map[string]interface{}) {
	if err == nil {
		return
	}
	if context != nil {
		sentry.WithScope(func(scope *sentry.Scope) {
			scope.SetContext("extra", context)
			sentry.CaptureException(err)
		})
		return
	}
	sentry.CaptureException(err)
}

func FlushSentry() {
	sentry.Flush(2 * time.Second)
}
