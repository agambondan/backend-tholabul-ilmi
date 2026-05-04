package http

import (
	"fmt"
	"io/ioutil"
	"regexp"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestHandle(t *testing.T) {
	app := fiber.New()
	Handle(app, nil)
	routes := getRoutes()

	err := checkDups(routes)
	if nil != err {
		t.Fatal(err)
	}
}

type routeItem struct {
	matches    string
	method     string
	path       string
	index      string
	controller string
}

type routeItems map[string]routeItem

func checkDups(routes []routeItem) error {
	items := routeItems{}
	dups := []string{}
	for i := range routes {
		index := routes[i].index
		if _, ok := items[index]; ok {
			dups = append(dups, fmt.Sprintf("FATAL:\nduplicate route %s %s\n%s already declared\n\n",
				routes[i].method, routes[i].path, routes[i].matches))
			continue
		}
		items[index] = routes[i]
	}

	if len(dups) > 0 {
		return fmt.Errorf("%s%s", "\n", strings.Join(dups, "\n"))
	}

	return nil
}

func getRoutes() []routeItem {
	bte, err := ioutil.ReadFile("routes.go")
	items := []routeItem{}
	if nil == err {
		re := regexp.MustCompile("[^\\. \\t\\s]+\\.(Get|Put|Post|Delete|Patch)\\([`\"]([^`\"]+)[`\"],[ ]?([^\\)]+)\\)")
		re2 := regexp.MustCompile(`/([:][^/]+)`)
		result := re.FindAllSubmatch(bte, -1)
		for i := range result {
			item := routeItem{}
			item.matches = string(result[i][0])
			item.method = strings.ToUpper(string(result[i][1]))
			item.path = string(result[i][2])
			item.controller = string(result[i][3])
			item.index = item.method + " " + re2.ReplaceAllString(string(result[i][2]), `/{_}`)
			items = append(items, item)
		}
	}

	return items
}
