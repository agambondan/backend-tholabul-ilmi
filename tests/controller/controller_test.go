//go:build !integration
// +build !integration

package controller

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/doc"
	"go/parser"
	"go/token"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"testing"
)

var (
	basePattern     = regexp.MustCompile(`(?i)@(accept|description|tags|summary|produce|param|router|success|failure)[ ]+(.*)`)
	filePattern     = regexp.MustCompile(`^(.*)_(get|put|post|delete|patch)\.go$`)
	commentPattern  = regexp.MustCompile(`^([^ ]+)[ ]+([^ ]+)[ ]+([^ ]+)[ ]+([^ ]+)[ ]+"?([^"]+)"?`)
	responsePattern = regexp.MustCompile(`^([^ ]+)[ ]+([^ ]+)[ ]+([^ ]+)([ "]+)?([^"]+)"?`)
	spacePattern    = regexp.MustCompile(`[ ]+`)
	methodPattern   = regexp.MustCompile(`[\[\]]+`)
	pathPattern     = regexp.MustCompile(`\{([^\}]+)\}`)
	pascalPattern   = regexp.MustCompile(`^(?i)(URL|ID|API)$`)
	// funcPattern       = regexp.MustCompile(`^(Post|Put|Patch|Get|Delete)( ?[A-Z]+.*$)`)
	// capitalPattern    = regexp.MustCompile(`([A-Z])`)
	// upperSpacePattern = regexp.MustCompile(`([A-Z]) ([^A-Z]+)`)
	// upperLowerPattern = regexp.MustCompile(`([A-Z]) ([A-Z])([^A-Z]+)`)
)

func getAllGoFiles(dir string) []string {
	files, err := ioutil.ReadDir(dir)
	outputs := []string{}
	if nil == err {
		for f := range files {
			file := files[f]
			if file.IsDir() {
				outputs = append(outputs, getAllGoFiles(path.Join(dir, file.Name()))...)
			} else {
				if filePattern.MatchString(file.Name()) {
					outputs = append(outputs, path.Join(dir, file.Name()))
				}
			}
		}
	}

	return outputs
}

// func toSnake(str string) string {
// 	snakeString := ""

// 	if funcPattern.MatchString(str) {
// 		snakeString = capitalPattern.ReplaceAllString(str, " $1 ")
// 		snakeString = upperSpacePattern.ReplaceAllString(snakeString, "$1$2")
// 		snakeString = upperLowerPattern.ReplaceAllString(snakeString, "$1$2$3")
// 		snakeString = upperLowerPattern.ReplaceAllString(snakeString, "$1$2$3")
// 		snakeString = strings.TrimSpace(snakeString)
// 		snakeString = funcPattern.ReplaceAllString(snakeString, "$2 $1")
// 		snakeString = strings.TrimSpace(snakeString)
// 		snakeString = strings.ReplaceAll(snakeString, " ", "_")
// 		snakeString = strings.ToLower(snakeString)
// 	}

// 	return snakeString
// }

func toPascal(str string) string {
	pascalString := []string{}
	re := filePattern
	baseFileName := re.ReplaceAllString(filepath.Base(str), "${2}_${1}")
	baseFileNames := strings.Split(baseFileName, "_")
	for _, value := range baseFileNames {
		suffix := strings.ToLower(string(value[1:]))
		if pascalPattern.MatchString(value) {
			suffix = strings.ToUpper(string(value[1:]))
		}
		pascalString = append(pascalString, strings.ToUpper(string(value[0])))
		pascalString = append(pascalString, suffix)
	}

	return strings.Join(pascalString, "")
}

type SwaggerCommentParam struct {
	Name        string
	In          string
	Type        string
	Required    bool
	Description string
	Content     string
}

func (s *SwaggerCommentParam) ParseContent() {
	if s.Content != "" {
		re := commentPattern
		if re.MatchString(s.Content) {
			s.Name = re.ReplaceAllString(s.Content, "$1")
			s.In = re.ReplaceAllString(s.Content, "$2")
			s.Type = re.ReplaceAllString(s.Content, "$3")
			s.Required = re.ReplaceAllString(s.Content, "$4") == "true"
			s.Description = re.ReplaceAllString(s.Content, "$5")
		}
	}
}

type SwaggerCommentResponse struct {
	Status      string
	Code        int
	Type        string
	Model       string
	Description string
	Content     string
}

func (s *SwaggerCommentResponse) ParseContent() {
	if s.Content != "" {
		re := responsePattern
		if re.MatchString(s.Content) {
			codeInt, _ := strconv.Atoi(re.ReplaceAllString(s.Content, "$1"))
			s.Code = codeInt
			s.Type = re.ReplaceAllString(s.Content, "$2")
			s.Model = re.ReplaceAllString(s.Content, "$3")
			s.Description = re.ReplaceAllString(s.Content, "$5")
		}
	}
}

type SwaggerComment struct {
	FuncName       string
	OriginFuncName string
	PackageName    string
	FilePath       string
	Path           string
	RealPath       string
	Method         string
	PathParams     []string
	Tags           string
	Summary        string
	Description    string
	Accept         string
	Produce        string
	Params         []SwaggerCommentParam
	Responses      []SwaggerCommentResponse
	RouteContent   []byte `json:"-"`
}

func (s *SwaggerComment) Parse(docs []string) error {
	re := basePattern
	re2 := spacePattern
	re3 := methodPattern
	re4 := pathPattern

	s.Params = []SwaggerCommentParam{}
	s.Responses = []SwaggerCommentResponse{}
	s.PathParams = []string{}
	for _, l := range docs {
		if re.MatchString(l) {
			prefix := strings.ToLower(re.ReplaceAllString(l, "$1"))
			content := re.ReplaceAllString(l, "$2")
			switch prefix {
			case "description":
				s.Description = content
			case "tags":
				s.Tags = content
			case "summary":
				s.Summary = content
			case "accept":
				s.Accept = strings.ToLower(content)
			case "produce":
				s.Produce = strings.ToLower(content)
			case "param":
				sp := SwaggerCommentParam{Content: content}
				sp.ParseContent()
				s.Params = append(s.Params, sp)
			case "success", "failure":
				sr := SwaggerCommentResponse{
					Content: content,
					Status:  prefix,
				}
				sr.ParseContent()
				s.Responses = append(s.Responses, sr)
			case "router":
				routeString := re.ReplaceAllString(content, "$1")
				routeStrings := strings.Split(re2.ReplaceAllString(routeString, " "), " ")
				s.Path = routeStrings[0]
				s.Method = re3.ReplaceAllString(routeStrings[1], "")
				routes := strings.Split(s.Path, "/")
				for _, r := range routes {
					if re4.MatchString(r) {
						s.PathParams = append(s.PathParams, re4.ReplaceAllString(r, "$1"))
					}
				}
			}
		}
	}
	s.RealPath = routeRegex(s.RouteContent, s.Method, s.PackageName, s.OriginFuncName)

	if s.Path == "" {
		return fmt.Errorf("FATAL: invalid swagger definition.\n@Router not found at %s\n ", s.FilePath)
	}

	if s.RealPath != "" && !strings.EqualFold(s.RealPath, s.Path) {
		return fmt.Errorf("FATAL: invalid swagger definition.\nRouter does not match with app/routes/routes.go\n@Router defined as %s in function %s.\nIt must defined as %s in file: %s\n ",
			s.Path, s.OriginFuncName, s.RealPath, s.FilePath)
	}

	for _, param := range s.PathParams {
		hasParam := false
		for _, sp := range s.Params {
			if sp.In == "path" && param == sp.Name {
				hasParam = true
			}
		}

		if !hasParam {
			return fmt.Errorf("FATAL: invalid swagger definition.\n@Param %s is not defined at %s\n ", param, s.FilePath)
		}
	}

	rex := regexp.MustCompile(`(?i)` + s.Tags)
	if !rex.MatchString(s.OriginFuncName) {
		return fmt.Errorf("FATAL: invalid swagger definition.\n@Tags %s is not relevan with function %s at %s\n ",
			s.Tags, s.OriginFuncName, s.FilePath)
	}

	baseFile := filepath.Base(s.FilePath)
	baseMethod := filePattern.ReplaceAllString(baseFile, "$2")
	// baseName := filePattern.ReplaceAllString(baseFile, "$1")
	// baseName = strings.ReplaceAll(baseName, "_", "-")
	if !strings.EqualFold(baseMethod, s.Method) {
		return fmt.Errorf(`invalid swagger docs method %s. endpoint method must be %s %s`,
			baseMethod, s.Method, s.ToString())
	}

	return nil
}

func (s *SwaggerComment) ParseFile(filePath string) error {
	packageName := filepath.Base(filepath.Dir(filePath))
	fset := token.NewFileSet()
	s.FilePath = filePath
	s.PackageName = packageName
	s.FuncName = toPascal(filePath)

	f, err := parser.ParseFile(fset, filePath, nil, parser.ParseComments)
	if nil != err {
		return err
	}

	packg := &ast.Package{
		Name:  "Any",
		Files: make(map[string]*ast.File),
	}
	packg.Files[filePath] = f

	importPath, _ := filepath.Abs("/")
	dc := doc.New(packg, importPath, doc.AllMethods)
	functions := []string{}
	for _, c := range dc.Funcs {
		docs := strings.Split(c.Doc, "\n")
		s.OriginFuncName = c.Name
		if c.Name == s.FuncName && len(docs) > 0 {
			return s.Parse(docs)
		}
		functions = append(functions, c.Name)
	}

	funcs := strings.Join(functions, "\n- ")
	if len(functions) == 1 {
		f0 := functions[0]
		// snakeFile := toSnake(f0)
		funcs = funcs + "\nhints: \n"
		funcs = funcs + fmt.Sprintf(`- rename function %s to %s`, f0, s.FuncName)
		// if snakeFile != "" {
		// 	funcs = funcs + "\n" + fmt.Sprintf(`- rename file %s to %s.go`, filepath.Base(s.FilePath), snakeFile)
		// }
	}

	return fmt.Errorf("\nWARNING:\nfile %s\nhas no function with name %s.\navailable functions: \n- %s",
		s.FilePath,
		s.FuncName,
		funcs)
}

func (s *SwaggerComment) ToString() string {
	j, _ := json.MarshalIndent(s, "", "  ")
	return string(j)
}

func routeRegex(routeContent []byte, methodName, packageName, functionName string) string {
	if nil == routeContent || len(routeContent) < 1 {
		return ""
	}
	routePattern := fmt.Sprintf(`(?i)\.(%s)\(["%s]([^"%s]+)["%s, ]+%s.(%s)\)`,
		methodName, "`", "`", "`", packageName, functionName)

	re := regexp.MustCompile(routePattern)
	output := re.FindAllSubmatch(routeContent, -1)
	rx := regexp.MustCompile(`(/)?:([^:/]+)(/)?`)
	if nil != output {
		for i := range output {
			for x := range output[i] {
				if i == 0 && x == 2 {
					return rx.ReplaceAllString(string(output[i][x]), `$1{$2}$3`)
				}
			}
		}
	}

	return ""
}

func TestController(t *testing.T) {
	cwd, _ := os.Getwd()
	currentRouteFile := path.Join(cwd, "/app/routes/routes.go")
	_, err := os.Stat(currentRouteFile)
	routeContent := []byte{}
	if os.IsNotExist(err) {
		currentRouteFile = path.Join(cwd, "../routes/routes.go")
		_, err = os.Stat(currentRouteFile)
		if !os.IsNotExist(err) {
			routeContent, _ = ioutil.ReadFile(currentRouteFile)
		}
	}

	files := getAllGoFiles(".")
	fatals := []string{}
	for f := range files {
		sw := SwaggerComment{}
		sw.RouteContent = routeContent
		if err := sw.ParseFile(files[f]); nil != err {
			if strings.HasPrefix(err.Error(), "FATAL:") {
				fatals = append(fatals, err.Error())
			} else {
				fmt.Println(err)
			}
		}
	}

	if len(fatals) > 0 {
		fmt.Println("SOME CODE NEED TO BE FIXED:")
		fmt.Println(strings.Join(fatals, "\n"))
		if os.Getenv("FAIL_ON_CONTROLLER") == "1" {
			os.Exit(1)
		}
	}
}
