package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"
)

type problem struct {
	Slug              string   `json:"slug"`
	Title             string   `json:"title"`
	Module            string   `json:"module"`
	Statement         string   `json:"statement"`
	OriginalStatement string   `json:"original_statement,omitempty"`
	FuncName          string   `json:"func_name"`
	ReturnType        string   `json:"return_type"`
	ParamTypes        []string `json:"param_types"`
	ParamNames        []string `json:"param_names,omitempty"`
	Hints             []string `json:"hints"`
	Difficulty        int      `json:"difficulty"`
	XPReward          int      `json:"xp_reward"`
}

func main() {
	inFile := flag.String("in", "problems_updated.json", "input JSON file with rephrased statements (must include original_statement for rollback)")
	outFile := flag.String("out", "update.sql", "output SQL UPDATE file")
	rollbackFile := flag.String("rollback", "rollback.sql", "output rollback SQL file")
	flag.Parse()

	data, err := os.ReadFile(*inFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to read input file: %v\n", err)
		os.Exit(1)
	}

	var problems []problem
	if err := json.Unmarshal(data, &problems); err != nil {
		// Try single problem
		var single problem
		if err2 := json.Unmarshal(data, &single); err2 != nil {
			fmt.Fprintf(os.Stderr, "ERROR: input must be a JSON array of problems or a single problem: %v\n", err)
			os.Exit(1)
		}
		problems = []problem{single}
	}

	if len(problems) == 0 {
		fmt.Fprintln(os.Stderr, "ERROR: no problems found in input file")
		os.Exit(1)
	}

	module := problems[0].Module
	var forward, rollback strings.Builder

	fmt.Fprintf(&forward, "-- Generated: %s\n", timeStamp())
	fmt.Fprintf(&forward, "-- Module: %s\n-- Problems: %d\n\n", module, len(problems))

	fmt.Fprintf(&rollback, "-- ROLLBACK — Generated: %s\n", timeStamp())
	fmt.Fprintf(&rollback, "-- Module: %s\n-- Problems: %d\n\n", module, len(problems))

	hasRollback := true
	for _, p := range problems {
		if p.OriginalStatement == "" {
			hasRollback = false
		}
	}

	for _, p := range problems {
		fwdStmt := escapeSQL(p.Statement)
		fmt.Fprintf(&forward, "UPDATE problems SET\n\tstatement = '%s'", fwdStmt)
		if len(p.ParamNames) > 0 {
			names := make([]string, len(p.ParamNames))
			for i, n := range p.ParamNames {
				names[i] = escapeSQL(n)
			}
			fmt.Fprintf(&forward, ",\n\tparam_names = '{%s}'", strings.Join(names, ","))
		}
		fmt.Fprintf(&forward, "\nWHERE slug = '%s';\n", p.Slug)

		if p.OriginalStatement != "" {
			origStmt := escapeSQL(p.OriginalStatement)
			fmt.Fprintf(&rollback, "UPDATE problems SET\n\tstatement = '%s',\n\tparam_names = '{}'\nWHERE slug = '%s';\n", origStmt, p.Slug)
		} else {
			fmt.Fprintf(&rollback, "-- UPDATE problems SET statement = '<original>' WHERE slug = '%s'; (original not saved)\n", p.Slug)
		}
	}

	if !hasRollback {
		fmt.Fprint(&rollback, "\n-- WARNING: Some problems are missing original_statement.\n")
		fmt.Fprint(&rollback, "-- Extract again from the database before running this rollback.\n")
	}

	if err := os.WriteFile(*outFile, []byte(forward.String()), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to write output file: %v\n", err)
		os.Exit(1)
	}
	if err := os.WriteFile(*rollbackFile, []byte(rollback.String()), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to write rollback file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Generated %d UPDATE statements → %s\n", len(problems), *outFile)
	fmt.Printf("✓ Rollback → %s\n", *rollbackFile)
	fmt.Println("⚠  Review update.sql before running against your database")
}

func escapeSQL(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}

func timeStamp() string {
	return time.Now().Format("2006-01-02 15:04:05")
}
