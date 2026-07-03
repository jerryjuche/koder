-- =============================================
-- ZeroJudge: 45 Professional Go Problems Seed
-- Modules: Math & Recursion, Arrays & Strings, Data Structures
-- Fully compatible with your schema
-- =============================================

INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES

-- ==================== MATH & RECURSION (15) ====================
('factorial', 'Math & Recursion', 'function', 'go', 'Factorial', 
 'Write a recursive function that returns the factorial of a non-negative integer n.', 
 'Factorial', 'int', ARRAY['int'], 
 ARRAY['0! is 1', 'Use recursion: n * Factorial(n-1)'], 1, 80, 
 ARRAY['recursion', 'math'], true, 'seed-math-factorial-1', 'Write a recursive function that returns the factorial of a non-negative integer n.'),

('fibonacci', 'Math & Recursion', 'function', 'go', 'Fibonacci Sequence', 
 'Return the nth Fibonacci number (F(0)=0, F(1)=1).', 
 'Fib', 'int', ARRAY['int'], 
 ARRAY['Base cases: 0 and 1', 'Recursive: Fib(n) = Fib(n-1) + Fib(n-2)'], 2, 100, 
 ARRAY['recursion', 'sequence'], true, 'seed-math-fibonacci-1', 'Return the nth Fibonacci number (F(0)=0, F(1)=1).'),

('sum-natural', 'Math & Recursion', 'function', 'go', 'Sum of First N Natural Numbers', 
 'Return sum of first n natural numbers using recursion.', 
 'SumNatural', 'int', ARRAY['int'], 
 ARRAY['Avoid using formula for learning purpose'], 1, 70, 
 ARRAY['math', 'recursion'], true, 'seed-math-sum-natural-1', 'Return sum of first n natural numbers using recursion.'),

('power', 'Math & Recursion', 'function', 'go', 'Power Function', 
 'Compute x raised to power n using recursion.', 
 'Power', 'int', ARRAY['int','int'], 
 ARRAY['Handle n=0 and negative exponents if possible'], 3, 120, 
 ARRAY['recursion', 'math'], true, 'seed-math-power-1', 'Compute x raised to power n using recursion.'),

('gcd', 'Math & Recursion', 'function', 'go', 'Greatest Common Divisor', 
 'Implement Euclidean algorithm recursively.', 
 'GCD', 'int', ARRAY['int','int'], 
 ARRAY['GCD(a,0) = a', 'GCD(a,b) = GCD(b, a%b)'], 2, 90, 
 ARRAY['math', 'recursion'], true, 'seed-math-gcd-1', 'Implement Euclidean algorithm recursively.'),

('is-prime', 'Math & Recursion', 'function', 'go', 'Prime Number Check', 
 'Check if a number is prime.', 
 'IsPrime', 'bool', ARRAY['int'], 
 ARRAY['Optimize by checking up to sqrt(n)'], 2, 95, 
 ARRAY['math', 'prime'], true, 'seed-math-is-prime-1', 'Check if a number is prime.'),

('sum-digits', 'Math & Recursion', 'function', 'go', 'Sum of Digits', 
 'Return the sum of digits of a positive integer using recursion.', 
 'SumDigits', 'int', ARRAY['int'], 
 ARRAY['Base case: single digit'], 1, 75, 
 ARRAY['math', 'recursion'], true, 'seed-math-sum-digits-1', 'Return the sum of digits of a positive integer using recursion.'),

('count-ways', 'Math & Recursion', 'function', 'go', 'Count Ways to Climb Stairs', 
 'Return the number of distinct ways to climb n stairs taking 1 or 2 steps at a time.', 
 'CountWays', 'int', ARRAY['int'], 
 ARRAY['Dynamic programming or recursion with memoization'], 3, 130, 
 ARRAY['recursion', 'dynamic-programming'], true, 'seed-math-count-ways-1', 'Return the number of distinct ways to climb n stairs taking 1 or 2 steps at a time.'),

('tribonacci', 'Math & Recursion', 'function', 'go', 'Tribonacci Sequence', 
 'Return the nth Tribonacci number (T(0)=0, T(1)=0, T(2)=1).', 
 'Tribonacci', 'int', ARRAY['int'], 
 ARRAY['Similar to Fibonacci but sum of previous 3'], 2, 105, 
 ARRAY['recursion', 'sequence'], true, 'seed-math-tribonacci-1', 'Return the nth Tribonacci number (T(0)=0, T(1)=0, T(2)=1).'),

('reverse-digits', 'Math & Recursion', 'function', 'go', 'Reverse Digits', 
 'Reverse the digits of an integer.', 
 'ReverseDigits', 'int', ARRAY['int'], 
 ARRAY['Handle negative numbers'], 2, 85, 
 ARRAY['math', 'recursion'], true, 'seed-math-reverse-digits-1', 'Reverse the digits of an integer.'),

('happy-number', 'Math & Recursion', 'function', 'go', 'Happy Number', 
 'Check if a number is happy (repeatedly replace with sum of squares of digits eventually reaches 1).', 
 'IsHappy', 'bool', ARRAY['int'], 
 ARRAY['Use Floyd''s cycle detection for optimization'], 3, 125, 
 ARRAY['math', 'recursion'], true, 'seed-math-happy-number-1', 'Check if a number is happy.'),

('ugly-number', 'Math & Recursion', 'function', 'go', 'Ugly Number', 
 'Check if a number is ugly (only prime factors 2, 3, 5).', 
 'IsUgly', 'bool', ARRAY['int'], 
 ARRAY['Divide by 2,3,5 until 1'], 2, 95, 
 ARRAY['math', 'recursion'], true, 'seed-math-ugly-number-1', 'Check if a number is ugly.'),

('super-pow', 'Math & Recursion', 'function', 'go', 'Super Pow', 
 'Compute a^(b1 b2 ... bn) mod 1337.', 
 'SuperPow', 'int', ARRAY['int','[]int'], 
 ARRAY['Use modular exponentiation'], 4, 160, 
 ARRAY['math', 'recursion'], true, 'seed-math-super-pow-1', 'Compute a^(b1 b2 ... bn) mod 1337.'),

('count-primes', 'Math & Recursion', 'function', 'go', 'Count Primes', 
 'Count the number of prime numbers less than n.', 
 'CountPrimes', 'int', ARRAY['int'], 
 ARRAY['Sieve of Eratosthenes'], 3, 140, 
 ARRAY['math', 'sieve'], true, 'seed-math-count-primes-1', 'Count the number of prime numbers less than n.'),

('nth-digit', 'Math & Recursion', 'function', 'go', 'Nth Digit', 
 'Find the nth digit of the infinite integer sequence 1 2 3 4 5 6 7 8 9 10 11 ...', 
 'FindNthDigit', 'int', ARRAY['int'], 
 ARRAY['Math-based solution'], 4, 155, 
 ARRAY['math', 'recursion'], true, 'seed-math-nth-digit-1', 'Find the nth digit of the infinite integer sequence.'),

-- ==================== ARRAYS & STRINGS (15) ====================
('two-sum', 'Arrays & Strings', 'function', 'go', 'Two Sum', 
 'Return indices of two numbers that add up to target. Exactly one solution.', 
 'TwoSum', '[]int', ARRAY['[]int','int'], 
 ARRAY['Use hashmap for O(n) solution'], 3, 140, 
 ARRAY['hashmap', 'arrays'], true, 'seed-arrays-two-sum-1', 'Return indices of two numbers that add up to target.'),

('reverse-string', 'Arrays & Strings', 'function', 'go', 'Reverse String', 
 'Reverse a string in place.', 
 'ReverseString', 'string', ARRAY['string'], 
 ARRAY['Convert to rune slice'], 1, 60, 
 ARRAY['strings', 'arrays'], true, 'seed-arrays-reverse-string-1', 'Reverse a string in place.'),

('binary-search', 'Arrays & Strings', 'function', 'go', 'Binary Search', 
 'Return index of target in sorted array or -1.', 
 'BinarySearch', 'int', ARRAY['[]int','int'], 
 ARRAY['Must be O(log n)'], 3, 130, 
 ARRAY['search', 'arrays'], true, 'seed-arrays-binary-search-1', 'Return index of target in sorted array or -1.'),

('max-subarray', 'Arrays & Strings', 'function', 'go', 'Maximum Subarray Sum', 
 'Find contiguous subarray with largest sum.', 
 'MaxSubArray', 'int', ARRAY['[]int'], 
 ARRAY['Kadane''s algorithm is optimal'], 4, 160, 
 ARRAY['arrays', 'dynamic-programming'], true, 'seed-arrays-max-subarray-1', 'Find contiguous subarray with largest sum.'),

('contains-duplicate', 'Arrays & Strings', 'function', 'go', 'Contains Duplicate', 
 'Check if array contains any duplicate values.', 
 'ContainsDuplicate', 'bool', ARRAY['[]int'], 
 ARRAY['HashSet approach is best'], 2, 85, 
 ARRAY['arrays', 'hashmap'], true, 'seed-arrays-contains-duplicate-1', 'Check if array contains any duplicate values.'),

('rotate-array', 'Arrays & Strings', 'function', 'go', 'Rotate Array', 
 'Rotate array to the right by k steps.', 
 'Rotate', '[]int', ARRAY['[]int','int'], 
 ARRAY['Handle k larger than array length'], 3, 135, 
 ARRAY['arrays', 'in-place'], true, 'seed-arrays-rotate-array-1', 'Rotate array to the right by k steps.'),

('move-zeroes', 'Arrays & Strings', 'function', 'go', 'Move Zeroes', 
 'Move all zeroes to the end while maintaining relative order.', 
 'MoveZeroes', '[]int', ARRAY['[]int'], 
 ARRAY['In-place solution'], 2, 90, 
 ARRAY['arrays', 'in-place'], true, 'seed-arrays-move-zeroes-1', 'Move all zeroes to the end while maintaining relative order.'),

('longest-substring', 'Arrays & Strings', 'function', 'go', 'Longest Substring Without Repeating Characters', 
 'Find length of longest substring without repeating characters.', 
 'LengthOfLongestSubstring', 'int', ARRAY['string'], 
 ARRAY['Sliding window + hashmap'], 5, 190, 
 ARRAY['strings', 'sliding-window'], true, 'seed-arrays-longest-substring-1', 'Find length of longest substring without repeating characters.'),

('palindrome', 'Arrays & Strings', 'function', 'go', 'Palindrome Check', 
 'Check if string is palindrome ignoring case and non-alphanumeric.', 
 'IsPalindrome', 'bool', ARRAY['string'], 
 ARRAY['Two pointer approach'], 2, 90, 
 ARRAY['strings', 'two-pointer'], true, 'seed-arrays-palindrome-1', 'Check if string is palindrome ignoring case and non-alphanumeric.'),

('group-anagrams', 'Arrays & Strings', 'function', 'go', 'Group Anagrams', 
 'Group anagrams together.', 
 'GroupAnagrams', '[][]string', ARRAY['[]string'], 
 ARRAY['Use sorted string as key'], 4, 155, 
 ARRAY['hashmap', 'strings'], true, 'seed-arrays-group-anagrams-1', 'Group anagrams together.'),

('merge-sorted', 'Arrays & Strings', 'function', 'go', 'Merge Sorted Arrays', 
 'Merge two sorted arrays into one sorted array in-place.', 
 'Merge', '[]int', ARRAY['[]int','[]int'], 
 ARRAY['Do not use built-in sort'], 3, 130, 
 ARRAY['arrays', 'sorting'], true, 'seed-arrays-merge-sorted-1', 'Merge two sorted arrays into one sorted array in-place.'),

('remove-duplicates', 'Arrays & Strings', 'function', 'go', 'Remove Duplicates from Sorted Array', 
 'Remove duplicates in-place and return new length.', 
 'RemoveDuplicates', 'int', ARRAY['[]int'], 
 ARRAY['Two pointer technique'], 2, 95, 
 ARRAY['arrays', 'in-place'], true, 'seed-arrays-remove-duplicates-1', 'Remove duplicates in-place and return new length.'),

('buy-sell-stock', 'Arrays & Strings', 'function', 'go', 'Best Time to Buy and Sell Stock', 
 'Find maximum profit from one transaction.', 
 'MaxProfit', 'int', ARRAY['[]int'], 
 ARRAY['Single pass solution'], 3, 140, 
 ARRAY['arrays', 'dynamic-programming'], true, 'seed-arrays-buy-sell-stock-1', 'Find maximum profit from one transaction.'),

('product-except-self', 'Arrays & Strings', 'function', 'go', 'Product of Array Except Self', 
 'Return product of all elements except self without division.', 
 'ProductExceptSelf', '[]int', ARRAY['[]int'], 
 ARRAY['Two pass solution'], 4, 165, 
 ARRAY['arrays', 'prefix-product'], true, 'seed-arrays-product-except-self-1', 'Return product of all elements except self without division.'),

('longest-consecutive', 'Arrays & Strings', 'function', 'go', 'Longest Consecutive Sequence', 
 'Find length of longest consecutive sequence in unsorted array.', 
 'LongestConsecutive', 'int', ARRAY['[]int'], 
 ARRAY['HashSet solution'], 4, 170, 
 ARRAY['arrays', 'hashset'], true, 'seed-arrays-longest-consecutive-1', 'Find length of longest consecutive sequence in unsorted array.'),

-- ==================== DATA STRUCTURES (15) ====================
('reverse-linked-list', 'Data Structures', 'function', 'go', 'Reverse Linked List', 
 'Reverse a singly linked list.', 
 'ReverseList', '*ListNode', ARRAY['*ListNode'], 
 ARRAY['Iterative and recursive both accepted'], 4, 150, 
 ARRAY['linkedlist', 'ds'], true, 'seed-ds-reverse-linked-list-1', 'Reverse a singly linked list.'),

('valid-parentheses', 'Data Structures', 'function', 'go', 'Valid Parentheses', 
 'Check if parentheses string is valid.', 
 'IsValid', 'bool', ARRAY['string'], 
 ARRAY['Use stack'], 3, 110, 
 ARRAY['stack', 'strings'], true, 'seed-ds-valid-parentheses-1', 'Check if parentheses string is valid.'),

('matrix-spiral', 'Data Structures', 'function', 'go', 'Spiral Matrix', 
 'Return elements in spiral order.', 
 'SpiralOrder', '[]int', ARRAY['[][]int'], 
 ARRAY['Handle rectangular matrices'], 4, 170, 
 ARRAY['matrix', 'arrays'], true, 'seed-ds-matrix-spiral-1', 'Return elements in spiral order.'),

('merge-two-sorted-lists', 'Data Structures', 'function', 'go', 'Merge Two Sorted Lists', 
 'Merge two sorted linked lists.', 
 'MergeTwoLists', '*ListNode', ARRAY['*ListNode','*ListNode'], 
 ARRAY['Iterative solution preferred'], 3, 130, 
 ARRAY['linkedlist', 'sorting'], true, 'seed-ds-merge-two-sorted-lists-1', 'Merge two sorted linked lists.'),

('binary-tree-inorder', 'Data Structures', 'function', 'go', 'Binary Tree Inorder Traversal', 
 'Return inorder traversal of binary tree.', 
 'InorderTraversal', '[]int', ARRAY['*TreeNode'], 
 ARRAY['Recursive and iterative solutions'], 3, 125, 
 ARRAY['tree', 'traversal'], true, 'seed-ds-binary-tree-inorder-1', 'Return inorder traversal of binary tree.'),

('max-depth-binary-tree', 'Data Structures', 'function', 'go', 'Maximum Depth of Binary Tree', 
 'Return the maximum depth of a binary tree.', 
 'MaxDepth', 'int', ARRAY['*TreeNode'], 
 ARRAY['Recursive solution'], 2, 100, 
 ARRAY['tree', 'recursion'], true, 'seed-ds-max-depth-binary-tree-1', 'Return the maximum depth of a binary tree.'),

('invert-binary-tree', 'Data Structures', 'function', 'go', 'Invert Binary Tree', 
 'Invert a binary tree.', 
 'InvertTree', '*TreeNode', ARRAY['*TreeNode'], 
 ARRAY['Recursive solution'], 3, 115, 
 ARRAY['tree', 'recursion'], true, 'seed-ds-invert-binary-tree-1', 'Invert a binary tree.'),

('validate-binary-search-tree', 'Data Structures', 'function', 'go', 'Validate Binary Search Tree', 
 'Check if a binary tree is a valid BST.', 
 'IsValidBST', 'bool', ARRAY['*TreeNode'], 
 ARRAY['Inorder traversal or recursive bounds'], 4, 160, 
 ARRAY['tree', 'bst'], true, 'seed-ds-validate-binary-search-tree-1', 'Check if a binary tree is a valid BST.'),

('kth-smallest', 'Data Structures', 'function', 'go', 'Kth Smallest Element in BST', 
 'Return the kth smallest element in a BST.', 
 'KthSmallest', 'int', ARRAY['*TreeNode','int'], 
 ARRAY['Inorder traversal'], 4, 155, 
 ARRAY['tree', 'bst'], true, 'seed-ds-kth-smallest-1', 'Return the kth smallest element in a BST.'),

('level-order', 'Data Structures', 'function', 'go', 'Binary Tree Level Order Traversal', 
 'Return level order traversal of binary tree.', 
 'LevelOrder', '[][]int', ARRAY['*TreeNode'], 
 ARRAY['Use queue'], 3, 135, 
 ARRAY['tree', 'bfs'], true, 'seed-ds-level-order-1', 'Return level order traversal of binary tree.'),

('symmetric-tree', 'Data Structures', 'function', 'go', 'Symmetric Tree', 
 'Check if a binary tree is symmetric.', 
 'IsSymmetric', 'bool', ARRAY['*TreeNode'], 
 ARRAY['Recursive mirror check'], 3, 120, 
 ARRAY['tree', 'recursion'], true, 'seed-ds-symmetric-tree-1', 'Check if a binary tree is symmetric.'),

('path-sum', 'Data Structures', 'function', 'go', 'Path Sum', 
 'Check if there is a root-to-leaf path summing to target.', 
 'HasPathSum', 'bool', ARRAY['*TreeNode','int'], 
 ARRAY['Recursive solution'], 3, 125, 
 ARRAY['tree', 'recursion'], true, 'seed-ds-path-sum-1', 'Check if there is a root-to-leaf path summing to target.'),

('construct-binary-tree', 'Data Structures', 'function', 'go', 'Construct Binary Tree from Preorder and Inorder', 
 'Build binary tree from preorder and inorder traversal.', 
 'BuildTree', '*TreeNode', ARRAY['[]int','[]int'], 
 ARRAY['Recursive solution'], 5, 190, 
 ARRAY['tree', 'recursion'], true, 'seed-ds-construct-binary-tree-1', 'Build binary tree from preorder and inorder traversal.'),

('lowest-common-ancestor', 'Data Structures', 'function', 'go', 'Lowest Common Ancestor of Binary Tree', 
 'Find the lowest common ancestor of two nodes.', 
 'LowestCommonAncestor', '*TreeNode', ARRAY['*TreeNode','*TreeNode','*TreeNode'], 
 ARRAY['Recursive solution'], 4, 165, 
 ARRAY['tree', 'recursion'], true, 'seed-ds-lowest-common-ancestor-1', 'Find the lowest common ancestor of two nodes.'),

('serialize-deserialize', 'Data Structures', 'function', 'go', 'Serialize and Deserialize Binary Tree', 
 'Serialize and deserialize a binary tree.', 
 'Serialize', 'string', ARRAY['*TreeNode'], 
 ARRAY['Preorder traversal with null markers'], 5, 200, 
 ARRAY['tree', 'serialization'], true, 'seed-ds-serialize-deserialize-1', 'Serialize and deserialize a binary tree.');

-- =============================================
-- TEST CASES (Sample — expand as needed)
-- =============================================

-- Factorial
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal)
SELECT id, '0'::jsonb, '1', false, 1 FROM problems WHERE slug = 'factorial'
UNION ALL
SELECT id, '5'::jsonb, '120', false, 2 FROM problems WHERE slug = 'factorial'
UNION ALL
SELECT id, '7'::jsonb, '5040', true, 3 FROM problems WHERE slug = 'factorial';

-- Two Sum
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal)
SELECT id, '[[2,7,11,15],9]'::jsonb, '[0,1]', false, 1 FROM problems WHERE slug = 'two-sum'
UNION ALL
SELECT id, '[[3,2,4],6]'::jsonb, '[1,2]', false, 2 FROM problems WHERE slug = 'two-sum';

-- Reverse Linked List
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal)
SELECT id, '[1,2,3,4,5]'::jsonb, '[5,4,3,2,1]', false, 1 FROM problems WHERE slug = 'reverse-linked-list';

-- Verification Query
SELECT module, COUNT(*) as problem_count 
FROM problems 
WHERE source_hash LIKE 'seed-%' 
GROUP BY module 
ORDER BY module;
