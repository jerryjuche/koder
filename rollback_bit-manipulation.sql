-- ROLLBACK — Generated: 2026-07-27 14:03:15
-- Module: bit-manipulation
-- Problems: 15

UPDATE problems SET
	statement = 'Write a function that returns the number of set bits (1s) in the binary representation of a non-negative integer `n`. This is also known as the Hamming weight of `n`.',
	param_names = '{}'
WHERE slug = 'count-set-bits';
UPDATE problems SET
	statement = 'Write a function `GetBit(n, pos int) int` that returns the bit of `n` at 0-indexed position `pos` (counting from the least significant bit), as either 0 or 1.',
	param_names = '{}'
WHERE slug = 'get-bit';
UPDATE problems SET
	statement = 'Write a function `SetBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` set to 1, leaving all other bits unchanged.',
	param_names = '{}'
WHERE slug = 'set-bit';
UPDATE problems SET
	statement = 'Write a function `ClearBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` cleared to 0, leaving all other bits unchanged.',
	param_names = '{}'
WHERE slug = 'clear-bit';
UPDATE problems SET
	statement = 'Write a function `ToggleBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` flipped: 0 becomes 1 and 1 becomes 0, while all other bits stay the same.',
	param_names = '{}'
WHERE slug = 'toggle-bit';
UPDATE problems SET
	statement = 'Write a function that determines whether an integer `n` is a power of two, using bitwise operations rather than repeated division.',
	param_names = '{}'
WHERE slug = 'is-power-of-two';
UPDATE problems SET
	statement = 'Write a function that determines whether the binary representation of a positive integer `n` has alternating bits — meaning no two adjacent bits have the same value.',
	param_names = '{}'
WHERE slug = 'is-alternating-bits';
UPDATE problems SET
	statement = 'Write a function `HammingDistance(a, b int) int` that returns the number of bit positions at which the binary representations of `a` and `b` differ.',
	param_names = '{}'
WHERE slug = 'hamming-distance';
UPDATE problems SET
	statement = 'Every element in a slice `nums` appears exactly twice, except for one element which appears exactly once. Write a function that finds and returns that single element, using O(1) extra space.',
	param_names = '{}'
WHERE slug = 'single-number';
UPDATE problems SET
	statement = 'A slice `nums` contains `n` distinct integers taken from the range `[0, n]`, meaning exactly one value in that range is missing from `nums`. Write a function that finds the missing value using XOR, in O(n) time and O(1) extra space.',
	param_names = '{}'
WHERE slug = 'missing-number-xor';
UPDATE problems SET
	statement = 'Write a function `ReverseBits8(n int) int` that treats `n` as an 8-bit unsigned integer and returns the value obtained by reversing the order of its 8 bits.',
	param_names = '{}'
WHERE slug = 'reverse-bits-8';
UPDATE problems SET
	statement = 'Write a function `SwapXOR(a, b int) []int` that returns `[a, b]` after conceptually swapping their values using only XOR operations (no temporary variable, no arithmetic addition/subtraction).',
	param_names = '{}'
WHERE slug = 'swap-xor';
UPDATE problems SET
	statement = 'Write a function `CountSetBitsUpTo(n int) int` that returns the total number of set bits across the binary representations of every integer from 1 to `n` (inclusive). Return 0 if `n` is 0.',
	param_names = '{}'
WHERE slug = 'count-set-bits-up-to';
UPDATE problems SET
	statement = 'Every element in a slice `nums` appears exactly twice, except for exactly two elements which each appear exactly once. Write a function that returns those two elements, sorted in ascending order, using O(1) extra space beyond the output.',
	param_names = '{}'
WHERE slug = 'two-single-numbers';
UPDATE problems SET
	statement = 'For a slice `nums`, the XOR total of a subset is the XOR of all its elements (0 for the empty subset). Write a function that returns the sum, over every possible subset of `nums`, of that subset''s XOR total.',
	param_names = '{}'
WHERE slug = 'subset-xor-sum';
