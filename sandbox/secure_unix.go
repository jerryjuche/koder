//go:build linux || darwin

package main

import (
	"log"
	"os/exec"
	"syscall"
	"time"
)

// setProcessAttributes configures the child process with process-group
// isolation. We intentionally avoid applying RLIMIT_* to the parent sandbox
// process because that can destabilize the Go runtime and cause allocator
// failures while spawning or reading subprocess output.
func setProcessAttributes(cmd *exec.Cmd, _ int) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setpgid: true,
	}
}

// setPythonRlimits preserves the child-process isolation behavior without
// changing the sandbox service's own address-space limits.
func setPythonRlimits(_ int) {}

func resourceLimits(_ int) []resourceLimit {
	return []resourceLimit{
		{6, 64, 64},                                // RLIMIT_NPROC=6 — raw value, not in syscall on linux/arm64
		{syscall.RLIMIT_NOFILE, 1024, 1024},        // max 1024 file descriptors
		{syscall.RLIMIT_FSIZE, 64 << 20, 64 << 20}, // max 64 MB file write
	}
}

// killProcessGroup sends SIGKILL to the entire process group rooted at cmd.
// Safe to call if the process has already exited.
func killProcessGroup(cmd *exec.Cmd) {
	if cmd == nil || cmd.Process == nil {
		return
	}
	// Negative PID signals the process group (set via Setpgid above).
	if err := syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL); err != nil {
		log.Printf("WARN: kill process group %d: %v", cmd.Process.Pid, err)
	} else {
		log.Printf("INFO: killed process group %d (timeout)", cmd.Process.Pid)
	}
}

// reapProcess waits for the child to fully exit to prevent zombies.
// Safe to call after cmd.Wait() or after a context deadline.
func reapProcess(cmd *exec.Cmd) {
	if cmd == nil || cmd.Process == nil {
		return
	}
	done := make(chan struct{})
	go func() {
		cmd.Process.Wait() //nolint:errcheck // best-effort reaping
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		log.Printf("WARN: reap timeout for pid %d", cmd.Process.Pid)
	}
}
