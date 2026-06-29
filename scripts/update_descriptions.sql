UPDATE problems
SET statement = $$# Reverse String

**Objective**
Given an input string, return a new string with the characters in reverse order.

**Details**
In Go, strings are UTF-8 encoded and immutable. This means you cannot simply reverse the bytes of a string without potentially breaking multi-byte characters (runes). You must carefully iterate over the string as a sequence of runes, build the reversed sequence, and construct a new string from the result.

**Considerations**
- An empty string should return an empty string.
- A single-character string should return itself.
- Ensure that multi-byte characters (such as emojis or accented letters) are not split or corrupted during the reversal process.

**Examples**
- **Example 1:**
  - **Input:** `s = "hello"`
  - **Output:** `"olleh"`
  - **Explanation:** The string is reversed perfectly character by character.
- **Example 2:**
  - **Input:** `s = "racecar"`
  - **Output:** `"racecar"`
  - **Explanation:** This is a palindrome, so the reversed string is identical to the original.

**Solve Time Estimate**
~15 minutes
$$
WHERE slug = 'reverse-string';

UPDATE problems
SET statement = $$# Prime Checker

**Objective**
Determine whether a given positive integer is a prime number. Return `true` if it is prime, and `false` otherwise.

**Details**
A prime number is a natural number greater than $1$ that has no positive divisors other than $1$ and itself. The first few prime numbers are $2, 3, 5, 7, 11, 13, 17, 19, 23, 29$.
Your implementation should efficiently check for primality. A naive approach iterates up to $n-1$, but an optimal approach only requires checking up to $\lfloor\sqrt{n}\rfloor$.

**Considerations**
- $1$ is not a prime number.
- $2$ is the only even prime number; all other even numbers greater than $2$ are composite.
- Consider edge cases where $n$ is very small.

**Examples**
- **Example 1:**
  - **Input:** `n = 2`
  - **Output:** `true`
  - **Explanation:** 2 is the first prime number and the only even prime.
- **Example 2:**
  - **Input:** `n = 15`
  - **Output:** `false`
  - **Explanation:** 15 is divisible by 3 and 5.
- **Example 3:**
  - **Input:** `n = 1`
  - **Output:** `false`
  - **Explanation:** By definition, 1 is not considered a prime number.

**Solve Time Estimate**
~15 minutes
$$
WHERE slug = 'is-prime';

UPDATE problems
SET statement = $$# Sum Even Numbers

**Objective**
Calculate the sum of all even integers within a provided slice. Return $0$ if the slice is empty or contains no even numbers.

**Details**
This problem requires you to iterate over a collection of integers, filter out the odd numbers, and accumulate the sum of the even ones. An integer $n$ is even if $n \pmod 2 = 0$.

**Considerations**
- The input slice may contain negative numbers. Ensure your parity check handles negative values correctly (e.g., $-4 \pmod 2 = 0$).
- An empty slice should gracefully yield a sum of $0$.

**Examples**
- **Example 1:**
  - **Input:** `nums = [1, 2, 3, 4, 5]`
  - **Output:** `6`
  - **Explanation:** The even numbers are 2 and 4. Their sum is 6.
- **Example 2:**
  - **Input:** `nums = [-2, -4, 1, 3]`
  - **Output:** `-6`
  - **Explanation:** The even numbers are -2 and -4, and they sum to -6.

**Solve Time Estimate**
~15 minutes
$$
WHERE slug = 'sum-even-numbers';

UPDATE problems
SET statement = $$# Merge Sorted Arrays

**Objective**
Given two sorted integer slices, merge them into a single sorted slice containing all elements from both inputs in ascending order.

**Details**
Since both input arrays are already sorted, you can achieve an optimal $O(N+M)$ time complexity using a two-pointer approach. Maintain a pointer for each slice, compare the current elements, and append the smaller one to your result slice. 

**Considerations**
- Either or both of the input arrays might be empty.
- The arrays may contain duplicate values.
- Do not use built-in sorting functions (e.g., `sort.Ints()`); leverage the pre-sorted nature of the inputs to build the merged array efficiently.

**Examples**
- **Example 1:**
  - **Input:** `arr1 = [1, 3, 5], arr2 = [2, 4, 6]`
  - **Output:** `[1, 2, 3, 4, 5, 6]`
  - **Explanation:** We repeatedly pick the smaller of the two pointer values until both arrays are exhausted.
- **Example 2:**
  - **Input:** `arr1 = [], arr2 = [7, 8]`
  - **Output:** `[7, 8]`
  - **Explanation:** Because arr1 is empty, we just return the elements of arr2.

**Solve Time Estimate**
~25 minutes
$$
WHERE slug = 'merge-sorted-arrays';

UPDATE problems
SET statement = $$# Word Frequency

**Objective**
Count the frequency of each word in a given sentence and return the result as a map. 

**Details**
Text processing is a fundamental skill. For this task, you must:
1. Split the sentence into individual words using spaces as delimiters.
2. Normalize all words to lowercase so that "Hello" and "hello" are treated equally.
3. Remove any leading or trailing punctuation from each word.
4. Tally the occurrences of each normalized word in a map.

**Considerations**
- Empty tokens resulting from consecutive spaces should be ignored.
- Punctuation to strip typically includes characters like `.`, `,`, `!`, `?`.

**Examples**
- **Example 1:**
  - **Input:** `sentence = "Hello hello world"`
  - **Output:** `{"hello": 2, "world": 1}`
  - **Explanation:** "Hello" is normalized to "hello", making its count 2.
- **Example 2:**
  - **Input:** `sentence = "Go is great!"`
  - **Output:** `{"go": 1, "is": 1, "great": 1}`
  - **Explanation:** The '!' is stripped from "great!", isolating the word "great".

**Solve Time Estimate**
~30 minutes
$$
WHERE slug = 'word-frequency';

UPDATE problems
SET statement = $$# Matrix Diagonal Sum

**Objective**
Given a square integer matrix (a 2D slice of size $n \times n$), calculate the sum of the elements located on the main diagonal.

**Details**
The main diagonal of a matrix consists of the elements extending from the top-left corner to the bottom-right corner. Mathematically, these are the elements where the row index equals the column index (i.e., `matrix[i][i]`).

**Considerations**
- The matrix is guaranteed to be square ($n \times n$).
- Avoid nested loops; you only need to iterate over the dimension $n$ once.
- A $1 \times 1$ matrix should simply return its only element.

**Examples**
- **Example 1:**
  - **Input:** `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`
  - **Output:** `15`
  - **Explanation:** The main diagonal includes 1, 5, and 9. Their sum is 15.
- **Example 2:**
  - **Input:** `matrix = [[5, 0], [0, 5]]`
  - **Output:** `10`
  - **Explanation:** The elements 5 and 5 are on the diagonal.

**Solve Time Estimate**
~20 minutes
$$
WHERE slug = 'matrix-diagonal-sum';

UPDATE problems
SET statement = $$# Rotate Matrix

**Objective**
Rotate a given $n \times n$ square matrix by 90 degrees in a clockwise direction. Return the newly rotated matrix without modifying the original input.

**Details**
Matrix rotation is commonly used in image processing algorithms. A 90-degree clockwise rotation maps the element at `matrix[i][j]` to `rotated[j][n-1-i]`. 

Alternatively, a matrix can be rotated clockwise by first transposing it (swapping rows and columns) and then reversing the elements of each row.

**Considerations**
- Allocate a new 2D slice for the result; do not mutate the input array (out-of-place rotation).
- The matrix is guaranteed to be a square.

**Examples**
- **Example 1:**
  - **Input:** `matrix = [[1, 2], [3, 4]]`
  - **Output:** `[[3, 1], [4, 2]]`
  - **Explanation:** 
    1 becomes the top-right, 2 becomes the bottom-right, 3 becomes the top-left, and 4 becomes the bottom-left.
- **Example 2:**
  - **Input:** `matrix = [[42]]`
  - **Output:** `[[42]]`
  - **Explanation:** A 1x1 matrix remains unchanged when rotated.

**Solve Time Estimate**
~35 minutes
$$
WHERE slug = 'rotate-matrix';

UPDATE problems
SET statement = $$# Balanced Parentheses

**Objective**
Determine if a string contains correctly matched and nested parentheses and brackets. Supported pairs are `()`, `[]`, and `{}`.

**Details**
You must verify that every opening bracket has a corresponding closing bracket of the exact same type, and that they are closed in the correct order. 
This problem is best solved using a Stack data structure. As you iterate through the string, push opening brackets onto the stack. When you encounter a closing bracket, check if it matches the bracket at the top of the stack.

**Considerations**
- Ignore any characters that are not parentheses or brackets.
- The string is considered unbalanced if you encounter a closing bracket when the stack is empty, or if the stack is not empty after processing the entire string.
- An empty string (or a string with no brackets) is considered balanced.

**Examples**
- **Example 1:**
  - **Input:** `s = "()[]{}"`
  - **Output:** `true`
  - **Explanation:** All brackets are closed correctly in sequential order.
- **Example 2:**
  - **Input:** `s = "([)]"`
  - **Output:** `false`
  - **Explanation:** The round bracket `)` appears before the square bracket `]` is closed.

**Solve Time Estimate**
~30 minutes
$$
WHERE slug = 'balanced-parentheses';

UPDATE problems
SET statement = $$# Longest Common Prefix

**Objective**
Find the longest common prefix string shared among an array of strings. If there is no common prefix, return an empty string.

**Details**
A common prefix is a substring at the very beginning of a string that appears identically across all strings in a dataset. 
You can solve this by comparing characters column by column across all strings, stopping at the first column where a mismatch occurs or when you reach the end of the shortest string.

**Considerations**
- If the input array is empty, return `""`.
- If the array contains only one string, that string itself is the longest common prefix.

**Examples**
- **Example 1:**
  - **Input:** `strs = ["flower", "flow", "flight"]`
  - **Output:** `"fl"`
  - **Explanation:** All three strings begin with the letters "fl".
- **Example 2:**
  - **Input:** `strs = ["dog", "racecar", "car"]`
  - **Output:** `""`
  - **Explanation:** There is no common prefix among these strings.

**Solve Time Estimate**
~25 minutes
$$
WHERE slug = 'longest-common-prefix';

UPDATE problems
SET statement = $$# Two Sum Indices

**Objective**
Given a slice of integers and a target integer, return the indices of the two numbers that add up to the target.

**Details**
You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.
While a brute-force $O(N^2)$ solution checks every pair, an optimal $O(N)$ solution uses a Hash Map to store the indices of the numbers you have seen so far, allowing you to check if the complement (`target - current_number`) exists in constant time.

**Considerations**
- The input slice may contain negative numbers.
- Exactly one valid pair is guaranteed to exist.

**Examples**
- **Example 1:**
  - **Input:** `nums = [2, 7, 11, 15], target = 9`
  - **Output:** `[0, 1]`
  - **Explanation:** nums[0] + nums[1] = 2 + 7 = 9.
- **Example 2:**
  - **Input:** `nums = [3, 2, 4], target = 6`
  - **Output:** `[1, 2]`
  - **Explanation:** nums[1] + nums[2] = 2 + 4 = 6.

**Solve Time Estimate**
~35 minutes
$$
WHERE slug = 'two-sum-indices';

UPDATE problems
SET statement = $$# Edit Distance

**Objective**
Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.

**Details**
This is a classic problem in computer science, known as the Levenshtein distance. You are permitted three operations on a string:
1. Insert a character
2. Delete a character
3. Replace a character

This problem exhibits optimal substructure and overlapping subproblems, making it a perfect candidate for Dynamic Programming. 
Let `DP[i][j]` represent the minimum edit distance between the first `i` characters of `word1` and the first `j` characters of `word2`.
- If the characters match (`word1[i-1] == word2[j-1]`), no operation is needed, so `DP[i][j] = DP[i-1][j-1]`.
- Otherwise, you must perform an operation, leading to `DP[i][j] = 1 + min(insert, delete, replace)`.

**Considerations**
- Base cases: When one string is empty, the edit distance is the length of the other string (all insertions).
- Be mindful of string indexing versus DP table indexing (which usually is 1-based to handle empty prefixes).

**Examples**
- **Example 1:**
  - **Input:** `word1 = "horse", word2 = "ros"`
  - **Output:** `3`
  - **Explanation:**
    1. horse -> rorse (replace 'h' with 'r')
    2. rorse -> rose (delete 'r')
    3. rose -> ros (delete 'e')
- **Example 2:**
  - **Input:** `word1 = "intention", word2 = "execution"`
  - **Output:** `5`
  - **Explanation:**
    1. intention -> inention (delete 't')
    2. inention -> enention (replace 'i' with 'e')
    3. enention -> exention (replace 'n' with 'x')
    4. exention -> exection (replace 'n' with 'c')
    5. exection -> execution (insert 'u')
- **Example 3:**
  - **Input:** `word1 = "", word2 = "a"`
  - **Output:** `1`
  - **Explanation:** insert 'a'.

**Solve Time Estimate**
~60 minutes
$$
WHERE slug = 'edit-distance';
