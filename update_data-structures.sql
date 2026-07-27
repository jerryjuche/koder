-- Generated: 2026-07-27 14:26:46
-- Module: data-structures
-- Problems: 15

UPDATE problems SET
	statement = 'A **stack** is a linear data structure that follows the **Last-In, First-Out (LIFO)** principle. The most recently added element is always the first one available for removal, making the top of the stack the most recently pushed value.

In this challenge, your task is to determine the value currently at the **top of the stack** after a sequence of push operations.

The input is a list representing values pushed onto an initially empty stack in the order they were received.

Your function should return the value at the top of the stack after all pushes have been completed.

If no values were pushed, return **`-1`**.

This exercise reinforces several important programming concepts:

* Understanding the **Last-In, First-Out (LIFO)** behavior of stacks.
* Working with ordered collections.
* Identifying the most recently inserted element.
* Handling edge cases involving **empty data structures**.

Stacks are fundamental data structures used in function calls, expression evaluation, undo systems, browser navigation, compiler design, and many other software applications.'
WHERE slug = 'min-in-stack';
UPDATE problems SET
	statement = 'A **queue** is a linear data structure that follows the **First-In, First-Out (FIFO)** principle. The earliest element added to the queue is always the first one removed.

In this challenge, your task is to determine which value remains at the **front of the queue** after performing a specified number of dequeue operations.

The input consists of a list representing values enqueued into an initially empty queue and an integer indicating how many dequeue operations are performed afterward.

Your function should return the value currently at the **front** of the queue.

If the queue becomes empty after the dequeue operations, return **`-1`**.

This exercise reinforces several important programming concepts:

* Understanding the **First-In, First-Out (FIFO)** behavior of queues.
* Simulating queue operations.
* Accessing elements after removing items from the front.
* Handling situations where a data structure becomes **empty**.

Queues are widely used in scheduling systems, operating systems, networking, task processing, simulations, and many other real-world applications.'
WHERE slug = 'queue-front-after-dequeues';
UPDATE problems SET
	statement = 'Parentheses, brackets, and braces are commonly used to group expressions and represent nested structures in programming languages, mathematical notation, and markup formats. Ensuring that these symbols are **properly matched** is a fundamental problem in parsing and syntax validation.

In this challenge, your task is to determine whether a string containing only parentheses, square brackets, and curly braces is **valid**.

A string is considered valid if every **opening bracket** is closed by the **same type** of bracket, and every pair of brackets is closed in the **correct nested order**.

Your function should return **`true`** if the entire string is valid, or **`false`** otherwise.

This exercise reinforces several important programming concepts:

* Using a **stack** to track nested structures.
* Matching pairs of opening and closing symbols.
* Processing strings one character at a time.
* Validating structured input.

Bracket matching is a core algorithm used in compilers, code editors, syntax highlighters, interpreters, expression evaluators, and many other software systems.'
WHERE slug = 'valid-parentheses';
UPDATE problems SET
	statement = 'A **queue** is a linear data structure that follows the **First-In, First-Out (FIFO)** principle. Elements are added to the **back** of the queue and removed from the **front**, preserving the order in which they were inserted.

In this challenge, your task is to simulate a sequence of **queue operations**.

Each operation is provided as a string command. An **`enqueue x`** command inserts the integer `x` at the back of the queue, while a **`dequeue`** command removes the element currently at the front of the queue.

Process every operation in the order given, then return the **final contents** of the queue from front to back.

If a dequeue operation is performed while the queue is already empty, simply ignore it.

This exercise reinforces several important programming concepts:

* Understanding the **FIFO** behavior of queues.
* Simulating operations on a dynamic data structure.
* Processing commands sequentially.
* Updating and maintaining the state of a collection.

Queue simulation is widely used in operating systems, scheduling algorithms, networking, event processing, messaging systems, and many other real-world applications.'
WHERE slug = 'simulate-queue-ops';
UPDATE problems SET
	statement = 'A **linked list** stores its elements as a sequence of connected nodes, where each node points to the next one in the chain. Reversing this sequence is one of the most fundamental operations performed on linked lists and serves as the foundation for many more advanced algorithms.

In this challenge, your task is to **reverse the order** of a linked list.

For simplicity, the linked list is represented as a list of values in **head-to-tail order**, rather than as individual linked nodes. Your goal is to produce a new sequence representing how the list would appear after every connection has been reversed.

Your function should return the values of the linked list in **reverse traversal order**.

This exercise reinforces several important programming concepts:

* Understanding the structure of **linked lists**.
* Reversing the order of a sequence.
* Building a new collection from existing data.
* Solving a classic data structure problem.

Linked list reversal is one of the most common interview questions and is widely used in memory management, data processing, recursive algorithms, and many other software engineering applications.'
WHERE slug = 'reverse-linked-list-array';
UPDATE problems SET
	statement = 'A **sorted linked list** stores its values in non-decreasing order, which means any duplicate values always appear next to one another. This property allows duplicates to be removed efficiently in a single traversal.

In this challenge, your task is to remove every duplicate value from a **sorted linked list**, ensuring that each distinct value appears exactly once.

For simplicity, the linked list is represented as a list of values in **head-to-tail order**.

Your function should return a new list containing the values of the linked list after all duplicates have been removed.

This exercise reinforces several important programming concepts:

* Working with **sorted linked lists**.
* Identifying **adjacent duplicate** values.
* Building a new collection while preserving the original order.
* Traversing data efficiently in a **single pass**.

Removing duplicates from sorted data is a common operation in database systems, search indexing, data cleaning, and many other real-world applications.'
WHERE slug = 'remove-dup-linked-list';
UPDATE problems SET
	statement = 'A **linked list** is a linear data structure where each node points to the next node in the sequence. Unlike arrays, linked lists do not provide direct access by index, making certain traversal techniques especially valuable.

In this challenge, your task is to find the **middle node** of a linked list.

For simplicity, the linked list is represented as a list of values in **head-to-tail order**. If the list contains an odd number of nodes, return the value of the single middle node. If the list contains an **even number** of nodes, return the value of the **second middle node**.

Your function should return the value stored in the required middle node.

This exercise reinforces several important programming concepts:

* Understanding the structure of **linked lists**.
* Applying the **slow and fast pointer** technique.
* Traversing a sequence efficiently in a **single pass**.
* Solving position-based problems without relying on indexing.

Finding the middle of a linked list is a classic interview problem and is widely used in linked list algorithms, cycle detection, recursive splitting, and merge sort implementations.'
WHERE slug = 'middle-element';
UPDATE problems SET
	statement = 'A **linked list** is a sequence of nodes where each node points to the next one in the chain. Normally, following these links eventually reaches the end of the list. However, an incorrect connection can cause the list to loop back to an earlier node, creating a **cycle** that can result in infinite traversal.

In this challenge, your task is to determine whether a linked list contains a **cycle**.

The linked list is represented by a **`next`** array, where `next[i]` stores the index of the node that follows node `i`. A value of **`-1`** indicates that the node has no successor and marks the end of the list.

Starting from the given node, determine whether repeatedly following the links eventually revisits a previously visited node.

Your function should return **`true`** if the list contains a cycle, or **`false`** otherwise.

This exercise reinforces several important programming concepts:

* Understanding the structure of **singly linked lists**.
* Detecting cycles using the **two-pointer (Floyd''s Tortoise and Hare)** technique.
* Traversing linked structures efficiently.
* Solving graph-like traversal problems with **constant extra space**.

Cycle detection is a fundamental algorithm used in memory management, graph traversal, compiler design, networking, and many other computer science applications.'
WHERE slug = 'has-cycle';
UPDATE problems SET
	statement = 'Searching through a **sorted collection** one element at a time works, but it becomes increasingly inefficient as the collection grows. **Binary search** improves performance by repeatedly dividing the search space in half, allowing it to locate a target value in **O(log n)** time.

In this challenge, your task is to search for a **target integer** within a **sorted list** of integers.

Begin by examining the middle element of the current search range. If it matches the target, return its **index**. Otherwise, eliminate the half of the list that cannot possibly contain the target, then continue searching the remaining half.

If the target value does not exist in the list, your function should return **`-1`**.

This exercise reinforces several important programming concepts:

* Working with **sorted collections**.
* Applying the **divide-and-conquer** strategy.
* Maintaining left and right search boundaries.
* Performing efficient searches with **logarithmic time complexity**.

Binary search is one of the most fundamental algorithms in computer science and serves as the foundation for efficient searching, database indexing, lookup tables, and many other high-performance applications.'
WHERE slug = 'binary-search';
UPDATE problems SET
	statement = '**Postfix notation**, also known as **Reverse Polish Notation (RPN)**, represents arithmetic expressions without parentheses by placing every operator after its operands. This notation is commonly evaluated using a **stack**.

In this challenge, your task is to evaluate a postfix expression represented as a list of tokens.

Each token is either an **integer** or one of the arithmetic operators **`+`**, **`-`**, **`*`**, or **`/`**.

Process the tokens from left to right, using a stack to temporarily store operands until an operator is encountered. When processing division, the result should **truncate toward zero**, matching standard integer division behavior.

Your function should return the final value of the evaluated expression.

This exercise reinforces several important programming concepts:

* Using a **stack** to process data.
* Evaluating expressions one token at a time.
* Applying arithmetic operators in the correct order.
* Understanding an alternative expression format used by calculators and compilers.

Postfix evaluation is a classic application of stacks and is widely used in expression parsing, compiler design, virtual machines, and calculator implementations.'
WHERE slug = 'evaluate-postfix';
UPDATE problems SET
	statement = 'Merging two **sorted sequences** into a single sorted result is one of the most fundamental operations in computer science. It serves as the foundation of algorithms such as **Merge Sort** and is widely used when combining already ordered data.

In this challenge, your task is to merge two **sorted linked lists** into one sorted sequence.

For simplicity, each linked list is represented as a list of values in **head-to-tail order** rather than as individual linked nodes.

Repeatedly compare the current front element of each list, append the smaller value to the result, and continue until all elements have been merged.

Your function should return a new sorted list containing every element from both input lists.

This exercise reinforces several important programming concepts:

* Working with **sorted data**.
* Comparing values from multiple collections.
* Building a new collection incrementally.
* Applying the **two-pointer** technique.

Merging sorted sequences is a fundamental operation used in sorting algorithms, database systems, search engines, and large-scale data processing pipelines.'
WHERE slug = 'merge-sorted-lists';
UPDATE problems SET
	statement = 'Finding the **largest** value in a collection is straightforward, but many practical applications require finding the **k-th largest** element instead. This problem appears frequently in ranking systems, leaderboards, statistics, and priority queues.

In this challenge, your task is to determine the **k-th largest element** in a list of integers.

The **1st largest** element is the maximum value in the list, the **2nd largest** is the next highest value, and so on.

Your function should return the value that occupies the requested ranking.

This exercise reinforces several important programming concepts:

* Working with **ordered rankings**.
* Processing collections of data.
* Understanding the relationship between **sorting** and element selection.
* Solving selection problems commonly encountered in technical interviews.

Finding the k-th largest element is a common operation in data analysis, search systems, scheduling algorithms, and priority queue implementations.'
WHERE slug = 'kth-largest';
UPDATE problems SET
	statement = 'A **binary tree** organizes data in a hierarchical structure where each node can have at most two children. Many tree algorithms perform best when the tree remains **balanced**, meaning neither side grows significantly deeper than the other.

In this challenge, your task is to determine whether a binary tree is **height-balanced**.

The tree is represented as a **level-order array**, where the root is stored at index `0`, the left child of node `i` is located at `2i + 1`, and the right child is located at `2i + 2`. A value of **`-1`** represents a missing node.

A binary tree is considered balanced if, for every node, the heights of its left and right subtrees differ by **no more than one**.

Your function should return **`true`** if the tree is balanced, or **`false`** otherwise.

This exercise reinforces several important programming concepts:

* Working with **binary tree** representations.
* Computing the **height** of recursive structures.
* Applying **recursive divide-and-conquer** techniques.
* Detecting structural imbalances efficiently.

Balanced tree checking is a core operation used in search trees, databases, indexing systems, compiler implementations, and many other performance-critical applications.'
WHERE slug = 'is-balanced-tree';
UPDATE problems SET
	statement = 'Many search systems organize words based on their **prefixes**, making it possible to quickly find every word that begins with a particular sequence of characters. This concept forms the basis of the **Trie (Prefix Tree)** data structure.

In this challenge, your task is to count how many words in a list begin with a specified **prefix**.

Examine each word and determine whether its opening characters match the given prefix. Count every matching word and return the total.

This exercise reinforces several important programming concepts:

* Working with **collections of strings**.
* Comparing **prefixes** within text.
* Iterating through a list while maintaining a **running count**.
* Understanding the practical motivation behind **Trie (Prefix Tree)** data structures.

Prefix searching is widely used in autocomplete systems, search engines, dictionaries, command-line tools, and many other text-processing applications.'
WHERE slug = 'count-words-with-prefix';
UPDATE problems SET
	statement = 'A **graph** consists of a collection of nodes connected by edges. Not every node must be connected to every other node, meaning a graph may be divided into multiple independent groups known as **connected components**.

In this challenge, your task is to determine how many **connected components** exist in an **undirected graph**.

The graph contains **`n` nodes**, labeled from `0` to `n-1`, and its edges are provided as a flattened list where every consecutive pair of values represents a connection between two nodes.

Your function should return the total number of separate connected groups within the graph.

This exercise reinforces several important programming concepts:

* Working with **graph data structures**.
* Understanding **connected components**.
* Grouping related nodes using the **Union-Find (Disjoint Set Union)** data structure.
* Efficiently merging and querying connected groups.

Connected component detection is widely used in networking, social graphs, image processing, clustering algorithms, and many other real-world applications.'
WHERE slug = 'count-connected-components';
