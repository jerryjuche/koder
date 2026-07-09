//go:build !linux && !darwin

package main

import (
	"os/exec"
)

// setProcessAttributes is a no-op on platforms that do not support
// syscall.Rlimit or Setpgid (e.g. Windows, Plan 9). When the sandbox
// is deployed on Railway (Linux), the unix implementation applies.
func setProcessAttributes(_ *exec.Cmd, _ int) {}

// setPythonRlimits is a no-op on non-Unix platforms.
func setPythonRlimits(_ int) {}

// killProcessGroup is a no-op on non-Unix platforms.
func killProcessGroup(_ *exec.Cmd) {}

// reapProcess is a no-op on non-Unix platforms.
func reapProcess(_ *exec.Cmd) {}
