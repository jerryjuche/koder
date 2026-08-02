import { buildCompletionSuggestions } from "@/lib/monaco-intellisense";

let registered = false;

const Kind = {
  Keyword: 17,
  Function: 1,
  Class: 5,
  Module: 8,
  Variable: 4,
  Constant: 14,
  Snippet: 27,
} as const;

const Snippet = 4 as const;

type CompletionItemConfig = {
  label: string;
  kind?: number;
  detail?: string;
  documentation?: string;
  insertText: string;
  insertTextRules?: number;
};

const KEYWORDS: CompletionItemConfig[] = [
  { label: "False",     kind: Kind.Constant,  insertText: "False" },
  { label: "None",      kind: Kind.Constant,  insertText: "None" },
  { label: "True",      kind: Kind.Constant,  insertText: "True" },
  { label: "and",       kind: Kind.Keyword,   insertText: "and " },
  { label: "as",        kind: Kind.Keyword,   insertText: "as " },
  { label: "assert",    kind: Kind.Keyword,   insertText: "assert " },
  { label: "async",     kind: Kind.Keyword,   insertText: "async " },
  { label: "await",     kind: Kind.Keyword,   insertText: "await " },
  { label: "break",     kind: Kind.Keyword,   insertText: "break " },
  { label: "class",     kind: Kind.Keyword,   insertText: "class " },
  { label: "continue",  kind: Kind.Keyword,   insertText: "continue " },
  { label: "def",       kind: Kind.Keyword,   insertText: "def " },
  { label: "del",       kind: Kind.Keyword,   insertText: "del " },
  { label: "elif",      kind: Kind.Keyword,   insertText: "elif " },
  { label: "else",      kind: Kind.Keyword,   insertText: "else " },
  { label: "except",    kind: Kind.Keyword,   insertText: "except " },
  { label: "finally",   kind: Kind.Keyword,   insertText: "finally " },
  { label: "for",       kind: Kind.Keyword,   insertText: "for " },
  { label: "from",      kind: Kind.Keyword,   insertText: "from " },
  { label: "global",    kind: Kind.Keyword,   insertText: "global " },
  { label: "if",        kind: Kind.Keyword,   insertText: "if " },
  { label: "import",    kind: Kind.Keyword,   insertText: "import " },
  { label: "in",        kind: Kind.Keyword,   insertText: "in " },
  { label: "is",        kind: Kind.Keyword,   insertText: "is " },
  { label: "lambda",    kind: Kind.Keyword,   insertText: "lambda " },
  { label: "nonlocal",  kind: Kind.Keyword,   insertText: "nonlocal " },
  { label: "not",       kind: Kind.Keyword,   insertText: "not " },
  { label: "or",        kind: Kind.Keyword,   insertText: "or " },
  { label: "pass",      kind: Kind.Keyword,   insertText: "pass " },
  { label: "raise",     kind: Kind.Keyword,   insertText: "raise " },
  { label: "return",    kind: Kind.Keyword,   insertText: "return " },
  { label: "try",       kind: Kind.Keyword,   insertText: "try " },
  { label: "while",     kind: Kind.Keyword,   insertText: "while " },
  { label: "with",      kind: Kind.Keyword,   insertText: "with " },
  { label: "yield",     kind: Kind.Keyword,   insertText: "yield " },
];

const BUILTINS: CompletionItemConfig[] = [
  { label: "abs", detail: "abs(x)", documentation: "Return the absolute value of a number.", insertText: "abs($0)", insertTextRules: Snippet },
  { label: "all", detail: "all(iterable)", documentation: "Return True if all elements of the iterable are true.", insertText: "all($0)", insertTextRules: Snippet },
  { label: "any", detail: "any(iterable)", documentation: "Return True if any element of the iterable is true.", insertText: "any($0)", insertTextRules: Snippet },
  { label: "ascii", detail: "ascii(object)", documentation: "Return a string containing a printable representation of an object.", insertText: "ascii($0)", insertTextRules: Snippet },
  { label: "bin", detail: "bin(x)", documentation: "Convert an integer to a binary string prefixed with '0b'.", insertText: "bin($0)", insertTextRules: Snippet },
  { label: "bool", kind: Kind.Class, detail: "bool(x)", documentation: "Convert a value to a Boolean.", insertText: "bool($0)", insertTextRules: Snippet },
  { label: "breakpoint", detail: "breakpoint()", documentation: "Drop into the debugger at the call site.", insertText: "breakpoint($0)", insertTextRules: Snippet },
  { label: "callable", detail: "callable(object)", documentation: "Return True if the object argument appears callable.", insertText: "callable($0)", insertTextRules: Snippet },
  { label: "chr", detail: "chr(i)", documentation: "Return the string representing a character whose Unicode code point is the integer i.", insertText: "chr($0)", insertTextRules: Snippet },
  { label: "classmethod", detail: "classmethod(function)", documentation: "Transform a method into a class method.", insertText: "classmethod($0)", insertTextRules: Snippet },
  { label: "compile", detail: "compile(source, filename, mode)", documentation: "Compile the source into a code or AST object.", insertText: "compile($0)", insertTextRules: Snippet },
  { label: "bytearray", kind: Kind.Class, detail: "bytearray()", documentation: "Return a new array of bytes.", insertText: "bytearray($0)", insertTextRules: Snippet },
  { label: "bytes", kind: Kind.Class, detail: "bytes()", documentation: "Return a new bytes object.", insertText: "bytes($0)", insertTextRules: Snippet },
  { label: "complex", kind: Kind.Class, detail: "complex(real, imag)", documentation: "Create a complex number.", insertText: "complex($0)", insertTextRules: Snippet },
  { label: "delattr", detail: "delattr(obj, name)", documentation: "Delete an attribute from an object.", insertText: "delattr($0)", insertTextRules: Snippet },
  { label: "dict", kind: Kind.Class, detail: "dict(**kwargs)", documentation: "Create a dictionary.", insertText: "dict($0)", insertTextRules: Snippet },
  { label: "dir", detail: "dir(object)", documentation: "Return the list of names in the current local scope or of an object.", insertText: "dir($0)", insertTextRules: Snippet },
  { label: "divmod", detail: "divmod(a, b)", documentation: "Return the tuple (a//b, a%b).", insertText: "divmod($0)", insertTextRules: Snippet },
  { label: "enumerate", detail: "enumerate(iterable, start=0)", documentation: "Return an enumerate object yielding (index, value) pairs.", insertText: "enumerate($0)", insertTextRules: Snippet },
  { label: "eval", detail: "eval(expression)", documentation: "Evaluate the given Python expression.", insertText: "eval($0)", insertTextRules: Snippet },
  { label: "exec", detail: "exec(code)", documentation: "Execute the given Python code.", insertText: "exec($0)", insertTextRules: Snippet },
  { label: "filter", detail: "filter(function, iterable)", documentation: "Construct an iterator from elements for which function returns true.", insertText: "filter($0)", insertTextRules: Snippet },
  { label: "float", kind: Kind.Class, detail: "float(x)", documentation: "Convert a string or number to a floating point number.", insertText: "float($0)", insertTextRules: Snippet },
  { label: "format", detail: "format(value, format_spec)", documentation: "Transform a value using a format specifier.", insertText: "format($0)", insertTextRules: Snippet },
  { label: "frozenset", kind: Kind.Class, detail: "frozenset(iterable)", documentation: "Create an immutable set.", insertText: "frozenset($0)", insertTextRules: Snippet },
  { label: "getattr", detail: "getattr(object, name, default)", documentation: "Get a named attribute from an object.", insertText: "getattr($0)", insertTextRules: Snippet },
  { label: "globals", detail: "globals()", documentation: "Return the global symbol table as a dictionary.", insertText: "globals($0)", insertTextRules: Snippet },
  { label: "hasattr", detail: "hasattr(object, name)", documentation: "Return True if the object has the named attribute.", insertText: "hasattr($0)", insertTextRules: Snippet },
  { label: "hash", detail: "hash(object)", documentation: "Return the hash value of the object.", insertText: "hash($0)", insertTextRules: Snippet },
  { label: "help", detail: "help(request)", documentation: "Invoke the built-in help system.", insertText: "help($0)", insertTextRules: Snippet },
  { label: "hex", detail: "hex(x)", documentation: "Convert an integer to a hexadecimal string prefixed with '0x'.", insertText: "hex($0)", insertTextRules: Snippet },
  { label: "id", detail: "id(object)", documentation: "Return the identity (memory address) of an object.", insertText: "id($0)", insertTextRules: Snippet },
  { label: "input", detail: "input(prompt='')", documentation: "Read a string from standard input.", insertText: "input($0)", insertTextRules: Snippet },
  { label: "int", kind: Kind.Class, detail: "int(x, base=10)", documentation: "Convert a string or number to an integer.", insertText: "int($0)", insertTextRules: Snippet },
  { label: "isinstance", detail: "isinstance(object, classinfo)", documentation: "Return True if the object is an instance of the class.", insertText: "isinstance($0)", insertTextRules: Snippet },
  { label: "issubclass", detail: "issubclass(class, classinfo)", documentation: "Return True if class is a subclass of classinfo.", insertText: "issubclass($0)", insertTextRules: Snippet },
  { label: "iter", detail: "iter(object, sentinel)", documentation: "Return an iterator object.", insertText: "iter($0)", insertTextRules: Snippet },
  { label: "len", detail: "len(s)", documentation: "Return the length (the number of items) of an object.", insertText: "len($0)", insertTextRules: Snippet },
  { label: "list", kind: Kind.Class, detail: "list(iterable)", documentation: "Create a list.", insertText: "list($0)", insertTextRules: Snippet },
  { label: "locals", detail: "locals()", documentation: "Return the local symbol table as a dictionary.", insertText: "locals($0)", insertTextRules: Snippet },
  { label: "map", detail: "map(function, iterable)", documentation: "Apply function to every item of iterable, returning an iterator.", insertText: "map($0)", insertTextRules: Snippet },
  { label: "max", detail: "max(iterable)", documentation: "Return the largest item in an iterable.", insertText: "max($0)", insertTextRules: Snippet },
  { label: "memoryview", kind: Kind.Class, detail: "memoryview(object)", documentation: "Return a memory view object.", insertText: "memoryview($0)", insertTextRules: Snippet },
  { label: "min", detail: "min(iterable)", documentation: "Return the smallest item in an iterable.", insertText: "min($0)", insertTextRules: Snippet },
  { label: "next", detail: "next(iterator, default)", documentation: "Return the next item from an iterator.", insertText: "next($0)", insertTextRules: Snippet },
  { label: "object", kind: Kind.Class, detail: "object()", documentation: "Return a new featureless base object.", insertText: "object($0)", insertTextRules: Snippet },
  { label: "oct", detail: "oct(x)", documentation: "Convert an integer to an octal string prefixed with '0o'.", insertText: "oct($0)", insertTextRules: Snippet },
  { label: "open", detail: "open(file, mode='r', ...)", documentation: "Open file and return a corresponding file object.", insertText: "open($0)", insertTextRules: Snippet },
  { label: "ord", detail: "ord(c)", documentation: "Return the Unicode code point for a single character string.", insertText: "ord($0)", insertTextRules: Snippet },
  { label: "pow", detail: "pow(base, exp, mod=None)", documentation: "Return base to the power exp.", insertText: "pow($0)", insertTextRules: Snippet },
  { label: "print", detail: "print(*objects, sep=' ', end='\\n', ...)", documentation: "Print objects to the text stream file.", insertText: "print($0)", insertTextRules: Snippet },
  { label: "property", detail: "property(fget, fset, fdel, doc)", documentation: "Return a property attribute.", insertText: "property($0)", insertTextRules: Snippet },
  { label: "range", kind: Kind.Class, detail: "range(stop) / range(start, stop, step)", documentation: "Return an immutable sequence of numbers.", insertText: "range($0)", insertTextRules: Snippet },
  { label: "repr", detail: "repr(object)", documentation: "Return a string containing a printable representation.", insertText: "repr($0)", insertTextRules: Snippet },
  { label: "reversed", detail: "reversed(seq)", documentation: "Return a reverse iterator.", insertText: "reversed($0)", insertTextRules: Snippet },
  { label: "round", detail: "round(number, ndigits=None)", documentation: "Round a number to a given precision.", insertText: "round($0)", insertTextRules: Snippet },
  { label: "set", kind: Kind.Class, detail: "set(iterable)", documentation: "Create a set.", insertText: "set($0)", insertTextRules: Snippet },
  { label: "setattr", detail: "setattr(obj, name, value)", documentation: "Set a named attribute on an object.", insertText: "setattr($0)", insertTextRules: Snippet },
  { label: "slice", kind: Kind.Class, detail: "slice(stop) / slice(start, stop, step)", documentation: "Create a slice object.", insertText: "slice($0)", insertTextRules: Snippet },
  { label: "sorted", detail: "sorted(iterable, key=None, reverse=False)", documentation: "Return a new sorted list from the iterable.", insertText: "sorted($0)", insertTextRules: Snippet },
  { label: "staticmethod", detail: "staticmethod(function)", documentation: "Transform a method into a static method.", insertText: "staticmethod($0)", insertTextRules: Snippet },
  { label: "str", kind: Kind.Class, detail: "str(object='')", documentation: "Convert a value to a string.", insertText: "str($0)", insertTextRules: Snippet },
  { label: "sum", detail: "sum(iterable, start=0)", documentation: "Return the sum of a sequence of numbers.", insertText: "sum($0)", insertTextRules: Snippet },
  { label: "super", detail: "super(type, object_or_type)", documentation: "Return a proxy object for calling the parent class.", insertText: "super($0)", insertTextRules: Snippet },
  { label: "tuple", kind: Kind.Class, detail: "tuple(iterable)", documentation: "Create a tuple.", insertText: "tuple($0)", insertTextRules: Snippet },
  { label: "type", kind: Kind.Class, detail: "type(object)", documentation: "Return the type of an object.", insertText: "type($0)", insertTextRules: Snippet },
  { label: "vars", detail: "vars(object)", documentation: "Return the __dict__ attribute of an object.", insertText: "vars($0)", insertTextRules: Snippet },
  { label: "zip", detail: "zip(*iterables)", documentation: "Iterate over several iterables in parallel, yielding tuples.", insertText: "zip($0)", insertTextRules: Snippet },
  { label: "__import__", detail: "__import__(name, ...)", documentation: "Import a module (import hook).", insertText: "__import__($0)", insertTextRules: Snippet },
];

const STD_MODULES: CompletionItemConfig[] = [
  { label: "abc",         kind: Kind.Module, insertText: "abc" },
  { label: "base64",      kind: Kind.Module, insertText: "base64" },
  { label: "collections", kind: Kind.Module, insertText: "collections" },
  { label: "copy",        kind: Kind.Module, insertText: "copy" },
  { label: "csv",         kind: Kind.Module, insertText: "csv" },
  { label: "dataclasses", kind: Kind.Module, insertText: "dataclasses" },
  { label: "datetime",    kind: Kind.Module, insertText: "datetime" },
  { label: "decimal",     kind: Kind.Module, insertText: "decimal" },
  { label: "enum",        kind: Kind.Module, insertText: "enum" },
  { label: "fractions",   kind: Kind.Module, insertText: "fractions" },
  { label: "functools",   kind: Kind.Module, insertText: "functools" },
  { label: "hashlib",     kind: Kind.Module, insertText: "hashlib" },
  { label: "html",        kind: Kind.Module, insertText: "html" },
  { label: "inspect",     kind: Kind.Module, insertText: "inspect" },
  { label: "io",          kind: Kind.Module, insertText: "io" },
  { label: "itertools",   kind: Kind.Module, insertText: "itertools" },
  { label: "json",        kind: Kind.Module, insertText: "json" },
  { label: "math",        kind: Kind.Module, insertText: "math" },
  { label: "os",          kind: Kind.Module, insertText: "os" },
  { label: "pathlib",     kind: Kind.Module, insertText: "pathlib" },
  { label: "pprint",      kind: Kind.Module, insertText: "pprint" },
  { label: "random",      kind: Kind.Module, insertText: "random" },
  { label: "re",          kind: Kind.Module, insertText: "re" },
  { label: "statistics",  kind: Kind.Module, insertText: "statistics" },
  { label: "string",      kind: Kind.Module, insertText: "string" },
  { label: "sys",         kind: Kind.Module, insertText: "sys" },
  { label: "textwrap",    kind: Kind.Module, insertText: "textwrap" },
  { label: "typing",      kind: Kind.Module, insertText: "typing" },
  { label: "urllib",      kind: Kind.Module, insertText: "urllib" },
  { label: "uuid",        kind: Kind.Module, insertText: "uuid" },
];

const IDENTIFIERS: CompletionItemConfig[] = [
  { label: "self",       kind: Kind.Variable, detail: "First parameter of instance methods", insertText: "self" },
  { label: "cls",        kind: Kind.Variable, detail: "First parameter of class methods", insertText: "cls" },
  { label: "__name__",   kind: Kind.Variable, detail: "Module name variable", insertText: "__name__" },
  { label: "__main__",   kind: Kind.Constant, detail: "Main module guard value", insertText: "__main__" },
  { label: "__init__",   kind: Kind.Function, detail: "__init__(self, ...)", documentation: "Constructor method called on instantiation.", insertText: "__init__" },
  { label: "__str__",    kind: Kind.Function, detail: "__str__(self)", documentation: "Return a string representation for users.", insertText: "__str__" },
  { label: "__repr__",   kind: Kind.Function, detail: "__repr__(self)", documentation: "Return an unambiguous string representation.", insertText: "__repr__" },
  { label: "__len__",    kind: Kind.Function, detail: "__len__(self)", documentation: "Return container length.", insertText: "__len__" },
  { label: "__eq__",     kind: Kind.Function, detail: "__eq__(self, other)", documentation: "Define equality comparison.", insertText: "__eq__" },
  { label: "__lt__",     kind: Kind.Function, detail: "__lt__(self, other)", documentation: "Define less-than comparison.", insertText: "__lt__" },
  { label: "__iter__",   kind: Kind.Function, detail: "__iter__(self)", documentation: "Define iterator protocol.", insertText: "__iter__" },
  { label: "__next__",   kind: Kind.Function, detail: "__next__(self)", documentation: "Define next item in iterator.", insertText: "__next__" },
  { label: "__enter__",  kind: Kind.Function, detail: "__enter__(self)", documentation: "Enter runtime context (context manager).", insertText: "__enter__" },
  { label: "__exit__",   kind: Kind.Function, detail: "__exit__(self, exc_type, exc_val, exc_tb)", documentation: "Exit runtime context (context manager).", insertText: "__exit__" },
  { label: "__call__",   kind: Kind.Function, detail: "__call__(self, ...)", documentation: "Make an instance callable.", insertText: "__call__" },
  { label: "__getitem__", kind: Kind.Function, detail: "__getitem__(self, key)", documentation: "Define indexed access.", insertText: "__getitem__" },
  { label: "__setitem__", kind: Kind.Function, detail: "__setitem__(self, key, value)", documentation: "Define indexed assignment.", insertText: "__setitem__" },
  { label: "__contains__", kind: Kind.Function, detail: "__contains__(self, item)", documentation: "Define membership with 'in'.", insertText: "__contains__" },
  { label: "__add__",    kind: Kind.Function, detail: "__add__(self, other)", documentation: "Define addition behavior.", insertText: "__add__" },
  { label: "__sub__",    kind: Kind.Function, detail: "__sub__(self, other)", documentation: "Define subtraction behavior.", insertText: "__sub__" },
  { label: "__mul__",    kind: Kind.Function, detail: "__mul__(self, other)", documentation: "Define multiplication behavior.", insertText: "__mul__" },
  { label: "__truediv__", kind: Kind.Function, detail: "__truediv__(self, other)", documentation: "Define division behavior.", insertText: "__truediv__" },
];

const ALL_COMPLETIONS: CompletionItemConfig[] = [
  ...KEYWORDS,
  ...BUILTINS,
  ...STD_MODULES,
  ...IDENTIFIERS,
];

type SignatureInfo = {
  label: string;
  documentation?: string;
  parameters: { label: string; documentation?: string }[];
};

const SIGNATURES: Record<string, SignatureInfo> = {
  abs: {
    label: "abs(x)",
    parameters: [{ label: "x", documentation: "A numeric value" }],
  },
  all: {
    label: "all(iterable)",
    parameters: [{ label: "iterable", documentation: "An iterable object" }],
  },
  any: {
    label: "any(iterable)",
    parameters: [{ label: "iterable", documentation: "An iterable object" }],
  },
  bool: {
    label: "bool(x)",
    parameters: [{ label: "x", documentation: "A value to convert" }],
  },
  chr: {
    label: "chr(i)",
    parameters: [{ label: "i", documentation: "Unicode code point as integer" }],
  },
  dict: {
    label: "dict(**kwargs)",
    parameters: [{ label: "**kwargs", documentation: "Key-value pairs" }],
  },
  enumerate: {
    label: "enumerate(iterable, start=0)",
    parameters: [
      { label: "iterable", documentation: "A sequence or iterator" },
      { label: "start", documentation: "Starting index (default 0)" },
    ],
  },
  filter: {
    label: "filter(function, iterable)",
    parameters: [
      { label: "function", documentation: "A function that returns bool" },
      { label: "iterable", documentation: "An iterable to filter" },
    ],
  },
  float: {
    label: "float(x)",
    parameters: [{ label: "x", documentation: "A string or number" }],
  },
  getattr: {
    label: "getattr(object, name, default)",
    parameters: [
      { label: "object", documentation: "The object" },
      { label: "name", documentation: "Attribute name as string" },
      { label: "default", documentation: "Default if attribute not found (optional)" },
    ],
  },
  hasattr: {
    label: "hasattr(object, name)",
    parameters: [
      { label: "object", documentation: "The object" },
      { label: "name", documentation: "Attribute name as string" },
    ],
  },
  input: {
    label: "input(prompt='')",
    parameters: [{ label: "prompt", documentation: "Optional prompt string" }],
  },
  int: {
    label: "int(x, base=10)",
    parameters: [
      { label: "x", documentation: "A string or number" },
      { label: "base", documentation: "Number base (default 10)" },
    ],
  },
  isinstance: {
    label: "isinstance(object, classinfo)",
    parameters: [
      { label: "object", documentation: "The object to check" },
      { label: "classinfo", documentation: "A class, type, or tuple of types" },
    ],
  },
  issubclass: {
    label: "issubclass(class, classinfo)",
    parameters: [
      { label: "class", documentation: "The class to check" },
      { label: "classinfo", documentation: "A class or tuple of classes" },
    ],
  },
  len: {
    label: "len(s)",
    parameters: [{ label: "s", documentation: "A sequence or collection" }],
  },
  list: {
    label: "list(iterable)",
    parameters: [{ label: "iterable", documentation: "An optional iterable" }],
  },
  map: {
    label: "map(function, iterable)",
    parameters: [
      { label: "function", documentation: "A function to apply" },
      { label: "iterable", documentation: "An iterable" },
    ],
  },
  max: {
    label: "max(iterable)",
    parameters: [{ label: "iterable", documentation: "An iterable" }],
  },
  min: {
    label: "min(iterable)",
    parameters: [{ label: "iterable", documentation: "An iterable" }],
  },
  open: {
    label: "open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None)",
    parameters: [
      { label: "file", documentation: "Path or file descriptor" },
      { label: "mode", documentation: "File mode (default 'r')" },
    ],
  },
  ord: {
    label: "ord(c)",
    parameters: [{ label: "c", documentation: "A single character string" }],
  },
  pow: {
    label: "pow(base, exp, mod=None)",
    parameters: [
      { label: "base", documentation: "Base number" },
      { label: "exp", documentation: "Exponent" },
      { label: "mod", documentation: "Optional modulus" },
    ],
  },
  print: {
    label: "print(*objects, sep=' ', end='\\n', file=sys.stdout, flush=False)",
    parameters: [
      { label: "*objects", documentation: "Objects to print" },
      { label: "sep", documentation: "Separator between objects (default ' ')" },
      { label: "end", documentation: "String appended after output (default '\\n')" },
    ],
  },
  range: {
    label: "range(stop) / range(start, stop, step)",
    parameters: [
      { label: "start", documentation: "Start of range (default 0)" },
      { label: "stop", documentation: "End of range (exclusive)" },
      { label: "step", documentation: "Step value (default 1)" },
    ],
  },
  reversed: {
    label: "reversed(seq)",
    parameters: [{ label: "seq", documentation: "A sequence" }],
  },
  round: {
    label: "round(number, ndigits=None)",
    parameters: [
      { label: "number", documentation: "The number to round" },
      { label: "ndigits", documentation: "Decimal places (optional)" },
    ],
  },
  set: {
    label: "set(iterable)",
    parameters: [{ label: "iterable", documentation: "An optional iterable" }],
  },
  slice: {
    label: "slice(stop) / slice(start, stop, step)",
    parameters: [
      { label: "start", documentation: "Start index" },
      { label: "stop", documentation: "Stop index" },
      { label: "step", documentation: "Step value" },
    ],
  },
  sorted: {
    label: "sorted(iterable, key=None, reverse=False)",
    parameters: [
      { label: "iterable", documentation: "An iterable to sort" },
      { label: "key", documentation: "Function to extract comparison key" },
      { label: "reverse", documentation: "Sort in reverse order" },
    ],
  },
  str: {
    label: "str(object='')",
    parameters: [{ label: "object", documentation: "A value to convert" }],
  },
  sum: {
    label: "sum(iterable, start=0)",
    parameters: [
      { label: "iterable", documentation: "A sequence of numbers" },
      { label: "start", documentation: "Starting value (default 0)" },
    ],
  },
  super: {
    label: "super(type, object_or_type)",
    parameters: [
      { label: "type", documentation: "The class to use" },
      { label: "object_or_type", documentation: "The object or class for resolution" },
    ],
  },
  tuple: {
    label: "tuple(iterable)",
    parameters: [{ label: "iterable", documentation: "An optional iterable" }],
  },
  type: {
    label: "type(object)",
    parameters: [{ label: "object", documentation: "The object to inspect" }],
  },
  zip: {
    label: "zip(*iterables)",
    parameters: [{ label: "*iterables", documentation: "One or more iterables" }],
  },
};

const HOVER_DOCS: Record<string, string> = {};

const kindName = (kind: number): string => {
  const entry = Object.entries(Kind).find(([, v]) => v === kind);
  return entry ? entry[0].toLowerCase() : "symbol";
};

for (const item of ALL_COMPLETIONS) {
  const kindLabel = kindName(item.kind ?? Kind.Function);
  const detail = item.detail ? `**${item.detail}**  ` : "";
  const doc = item.documentation ? `\n\n${item.documentation}` : "";
  HOVER_DOCS[item.label] = `*Python built-in ${kindLabel}*  \n${detail}${doc}`;
}

export function registerPythonLanguageFeatures(monaco: any) {
  if (registered) return;
  registered = true;

  monaco.languages.setLanguageConfiguration("python", {
    comments: {
      lineComment: "#",
      blockComment: ['"""', '"""'],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*:\s*(?:#.*)?$/,
      decreaseIndentPattern: /^\s*(elif|else|except|finally)\b.*$/,
    },
    onEnterRules: [
      {
        beforeText: /:\s*(?:#.*)?$/,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
  });

  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [".", "(", ","],
    provideCompletionItems: (model: any, position: any) =>
      buildCompletionSuggestions(monaco, model, position, "python", ALL_COMPLETIONS),
  });

  monaco.languages.registerSignatureHelpProvider("python", {
    signatureHelpTriggerCharacters: ["(", ","],
    provideSignatureHelp: (model: any, position: any) => {
      const textUntil = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      let depth = 0;
      let parenIndex = -1;
      for (let i = textUntil.length - 1; i >= 0; i--) {
        const ch = textUntil[i];
        if (ch === ")") depth++;
        else if (ch === "(") {
          if (depth === 0) { parenIndex = i; break; }
          depth--;
        }
      }
      if (parenIndex === -1) return null;
      const beforeParen = textUntil.substring(0, parenIndex).trim();
      const match = beforeParen.match(/([a-zA-Z_]\w*)\s*$/);
      if (!match) return null;
      const funcName = match[1];
      const sig = SIGNATURES[funcName];
      if (!sig) return null;
      const argsPart = textUntil.substring(parenIndex + 1);
      depth = 0;
      let activeParam = 0;
      for (const ch of argsPart) {
        if (ch === "," && depth === 0) activeParam++;
        else if ("([{".includes(ch)) depth++;
        else if (")]}".includes(ch)) depth--;
      }
      return {
        signatures: [
          {
            label: sig.label,
            documentation: sig.documentation,
            parameters: sig.parameters,
          },
        ],
        activeSignature: 0,
        activeParameter: Math.min(activeParam, sig.parameters.length - 1),
      };
    },
  });

  monaco.languages.registerHoverProvider("python", {
    provideHover: (model: any, position: any) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      const docs = HOVER_DOCS[word.word];
      if (!docs) return null;
      return {
        range: word.range,
        contents: [{ value: docs }],
      };
    },
  });
}
