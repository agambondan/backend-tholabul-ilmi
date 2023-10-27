package lib

import (
	"regexp"
	"strings"

	"github.com/iancoleman/strcase"
)

// SnakeCase converts a string into snake case.
func SnakeCase(s string, keepUnderscores ...bool) string {
	snake := strings.ToLower(strcase.ToSnake(s))
	if len(keepUnderscores) == 0 || !keepUnderscores[0] {
		re := regexp.MustCompile(`[_]+`)
		snake = re.ReplaceAllString(snake, "_")
	}
	return snake
}

// UpperSnakeCase converts a string into snake case with capital letters.
func UpperSnakeCase(s string, keepUnderscores ...bool) string {
	return strings.ToUpper(SnakeCase(s, keepUnderscores...))
}

// KebabCase converts a string into kebab case.
func KebabCase(s string, keepDashes ...bool) string {
	kebab := strings.ToLower(strcase.ToKebab(s))
	if len(keepDashes) == 0 || !keepDashes[0] {
		re := regexp.MustCompile(`[-]+`)
		kebab = re.ReplaceAllString(kebab, "-")
	}
	return kebab
}

// UpperKebabCase converts a string into kebab case with capital letters.
func UpperKebabCase(s string) string {
	return strings.ToUpper(KebabCase(s))
}
