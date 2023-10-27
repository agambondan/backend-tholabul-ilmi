package lib

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

// VALIDATOR validate request body
var VALIDATOR *validator.Validate = validator.New()

// GetXUserID provide user id by http headers
func GetXUserID(c *fiber.Ctx) *uuid.UUID {
	id := string(c.Request().Header.Peek("x-user-id"))
	if id != "" {
		if current, err := uuid.Parse(id); nil == err {
			return &current
		}
	}

	return nil
}

// GetXAgentID provide user id by http headers
func GetXAgentID(c *fiber.Ctx) *uuid.UUID {
	id := string(c.Request().Header.Peek("x-agent-id"))
	if id != "" {
		if current, err := uuid.Parse(id); nil == err {
			return &current
		}
	} else if id = viper.GetString("AGENT_ID"); id != "" {
		if current, err := uuid.Parse(id); nil == err {
			return &current
		}
	}

	return nil
}

// GetXCorporateID provide corporate id by http headers
func GetXCorporateID(c *fiber.Ctx) *uuid.UUID {
	id := string(c.Request().Header.Peek("x-corporate-id"))
	if id != "" {
		if current, err := uuid.Parse(id); nil == err {
			return &current
		}
	}

	return nil
}

// GetLanguage get language by http header Accept-Language
func GetLanguage(c *fiber.Ctx, db ...*gorm.DB) string {
	lang := viper.GetString("LANGUAGE")
	acceptLanguage := string(c.Request().Header.Peek("accept-language"))
	if acceptLanguage != "" && len(acceptLanguage) >= 2 {
		lang = acceptLanguage[0:2]
		// TODO: check to database if database exists, if not return to fallback language ...
	}

	lang = strings.ToLower(lang)
	if ok, _ := regexp.Match("^[a-z]", []byte(lang)); !ok || len(lang) < 2 {
		lang = "en"
	}

	return lang
}

// BodyParser with validation
func BodyParser(c *fiber.Ctx, payload interface{}) error {
	if err := c.BodyParser(payload); nil != err {
		return err
	}

	return VALIDATOR.Struct(payload)
}

func GetLimitOffset(ctx *fiber.Ctx) (int, int) {
	query := ctx.Queries()
	limitStr := query["size"]
	pageStr := query["page"]
	if limitStr == "" {
		limitStr = "10"
	}
	if pageStr == "" {
		pageStr = "0"
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		return 10, 0
	}
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		return limit, 0
	}
	offset := limit * page

	return limit, offset
}
