package lib

import (
	"github.com/morkid/paginate"
)

// ApplyToPageItems runs fn over each element of page.Items when it is a
// `*[]T` or `[]T`. Used to FilterByLang on Translation relations inside
// paginated responses without exposing the type assertion to every caller.
func ApplyToPageItems[T any](page *paginate.Page, fn func(*T)) {
	if page == nil {
		return
	}
	switch v := page.Items.(type) {
	case *[]T:
		if v == nil {
			return
		}
		for i := range *v {
			fn(&(*v)[i])
		}
	case []T:
		for i := range v {
			fn(&v[i])
		}
	}
}
