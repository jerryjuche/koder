package main

import (
	"bufio"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type problem struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Module      string   `json:"module"`
	Statement   string   `json:"statement"`
	FuncName    string   `json:"func_name"`
	ReturnType  string   `json:"return_type"`
	ParamTypes  []string `json:"param_types"`
	Hints       []string `json:"hints"`
	Difficulty  int      `json:"difficulty"`
	XPReward    int      `json:"xp_reward"`
	Tags        []string `json:"tags"`
	Constraints string   `json:"constraints"`
}

func loadEnv() {
	file, err := os.Open(".env")
	if err != nil {
		return
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
}

func main() {
	module := flag.String("module", "python-arrays-strings", "module name to extract problems from")
	outFile := flag.String("out", "problems.json", "output JSON file path")
	dsn := flag.String("dsn", "", "PostgreSQL DSN (overrides DATABASE_URL env)")
	flag.Parse()

	loadEnv()

	databaseURL := *dsn
	if databaseURL == "" {
		databaseURL = os.Getenv("DATABASE_URL")
	}
	if databaseURL == "" {
		fmt.Fprintln(os.Stderr, "ERROR: DATABASE_URL is required. Set it in .env or pass --dsn")
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	poolCfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to parse DATABASE_URL: %v\n", err)
		os.Exit(1)
	}
	poolCfg.MaxConns = 3
	poolCfg.MinConns = 1

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to create connection pool: %v\n", err)
		os.Exit(1)
	}
	defer pool.Close()

	query := `SELECT slug, title, module, statement, func_name, return_type, param_types,
		hints, difficulty, xp_reward, tags, COALESCE(constraints, '') AS constraints
		FROM problems WHERE module = $1 ORDER BY slug`

	rows, err := pool.Query(ctx, query, *module)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: query failed: %v\n", err)
		os.Exit(1)
	}
	defer rows.Close()

	var problems []problem
	for rows.Next() {
		var p problem
		err := rows.Scan(&p.Slug, &p.Title, &p.Module, &p.Statement, &p.FuncName,
			&p.ReturnType, &p.ParamTypes, &p.Hints, &p.Difficulty, &p.XPReward,
			&p.Tags, &p.Constraints)
		if err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: row scan failed: %v\n", err)
			os.Exit(1)
		}
		problems = append(problems, p)
	}

	if len(problems) == 0 {
		fmt.Fprintf(os.Stderr, "No problems found for module %q\n", *module)
		os.Exit(1)
	}

	data, err := json.MarshalIndent(problems, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to marshal JSON: %v\n", err)
		os.Exit(1)
	}

	if err := os.WriteFile(*outFile, data, 0644); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: failed to write file: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Extracted %d problems from module %q → %s\n", len(problems), *module, *outFile)
}
