// Splits two single-line values into common prefix / differing core / common
// suffix segments so the differing characters can be highlighted in-place.
export type CharDiff = {
  gotPrefix: string;
  gotDiff: string;
  gotSuffix: string;
  wantPrefix: string;
  wantDiff: string;
  wantSuffix: string;
};

export function charDiff(got: string, want: string): CharDiff {
  const maxP = Math.min(got.length, want.length);
  let prefix = 0;
  while (prefix < maxP && got[prefix] === want[prefix]) prefix++;

  const maxS = Math.min(got.length, want.length) - prefix;
  let suffix = 0;
  while (
    suffix < maxS &&
    got[got.length - 1 - suffix] === want[want.length - 1 - suffix]
  ) {
    suffix++;
  }

  return {
    gotPrefix: got.slice(0, prefix),
    gotDiff: got.slice(prefix, got.length - suffix),
    gotSuffix: got.slice(got.length - suffix),
    wantPrefix: want.slice(0, prefix),
    wantDiff: want.slice(prefix, want.length - suffix),
    wantSuffix: want.slice(want.length - suffix),
  };
}
