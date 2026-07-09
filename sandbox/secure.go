package main

import (
	"fmt"
	"regexp"
)

type resourceLimit struct {
	resource int
	cur, max uint64
}

// dangerousPatterns are checked against student code before execution.
// Each entry pairs a compiled regex with a human-readable reason.
var dangerousPatterns = []struct {
	re  *regexp.Regexp
	msg string
}{
	// CGO — blocks "C" pseudo-package in both double-quote and backtick form
	{regexp.MustCompile(`"C"`), "cgo is not allowed"},
	{regexp.MustCompile("`C`"), "cgo is not allowed"},

	// Package imports (covers both "pkg" and "pkg/sub" quoted strings)
	{regexp.MustCompile(`"os/exec"`), "package os/exec is not allowed"},
	{regexp.MustCompile("`os/exec`"), "package os/exec is not allowed"},
	{regexp.MustCompile(`"syscall"`), "package syscall is not allowed"},
	{regexp.MustCompile("`syscall`"), "package syscall is not allowed"},
	{regexp.MustCompile(`"unsafe"`), "package unsafe is not allowed"},
	{regexp.MustCompile("`unsafe`"), "package unsafe is not allowed"},
	{regexp.MustCompile(`"net"`), "package net is not allowed"},
	{regexp.MustCompile("`net`"), "package net is not allowed"},
	{regexp.MustCompile(`"embed"`), "package embed is not allowed"},
	{regexp.MustCompile("`embed`"), "package embed is not allowed"},

	// Fully-qualified dangerous calls
	{regexp.MustCompile(`\bos/exec\.`), "os/exec calls are not allowed"},
	{regexp.MustCompile(`\bsyscall\.`), "syscall calls are not allowed"},
	{regexp.MustCompile(`\bunsafe\.`), "unsafe calls are not allowed"},

	// //go:embed directives
	{regexp.MustCompile(`//go:embed`), "go:embed directives are not allowed"},

	// Filesystem mutations (word boundary, no parentheses required — catches variable refs)
	{regexp.MustCompile(`\bos\.\s*(Remove|RemoveAll|Create|OpenFile|Chmod|Chown|Mkdir|MkdirAll|Rename|Truncate|WriteFile|Write)\b`),
		"filesystem writes are not allowed"},
	{regexp.MustCompile(`\bioutil\.`), "ioutil is not allowed"},

	// Network connections
	{regexp.MustCompile(`\bnet\.\s*(Dial|DialTCP|DialUDP|DialIP|Listen|ListenTCP|ListenUDP|ListenIP)\b`),
		"network connections are not allowed"},

	// Process / signal control
	{regexp.MustCompile(`\bos\.\s*(StartProcess|FindProcess|Signal|Exit)\b`),
		"process control is not allowed"},

	// Reflection abuse
	{regexp.MustCompile(`\breflect\.\s*(ValueOf|NewAt|MakeFunc|SetValue)\b`),
		"reflection abuse is not allowed"},

	// Runtime / eval-like calls
	{regexp.MustCompile(`\bruntime\.\s*(Goexit|GOMAXPROCS|NumCPU|NumGoroutine)\b`),
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

// pythonDangerousPatterns blocks dangerous code in Python submissions.
// Layer 1 of defense-in-depth: regex blocklist.
var pythonDangerousPatterns = []struct {
	re  *regexp.Regexp
	msg string
}{
	{regexp.MustCompile(`\bimport\s+(os|subprocess|ctypes|socket|shutil|pickle|code|importlib|builtins)\b`), "dangerous module import"},
	{regexp.MustCompile(`\bfrom\s+(os|subprocess|ctypes|socket|shutil|pickle|code|importlib|builtins)\s+import\b`), "dangerous module import"},
	{regexp.MustCompile(`\beval\s*\(`), "eval() is not allowed"},
	{regexp.MustCompile(`\bexec\s*\(`), "exec() is not allowed"},
	{regexp.MustCompile(`\bcompile\s*\(`), "compile() is not allowed"},
	{regexp.MustCompile(`\b__import__\s*\(`), "__import__() is not allowed"},
	{regexp.MustCompile(`\bopen\s*\(`), "open() is not allowed"},
	{regexp.MustCompile(`\bos\.`), "os module access is not allowed"},
	{regexp.MustCompile(`\bsubprocess\.`), "subprocess module access is not allowed"},
	{regexp.MustCompile(`\bsocket\.`), "socket module access is not allowed"},
	{regexp.MustCompile(`\bctypes\.`), "ctypes module access is not allowed"},
	{regexp.MustCompile(`\bgetattr\s*\(`), "getattr() is not allowed"},
	{regexp.MustCompile(`\bsetattr\s*\(`), "setattr() is not allowed"},
	{regexp.MustCompile(`\bglobals\s*\(`), "globals() is not allowed"},
	{regexp.MustCompile(`\blocals\s*\(`), "locals() is not allowed"},
	{regexp.MustCompile(`\bpickle\.`), "pickle deserialization is not allowed"},
	{regexp.MustCompile(`\bmarshal\.`), "marshal deserialization is not allowed"},
	{regexp.MustCompile(`\bshelve\.`), "shelve deserialization is not allowed"},
}

// validatePythonCode checks student Python code against known dangerous patterns (Layer 1).
func validatePythonCode(code string) error {
	for _, d := range pythonDangerousPatterns {
		if d.re.MatchString(code) {
			return fmt.Errorf("security: %s", d.msg)
		}
	}
	return nil
}
