//go:build !production
// +build !production

package lib

/**
 * NOTICE
 *
 * Feel free to create your own function here to use for Unit Testing
 * Also make sure you provide unit tests of the functions you create
 * Do not use any of the functions described here for production
 */
import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"

	"github.com/gofiber/fiber/v2"
)

// HTTPRequest create a simple request object
func HTTPRequest(method string, path string, headers map[string]string, body ...string) *http.Request {
	var payload io.Reader
	if len(body) == 1 && body[0] != "" {
		payload = bytes.NewReader([]byte(body[0]))
	}
	request := httptest.NewRequest(method, path, payload)
	if nil != headers {
		for i := range headers {
			request.Header.Add(i, headers[i])
		}
	} else {
		request.Header.Add("Accept", "application/json")
		request.Header.Add("Content-type", "application/json")
	}

	return request
}

// GetTest get response for GetTest
func GetTest(app *fiber.App, path string, headers map[string]string) (*http.Response, map[string]interface{}, error) {
	return GetTestTimeout(app, 5000, path, headers)
}

// GetTestTimeout get response for GetTest With Timeout
func GetTestTimeout(app *fiber.App, msTimeout int, path string, headers map[string]string) (*http.Response, map[string]interface{}, error) {
	var result map[string]interface{}
	response, err := app.Test(HTTPRequest("GET", path, headers), msTimeout)
	if err != nil {
		return nil, nil, err
	}
	defer response.Body.Close()

	if nil == err {
		if bte, err := io.ReadAll(response.Body); nil == err {
			json.Unmarshal(bte, &result)
		}
	}

	return response, result, err
}

// PostTest get response for PostTest
func PostTest(app *fiber.App, path string, headers map[string]string, body ...string) (*http.Response, map[string]interface{}, error) {
	return PostTestTimeout(app, 5000, path, headers, body...)
}

// PostTestTimeout get response for PostTest with timeout
func PostTestTimeout(app *fiber.App, msTimeout int, path string, headers map[string]string, body ...string) (*http.Response, map[string]interface{}, error) {
	var result map[string]interface{}
	response, err := app.Test(HTTPRequest("POST", path, headers, body...), msTimeout)
	if err != nil {
		return nil, nil, err
	}
	defer response.Body.Close()

	if nil == err {
		if bte, err := io.ReadAll(response.Body); nil == err {
			json.Unmarshal(bte, &result)
		}
	}

	return response, result, err
}

// PutTest get response for PutTest
func PutTest(app *fiber.App, path string, headers map[string]string, body ...string) (*http.Response, map[string]interface{}, error) {
	return PutTestTimeout(app, 5000, path, headers, body...)
}

// PutTestTimeout get response for PutTest with timeout
func PutTestTimeout(app *fiber.App, msTimeout int, path string, headers map[string]string, body ...string) (*http.Response, map[string]interface{}, error) {
	var result map[string]interface{}
	response, err := app.Test(HTTPRequest("PUT", path, headers, body...), msTimeout)
	if err != nil {
		return nil, nil, err
	}
	defer response.Body.Close()

	if nil == err {
		if bte, err := io.ReadAll(response.Body); nil == err {
			json.Unmarshal(bte, &result)
		}
	}

	return response, result, err
}

// DeleteTest get response for DeleteTest
func DeleteTest(app *fiber.App, path string, headers map[string]string) (*http.Response, map[string]interface{}, error) {
	return DeleteTestTimeout(app, 5000, path, headers)
}

// DeleteTestTimeout get response for DeleteTest with timeout
func DeleteTestTimeout(app *fiber.App, msTimeout int, path string, headers map[string]string) (*http.Response, map[string]interface{}, error) {
	var result map[string]interface{}
	response, err := app.Test(HTTPRequest("DELETE", path, headers), msTimeout)
	if err != nil {
		return nil, nil, err
	}
	defer response.Body.Close()

	if nil == err {
		if bte, err := io.ReadAll(response.Body); nil == err {
			json.Unmarshal(bte, &result)
		}
	}

	return response, result, err
}

// JSONStringify convert object to JSON string
func JSONStringify(data interface{}, beautify ...bool) string {
	formatOutput := len(beautify) > 0 && beautify[0]
	if formatOutput {
		j, _ := json.MarshalIndent(data, "", "  ")
		return string(j)
	}
	j, _ := json.Marshal(data)
	return string(j)
}
