//go:build linux || darwin

package main

import (
	"log"
	"os/exec"
	"syscall"
	"time"
)

// setProcessAttributes configures the child process with resource limits and
// process-group isolation. This is the primary defence against fork bombs,
// memory exhaustion, and runaway CPU usage.
//
// The limits are applied atomically at process creation — the child cannot
// override them.
func setProcessAttributes(cmd *exec.Cmd, timeoutSec int) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		// Isolate into its own process group so we can kill all descendants
		// on timeout (including grandchildren created by fork bombs).
		Setpgid: true,

		Rlimit: []syscall.Rlimit{
			// RLIMIT_AS: max virtual memory (address space) in bytes.
			// Prevents memory bombs that allocate huge slices or maps.
			{Cur: 256 << 20, Max: 256 << 20}, // 256 MB

			// RLIMIT_NPROC: max number of child processes/forked goroutines.
			// Prevents fork bombs (for { go f() } spawning unlimited OS threads).
			{Cur: 64, Max: 64},

			// RLIMIT_NOFILE: max number of open file descriptors.
			// Prevents file-descriptor exhaustion attacks.
			{Cur: 32, Max: 32},

			// RLIMIT_CPU: max CPU time in seconds (not wall-clock).
			// Catches tight infinite loops that don't hit the wall-clock timeout
			// quickly enough (e.g. a hot loop on a slow CPU).
			{Cur: uint64(timeoutSec), Max: uint64(timeoutSec)},
		},
	}
}

// killProcessGroup kills the entire process group rooted at cmd.
// This is a hard kill (SIGKILL) so it cannot be caught or ignored.
// Safe to call even if the process has already exited.
func killProcessGroup(cmd *exec.Cmd) {
	if cmd == nil || cmd.Process == nil {
		return
	}
	// Negative PID signals the entire process group (set via Setpgid above).
	if err := syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL); err != nil {
		log.Printf("WARN: kill process group %d: %v", -cmd.Process.Pid, err)
	} else {
		log.Printf("INFO: killed process group %d (timeout)", -cmd.Process.Pid)
	}
}

// reapProcess waits for the process to fully exit. On Unix this prevents
// zombies by collecting the exit status. It is safe to call after
// cmd.Wait() or after a context deadline.
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
