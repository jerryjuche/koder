#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/**
 * Parse a single SQL string literal (content between outer single quotes).
 * Handles PG escaping: '' → ' and \' → '
 */
function unescapeSQL(str) {
  return str.replace(/''/g, "'");
}
function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

/**
 * Split VALUES content into individual value strings.
 * The input is the content inside `VALUES (...)` — so we just
 * need to split by top-level commas, respecting PG string quoting.
 */
function tokenizeValues(text) {
  const tokens = [];
  let inStr = false;
  let depth = 0;
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "'") {
        if (i + 1 < text.length && text[i + 1] === "'") {
          i++;
          continue;
        }
        inStr = false;
      }
    } else {
      if (ch === "'") inStr = true;
      else if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ',' && depth === 0) {
        tokens.push(text.slice(start, i).trim());
        start = i + 1;
      }
    }
  }
  // Last token (after last comma, or only token)
  const last = text.slice(start).trim().replace(/\)?\s*$/, '');
  if (last) tokens.push(last);
  return tokens;
}

/**
 * Extract the VALUES section from a `VALUES (` block.
 * Returns the text between outer parentheses.
 */
function extractValuesBlock(sql) {
  const m = sql.match(/VALUES\s*\(/i);
  if (!m) return null;
  const start = m.index + m[0].length;
  let depth = 1;
  let inStr = false;
  let i = start;
  while (i < sql.length && depth > 0) {
    const ch = sql[i];
    if (inStr) {
      if (ch === "'") {
        if (i + 1 < sql.length && sql[i + 1] === "'") {
          i += 2;
          continue;
        }
        inStr = false;
      }
    } else {
      if (ch === "'") inStr = true;
      else if (ch === '(') depth++;
      else if (ch === ')') depth--;
    }
    i++;
  }
  return sql.slice(start, i - 1);
}

/**
 * Parse the monolithic markdown statement into parts.
 *
 * Format:
 *   ## Title                 (skip — already in `title` column)
 *
 *   <description paragraph>
 *
 *   **Function signature**   (skip — in func_name/param_types/return_type)
 *   ```go
 *   func Foo(...) ...
 *   ```
 *
 *   **Examples**             (skip — in test_cases table)
 *   ...
 *
 *   **Constraints**
 *   - ...                    (extract as constraints)
 *
 *   **Learning objective:**  (extract as learning_objective)
 */
function parseStatement(raw) {
  const sections = raw.split(/\n\*\*/);
  let description = '';
  let constraints = '';
  let learningObjective = '';

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    if (i === 0) {
      // First section: starts with "## Title\n\n<description>"
      // Remove the "## Title" line
      const lines = sec.split('\n');
      const descLines = [];
      let inCodeBlock = false;
      for (let j = 1; j < lines.length; j++) {
        const line = lines[j];
        if (line.trimStart().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }
        if (inCodeBlock) continue;
        if (line.trim()) descLines.push(line);
      }
      description = descLines.join('\n').trim();
    } else if (sec.startsWith('Constraints**')) {
      // Content between **Constraints** and next section
      constraints = sec
        .replace(/^Constraints\*\*\n*/, '')
        .replace(/\n\*\*Learning objective:/, '\n---LEARN_BREAK---')
        .split('---LEARN_BREAK---')[0]
        .replace(/\n\*\*Learning objective:.*$/, '')
        .trim();
    } else if (sec.startsWith('Learning objective:')) {
      learningObjective = sec
        .replace(/^Learning objective:\s*/, '')
        .replace(/\*+/g, '')
        .trim();
    } else if (sec.includes('**Learning objective:')) {
      const parts = sec.split('**Learning objective:');
      learningObjective = parts.slice(1).join('**Learning objective:').replace(/\*+/g, '').trim();
      // If constraints was not caught above, try to get it from this section
      if (!constraints && sec.startsWith('Constraints**')) {
        constraints = parts[0].replace(/^Constraints\*\*\n*/, '').trim();
      }
    }
  }

  return { description, constraints, learningObjective };
}

function transformFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let sql = readFileSync(filePath, 'utf-8');
  const lines = sql.split('\n');
  const result = [];
  let i = 0;
  let problemCount = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect start of a problem INSERT block
    if (line.includes('INSERT INTO problems (')) {
      problemCount++;
      // Collect the entire INSERT block until we hit the closing ")"
      // that starts " ON CONFLICT"
      const blockStart = i;
      // that's followed by " ON CONFLICT"
      let block = '';
      let depth = 0;
      let inStr = false;
      let j = i;

      while (j < lines.length) {
        const bline = lines[j];
        block += bline + '\n';
        for (let k = 0; k < bline.length; k++) {
          const ch = bline[k];
          if (inStr) {
            if (ch === "'") {
              if (k + 1 < bline.length && bline[k + 1] === "'") {
                k++;
                continue;
              }
              inStr = false;
            }
          } else {
            if (ch === "'") inStr = true;
            else if (ch === '(') depth++;
            else if (ch === ')') depth--;
          }
        }
        if (depth === 0 && !inStr) {
          // Check if this ends the VALUES section
          if (bline.includes(') ON CONFLICT') || bline.includes(');')) {
            j++;
            break;
          }
        }
        j++;
      }

      const fullBlock = block.trimEnd();

      // Extract the VALUES block
      const valuesText = extractValuesBlock(fullBlock);
      if (!valuesText) {
        // Fallback: push original lines
        for (let k = blockStart; k < j; k++) {
          result.push(lines[k]);
        }
        i = j;
        continue;
      }

      const tokens = tokenizeValues(valuesText);
      if (tokens.length < 16) {
        // Fallback: push original lines
        for (let k = blockStart; k < j; k++) {
          result.push(lines[k]);
        }
        i = j;
        continue;
      }

      // Token 5 (0-indexed) is the statement value (6th column)
      let stmtToken = tokens[5];
      // Remove surrounding single quotes
      if (stmtToken.startsWith("'") && stmtToken.endsWith("'")) {
        stmtToken = stmtToken.slice(1, -1);
      }
      const rawStmt = unescapeSQL(stmtToken);
      const { description, constraints, learningObjective } = parseStatement(rawStmt);

      const escDesc = escapeSQL(description);
      const escConstraints = escapeSQL(constraints);
      const escObj = escapeSQL(learningObjective);

      // Rebuild the INSERT with new columns
      const isFirstFile = filePath.includes('problems1');
      const insertLine = fullBlock.split('\n').find(l => l.includes('INSERT INTO problems'));
      const columnLine = isFirstFile
        ? `    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,\n    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme\n`
        : `    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,\n    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme\n`;

      // Rebuild VALUES with 18 params
      // Reconstruct the VALUES maintaining original formatting
      const originalVals = valuesText;
      // Build new values: keep all original values but replace statement (index 5) with description
      // and add constraints + learning_objective after statement
      const newVals = [];
      // Also need to rebuild raw_readme (last value) with description too, to match
      for (let v = 0; v < tokens.length; v++) {
        let val = tokens[v];
        if (v === 5) {
          // Replace statement with clean description
          val = `'${escDesc}'`;
        }
        if (v === 15) {
          // raw_readme — keep full original for reference, unchanged
        }
        newVals.push(val);
      }

      // Insert constraints and learning_objective after statement (position 5 → becomes 6, 7)
      // Current order: slug, module, type, language, title, statement, func_name, ...
      // New order: slug, module, type, language, title, statement, constraints, learning_objective, func_name, ...
      const beforeStmt = newVals.slice(0, 6);  // up to and including statement
      const afterStmt = newVals.slice(6);       // rest (func_name onwards)
      const reordered = [
        ...beforeStmt,
        constraints ? `'${escConstraints}'` : 'NULL',
        learningObjective ? `'${escObj}'` : 'NULL',
        ...afterStmt,
      ];

      const newBlock = `INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    ${reordered.join(',\n    ')}
) ON CONFLICT (slug) DO NOTHING;`;

      result.push(newBlock + '\n');
      i = j;
    } else {
      result.push(line);
      i++;
    }
  }

  const output = result.join('\n');
  writeFileSync(filePath, output, 'utf-8');
  console.log(`  Done. Wrote ${filePath}`);
}

function main() {
  const files = [
    resolve(root, 'migrations', '019_seed_problems1.sql'),
    resolve(root, 'migrations', '019_seed_problems2.sql'),
  ];
  for (const f of files) {
    transformFile(f);
  }
  console.log('Transformation complete.');
}

main();
