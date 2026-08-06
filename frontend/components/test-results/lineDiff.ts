// Two-column aligned line diff. Every row pairs one "your output" line with one
// "expected" line (1:1 for matching runs); mismatched or shifted lines get a
// null slot on the side that has nothing to pair, mirroring the classic
// side-by-side merge view instead of the ambiguous unified `-`/`+` stream.
export type DiffRow = {
  gotLine: string | null;
  wantLine: string | null;
  match: boolean;
};

export function computeAlignedLineDiff(got: string, want: string): DiffRow[] {
  const gotLines = got.split("\n");
  const wantLines = want.split("\n");
  const m = gotLines.length;
  const n = wantLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (gotLines[i - 1] === wantLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const temp: DiffRow[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && gotLines[i - 1] === wantLines[j - 1]) {
      temp.push({ gotLine: gotLines[i - 1], wantLine: wantLines[j - 1], match: true });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ gotLine: null, wantLine: wantLines[j - 1], match: false });
      j--;
    } else {
      temp.push({ gotLine: gotLines[i - 1], wantLine: null, match: false });
      i--;
    }
  }

  const rows: DiffRow[] = new Array(temp.length);
  for (let k = 0; k < temp.length; k++) {
    rows[k] = temp[temp.length - 1 - k];
  }
  return rows;
}

export function countDiffLines(rows: DiffRow[]): number {
  return rows.filter((r) => !r.match).length;
}
