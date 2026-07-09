//go:build linux || darwin

package main

import (
	"log"
	"os/exec"
	"syscall"
	"time"
)

// setProcessAttributes configures the child process with process-group
// isolation and applies OS-level resource limits.
//
// Resource limits are applied via setrlimit before the child forks, so the
// child inherits them and cannot override them. This works on all Go
// versions (unlike the Rlimit field in SysProcAttr which was added later).
func setProcessAttributes(cmd *exec.Cmd, timeoutSec int) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setpgid: true,
	}

	setRlimits(timeoutSec)
}

// setPythonRlimits applies resource limits specific to Python execution.
// RLIMIT_AS is safe for Python (unlike Go, which reserves large virtual address spaces).
func setPythonRlimits(timeoutSec int) {
	// RLIMIT_AS on linux/arm64 = 9
	if err := syscall.Setrlimit(9, &syscall.Rlimit{Cur: 512 << 20, Max: 512 << 20}); err != nil {
		log.Printf("WARN: setrlimit RLIMIT_AS: %v", err)
	}
	setRlimits(timeoutSec)
}

// setRlimits applies hard resource limits to the current process.
// These limits are inherited by all child processes (go test, student code).
func setRlimits(timeoutSec int) {
	limits := []struct {
		resource int
		cur, max uint64
	}{
		// RLIMIT_AS is intentionally omitted — Go runtime needs large virtual
		// address space reservations for its page allocator (mpagealloc_64bit.go).
		// Railway/Docker already enforce container-level memory limits.
		{6, 64, 64}, // RLIMIT_NPROC=6 — raw value, not in syscall on linux/arm64
		{syscall.RLIMIT_NOFILE, 1024, 1024},                            // max 1024 file descriptors
		{syscall.RLIMIT_FSIZE, 64 << 20, 64 << 20},                     // max 64 MB file write
		// RLIMIT_CPU is intentionally omitted — the context.WithTimeout wall-clock
		// deadline already catches infinite loops via exec.CommandContext SIGKILL.
		// CPU-seconds accumulate faster than wall-time on multi-core, so RLIMIT_CPU
		// would kill legitimate compilation before the wall-clock deadline.
	}

	for _, l := range limits {
		if err := syscall.Setrlimit(l.resource, &syscall.Rlimit{Cur: l.cur, Max: l.max}); err != nil {
			log.Printf("WARN: setrlimit resource=%d cur=%d max=%d: %v", l.resource, l.cur, l.max, err)
		}
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
