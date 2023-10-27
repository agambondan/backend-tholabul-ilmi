package lib

import (
	"bytes"
	"errors"
	"fmt"
	"text/template"

	emailverifier "github.com/AfterShip/email-verifier"
	"gopkg.in/gomail.v2"
)

// SendEmail to sending email to with smtp
func SendEmail(to, subject, templateFile string, cc map[string]string, attach []string, data interface{}) error {
	var err error
	result, err := ParseTemplate(templateFile, data)
	if err != nil {
		return err
	}
	m := gomail.NewMessage()
	m.SetHeader("From", ConfigSenderName)
	m.SetHeader("To", to)
	for k, v := range cc {
		m.SetAddressHeader("Cc", k, v)
	}
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", result)
	for _, v := range attach {
		m.Attach(v) // attach whatever you want
	}
	d := gomail.NewDialer(ConfigSmtpHost, ConfigSmtpPort, ConfigAuthEmail, ConfigAuthPassword)
	err = d.DialAndSend(m)
	if err != nil {
		return err
	}
	return nil
}

// ParseTemplate Parse Template Html
func ParseTemplate(templateFileName string, data interface{}) (string, error) {
	t, err := template.ParseFiles(templateFileName)
	if err != nil {
		return "", err
	}
	buf := new(bytes.Buffer)
	if err = t.Execute(buf, data); err != nil {
		fmt.Println(err)
		return "", err
	}
	return buf.String(), nil
}

// CheckEmailExists is Check Email Exists or not
func CheckEmailExists(email *string) error {
	verifier := emailverifier.NewVerifier()
	ret, err := verifier.EnableGravatarCheck().EnableSMTPCheck().EnableAutoUpdateDisposable().EnableDomainSuggest().Verify(*email)
	if err != nil {
		return errors.New(fmt.Sprint("verify email address failed, error is: ", err))
	}
	if !ret.Syntax.Valid {
		return errors.New("email address syntax is invalid")
	}
	if ret.Reachable != "yes" {
		return errors.New("email doesn't exists or storage is full")
	}
	return nil
}
