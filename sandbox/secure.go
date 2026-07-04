package main

import (
	"fmt"
	"regexp"
)

// dangerousPatterns are checked against student code before execution.
// Each entry pairs a compiled regex with a human-readable reason.
var dangerousPatterns = []struct {
	re  *regexp.Regexp
	msg string
}{
	// Package imports (covers both "pkg" and "pkg/sub" quoted strings)
	{regexp.MustCompile(`"os/exec"`), "package os/exec is not allowed"},
	{regexp.MustCompile(`"syscall"`), "package syscall is not allowed"},
	{regexp.MustCompile(`"unsafe"`), "package unsafe is not allowed"},
	{regexp.MustCompile(`"net"`), "package net is not allowed"},

	// Fully-qualified dangerous calls
	{regexp.MustCompile(`\bos/exec\.`), "os/exec calls are not allowed"},
	{regexp.MustCompile(`\bsyscall\.`), "syscall calls are not allowed"},
	{regexp.MustCompile(`\bunsafe\.`), "unsafe calls are not allowed"},

	// Filesystem mutations
	{regexp.MustCompile(`\bos\.(Remove|RemoveAll|Create|OpenFile|Chmod|Chown|Mkdir|MkdirAll|Rename|Truncate|WriteFile|Write)\s*\(`),
		"filesystem writes are not allowed"},
	{regexp.MustCompile(`\bioutil\.`), "ioutil is not allowed"},

	// Network connections
	{regexp.MustCompile(`\bnet\.(Dial|DialTCP|DialUDP|DialIP|Listen|ListenTCP|ListenUDP|ListenIP)\s*\(`),
		"network connections are not allowed"},

	// Process / signal control
	{regexp.MustCompile(`\bos\.(StartProcess|FindProcess|Signal)\s*\(`),
		"process control is not allowed"},

	// Reflection abuse
	{regexp.MustCompile(`\breflect\.(ValueOf|NewAt|MakeFunc|SetValue)\s*\(`),
		"reflection abuse is not allowed"},

	// Runtime / eval-like calls
	{regexp.MustCompile(`\bruntime\.(Goexit|GOMAXPROCS|NumCPU|NumGoroutine)\s*\(`),
		"runtime manipulation is not allowed"},
}

// validateCode checks student code against known dangerous patterns.
// It returns nil if the code is safe, or an error describing the first
// blocked pattern encountered.
func validateCode(code string) error {
	for _, d := range dangerousPatterns {
		if d.re.MatchString(code) {
			return fmt.Errorf("security: %s", d.msg)
		}
	}
	return nil
}
