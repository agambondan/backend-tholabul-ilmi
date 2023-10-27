package lib

import (
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/spf13/viper"
)

func TokenValid(c *fiber.Ctx) error {
	token, err := VerifyToken(c)
	if err != nil {
		return err
	}
	if !token.Valid {
		return err
	}
	return nil
}

func VerifyToken(c *fiber.Ctx) (*jwt.Token, error) {
	reqToken := c.Request().Header.Cookie("token")
	if string(reqToken) == "" {
		bearerToken := c.Get("Authorization")
		if bearerToken != "" {
			reqToken = []byte(strings.Split(bearerToken, " ")[1])
		}
	}
	return extractToken(string(reqToken))
}

// VerifyTokenCookies is to verify token by cookie
func VerifyTokenCookies(c *fiber.Ctx) (*jwt.Token, error) {
	reqToken := c.Request().Header.Cookie("token")
	return extractToken(string(reqToken))
}

// VerifyTokenHeaders is to verify token by header
func VerifyTokenHeaders(c *fiber.Ctx) (*jwt.Token, error) {
	bearerToken := c.Get("Authorization")
	tokens := strings.Split(bearerToken, " ")
	if len(tokens) != 0 {
		return extractToken(tokens[1])
	}
	return nil, errors.New("token is empty")
}

func extractToken(reqToken string) (*jwt.Token, error) {
	token, err := jwt.Parse(reqToken, func(token *jwt.Token) (interface{}, error) {
		//Make sure that the token method conform to "SigningMethodHMAC"
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(viper.GetString("ACCESS_SECRET")), nil
	})
	if err != nil {
		return nil, err
	}
	return token, nil
}

func ExtractToken(c *fiber.Ctx) (map[string]interface{}, error) {
	token, err := VerifyTokenHeaders(c)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	log.Println(claims)
	if ok && token.Valid {
		_, ok := claims["access_uuid"].(string)
		if !ok {
			return nil, err
		}
		return claims, nil
	}
	return nil, err
}
