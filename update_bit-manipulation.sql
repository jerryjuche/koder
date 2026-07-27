-- Generated: 2026-07-27 14:03:15
-- Module: bit-manipulation
-- Problems: 15

UPDATE problems SET
	statement = '**Binary numbers** consist of bits that can have a value of either `0` or `1`. Bits with the value `1` are known as **set bits**, and counting them is one of the most fundamental operations in bit manipulation.

The total number of set bits in a binary number is commonly referred to as its **Hamming weight** or **population count**.

In this challenge, your task is to determine how many set bits are present in the binary representation of a non-negative integer.

Given an integer `n`, count every bit whose value is `1` and return the total.

This exercise reinforces several important programming concepts:

- Understanding the **binary representation** of integers.
- Inspecting bits one position at a time.
- Using **bitwise operations** to examine binary data.
- Maintaining a running count while processing information.

Counting set bits is widely used in **computer graphics**, **cryptography**, **compression algorithms**, **networking**, **error detection**, and many other areas of computer science.'
WHERE slug = 'count-set-bits';
UPDATE problems SET
	statement = '**Binary numbers** store information in individual bit positions, where each position represents a specific power of two. Retrieving the value of a single bit is a fundamental skill in low-level programming and binary data processing.

In this challenge, your task is to **retrieve** the value of a bit at a specified **0-indexed position**.

Given a non-negative integer `n` and a bit position `pos`, determine whether the bit at that position is `0` or `1`.

The position is counted from the **least significant bit**, where position `0` represents the rightmost bit (the 1s place).

Your function should return the bit value as an integer — either `0` or `1`.

This exercise reinforces several important programming concepts:

- Understanding how **binary numbers** are structured.
- Working with **0-indexed bit positions**.
- Using **bitwise operations** to extract information.
- Identifying the value of a single bit within a larger number.

Retrieving individual bits is a common operation in **device drivers**, **network protocol parsing**, **hardware registers**, **data serialization**, and any application that processes binary data at the bit level.'
WHERE slug = 'get-bit';
UPDATE problems SET
	statement = '**Binary numbers** allow individual bits to be modified independently. Setting a bit means changing its value to `1`, regardless of whether it was previously `0` or `1`, while leaving every other bit in the number unchanged.

This operation is fundamental to managing **flags**, **permissions**, **configuration registers**, and any compact representation of boolean state.

In this challenge, your task is to **set** a bit at a specified **0-indexed position**.

Given a non-negative integer `n` and a bit position `pos`, force the bit at that position to `1`.

If the target bit is already `1`, the value should remain unchanged.

Your function should return the resulting integer after setting the specified bit.

This exercise reinforces several important programming concepts:

- Understanding how **binary numbers** are represented.
- Working with **individual bit positions**.
- Creating and applying **bit masks**.
- Modifying a specific bit without affecting the remaining bits.

Setting individual bits is widely used in **embedded programming**, **operating systems**, **hardware interfaces**, **graphics programming**, and any application that efficiently manages binary state.'
WHERE slug = 'set-bit';
UPDATE problems SET
	statement = '**Binary numbers** are made up of individual bits, each representing a power of two. By modifying a single bit while leaving all others untouched, programs can efficiently manage flags, permissions, and compact pieces of state.

In this challenge, your task is to **clear** a bit at a specified **0-indexed position**.

Clearing a bit means forcing it to **`0`**, regardless of whether it was previously `0` or `1`. Every other bit in the number must remain unchanged.

Given a non-negative integer `n` and a bit position `pos`, return the resulting integer after clearing the bit at position `pos`.

This exercise reinforces several important programming concepts:

- Understanding how **binary numbers** are represented.
- Working with **individual bit positions**.
- Creating and applying **bit masks**.
- Modifying a specific bit without affecting the remaining bits.

Clearing bits is a common operation in **low-level programming**, **embedded systems**, **permission management**, **device drivers**, and many applications that rely on efficient binary state manipulation.'
WHERE slug = 'clear-bit';
UPDATE problems SET
	statement = '**Toggling a bit** means flipping its value from `0` to `1` or from `1` to `0` without affecting any of the other bits in the number. This operation is frequently used when switching configuration options, enabling or disabling flags, and efficiently changing binary state.

In this challenge, your task is to **toggle** a bit at a specified **0-indexed position**.

Given a non-negative integer `n` and a bit position `pos`, flip the value of the bit at that position.

If the bit is currently `0`, it should become `1`. If it is currently `1`, it should become `0`.

Every other bit in the number must remain unchanged.

Your function should return the resulting integer after toggling the specified bit.

This exercise reinforces several important programming concepts:

- Understanding how **binary numbers** are represented.
- Working with **bit positions** using zero-based indexing.
- Applying **bitwise XOR** to modify individual bits.
- Performing targeted updates without affecting surrounding data.

Bit toggling is widely used in **embedded programming**, **graphics engines**, **network communication**, **hardware interfaces**, **state machines**, and other performance-critical applications.'
WHERE slug = 'toggle-bit';
UPDATE problems SET
	statement = '**Powers of two** play a fundamental role in computer science because computers naturally operate using binary numbers. Values such as `1`, `2`, `4`, `8`, `16`, and `32` each have a unique binary representation containing exactly **one set bit**, making them especially efficient to recognize using bitwise operations.

In this challenge, your task is to determine whether a given integer is a **power of two** using bitwise operations rather than repeated multiplication or division.

Given an integer `n`, return whether it represents a valid power of two.

Remember that **zero** and all **negative numbers** are not powers of two.

Your function should return `true` if `n` is a power of two, or `false` otherwise.

This exercise reinforces several important programming concepts:

- Understanding the **binary representation** of integers.
- Identifying numbers that contain exactly **one set bit**.
- Using **bitwise operations** to solve mathematical problems.
- Applying binary reasoning instead of iterative arithmetic.

Checking for powers of two is a common operation in **memory allocation**, **buffer sizing**, **data alignment**, **graphics programming**, and many other systems where binary efficiency is essential.'
WHERE slug = 'is-power-of-two';
UPDATE problems SET
	statement = '**Binary patterns** can have interesting structural properties. One such property is **alternation**, where every pair of adjacent bits has a different value — a `0` is always followed by a `1`, and a `1` is always followed by a `0`.

Alternating bit patterns appear in signal encoding schemes, clock synchronization, and test pattern generation.

In this challenge, your task is to determine whether the binary representation of a positive integer has **alternating bits**.

Consider the binary representation of `n` **without leading zeros**. For the pattern to be alternating, no two adjacent bits may have the same value.

The alternation may start with either `0` or `1`.

Your function should return `true` if the binary representation has alternating bits, or `false` otherwise.

This exercise reinforces several important programming concepts:

- Analyzing the **binary pattern** of an integer.
- Comparing **adjacent bits** using shift and XOR operations.
- Understanding how XOR highlights differences between neighboring positions.
- Recognizing structural properties of binary sequences.

Alternating bit detection is used in **digital communication line coding**, **signal integrity testing**, **serial peripheral interfaces**, and **data stream synchronization**.'
WHERE slug = 'is-alternating-bits';
UPDATE problems SET
	statement = '**Comparing binary values** is a fundamental operation in computer science. Rather than comparing entire numbers, many algorithms compare them bit by bit to determine exactly where they differ.

The **Hamming distance** between two integers is the number of bit positions where their binary representations are different. Every position where one number has a `0` and the other has a `1` contributes one to the total distance.

In this challenge, your task is to determine the **Hamming distance** between two non-negative integers.

Given two integers `a` and `b`, compare their binary representations and count how many corresponding bit positions contain different values.

Your function should return the total number of differing bit positions.

This exercise reinforces several important programming concepts:

- Understanding the **binary representation** of integers.
- Comparing values using **bitwise operations**.
- Identifying positions where two binary values differ.
- Counting matching patterns while processing binary data.

Hamming distance is widely used in **error detection**, **error-correcting codes**, **digital communications**, **cryptography**, **genetics**, and many other fields where measuring differences between binary sequences is essential.'
WHERE slug = 'hamming-distance';
UPDATE problems SET
	statement = '**Finding unique values** within a collection is a common programming task. While many solutions rely on additional data structures such as hash maps or sets, certain properties of the bitwise XOR operator allow the same result to be achieved using constant extra space.

In this challenge, your task is to identify the only element that appears **exactly once** in a list where every other element appears **exactly twice**.

Given a list of integers, return the single value that has no matching duplicate.

Your solution should use **O(1)** additional space.

This exercise reinforces several important programming concepts:

- Understanding the properties of the **bitwise XOR** operator.
- Processing every element in a **list** exactly once.
- Eliminating duplicate values through binary operations.
- Designing efficient algorithms with minimal memory usage.

Finding unique values using XOR is a classic interview problem and demonstrates how mathematical properties of binary operations can replace additional data structures in performance-critical applications.'
WHERE slug = 'single-number';
UPDATE problems SET
	statement = '**Missing element problems** appear frequently in data validation, audit trails, and sequence verification. Given a collection of `n` distinct integers drawn from the range `[0, n]`, exactly one value from that range is absent.

In this challenge, your task is to find the **missing value** using bitwise XOR operations.

You are given a list `nums` of length `n` containing distinct integers from `0` to `n`, with exactly one value omitted.

Your solution should run in **O(n)** time and use **O(1)** extra space.

This exercise reinforces several important programming concepts:

- Cancelling out paired elements using **XOR**.
- Using the property `x ^ x = 0` to eliminate known values.
- Solving in-place problems with constant space.
- Recognizing the XOR approach as an alternative to summation formulas.

The missing number technique is relevant to **data stream verification**, **file integrity checks**, **RAID parity calculations**, and **memory consistency validation**.'
WHERE slug = 'missing-number-xor';
UPDATE problems SET
	statement = '**Bits** have a specific order within a binary number, with each position representing a different power of two. Reversing the order of these bits creates a completely different binary value and is a common operation in low-level programming and digital systems.

In this challenge, your task is to **reverse the order of the bits** in an **8-bit unsigned integer**.

Given an integer `n` between `0` and `255`, treat it as an 8-bit binary value, including any leading zeros. Reverse the order of all eight bits and return the integer represented by the reversed bit pattern.

Your function should return the decimal value corresponding to the reversed 8-bit binary representation.

This exercise reinforces several important programming concepts:

- Understanding **fixed-width binary representations**.
- Manipulating individual **bit positions**.
- Converting between **binary** and **decimal** values.
- Transforming binary data while preserving its bit count.

Bit reversal is commonly used in **signal processing**, **cryptography**, **compression algorithms**, **hardware design**, and **Fast Fourier Transform (FFT)** implementations.'
WHERE slug = 'reverse-bits-8';
UPDATE problems SET
	statement = '**Swapping two values** is one of the most common operations in programming. While it is typically performed using a temporary variable, bitwise operations make it possible to exchange two values without allocating any additional storage.

In this challenge, your task is to swap two integers using **only XOR operations**.

Given two integers `a` and `b`, conceptually exchange their values without using a temporary variable or arithmetic operations such as addition or subtraction.

Your function should return the swapped values as a list in the order `[b, a]`.

This exercise reinforces several important programming concepts:

- Understanding the properties of the **bitwise XOR** operator.
- Manipulating binary values without additional memory.
- Following a sequence of transformations to preserve data.
- Appreciating classic low-level programming techniques.

Although modern compilers typically optimize ordinary swaps efficiently, the XOR swap remains a classic example of bitwise reasoning and is often discussed in systems programming, technical interviews, and computer architecture.'
WHERE slug = 'swap-xor';
UPDATE problems SET
	statement = '**Counting set bits** for a single number is straightforward, but extending the same idea across an entire range introduces a more interesting computational challenge.

Instead of examining just one integer, this problem requires you to consider **every integer from `1` through `n`**, determine how many set bits each one contains, and combine those counts into a single total.

In this challenge, your task is to calculate the total number of **set bits** that appear in the binary representations of all integers from `1` to `n` (inclusive).

If `n` is `0`, there are no numbers to process, so the result should be **`0`**.

This exercise reinforces several important programming concepts:

- Iterating over a **range of integers**.
- Working with the **binary representation** of numbers.
- Applying **bitwise operations** repeatedly.
- Recognizing opportunities to optimize repeated computations.

Counting bits across a range appears in algorithm design, competitive programming, performance optimization, and problems involving binary analysis and combinatorics.'
WHERE slug = 'count-set-bits-up-to';
UPDATE problems SET
	statement = '**Duplicate values** are common in many datasets, but occasionally one or more values appear only once. Efficiently identifying these unique values without additional memory is a classic application of bitwise XOR.

This problem extends the classic Single Number challenge — instead of one unique element, there are now **two**.

In this challenge, your task is to find the **two integers** that appear exactly once in a list where every other element appears **exactly twice**.

Given a list of integers, return the two unique values sorted in **ascending order**.

Your solution should use **O(1)** additional space beyond the returned result.

This exercise reinforces several important programming concepts:

- Understanding the properties of the **bitwise XOR** operator.
- Processing collections efficiently in a single pass.
- Partitioning data based on individual **bit values**.
- Designing algorithms that minimize additional memory usage.

This problem is a classic extension of the Single Number challenge and demonstrates how bitwise operations can isolate multiple unique values in an efficient and elegant way.'
WHERE slug = 'two-single-numbers';
UPDATE problems SET
	statement = '**Subsets** are one of the most important concepts in combinatorics and algorithm design. A subset is any collection of elements chosen from a list, including the empty subset and the subset containing every element.

For each subset, its **XOR total** is obtained by applying the bitwise XOR operation to all of its elements. The XOR total of the empty subset is defined as `0`.

In this challenge, your task is to calculate the **sum of the XOR totals** of every possible subset of a given list.

Given a list of integers `nums`, generate every possible subset, compute the XOR value for each one, and return the sum of all those XOR values.

Your function should return the total XOR sum across every subset.

This exercise reinforces several important programming concepts:

- Understanding **subsets** and combinatorial enumeration.
- Applying the **bitwise XOR** operation across multiple values.
- Solving problems using recursion, backtracking, or bitmasking.
- Combining results from multiple computations into a single final answer.

Subset enumeration is a fundamental technique used in dynamic programming, search algorithms, optimization problems, cryptography, and many other areas of computer science.'
WHERE slug = 'subset-xor-sum';
