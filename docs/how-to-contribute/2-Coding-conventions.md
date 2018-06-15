Coding Coventions
===============

Files and functions length
-------------

- Files should be no longer than 120 lines
- Functions should be no longer han 10 lines

This rule is not followed everywhere in the code, but I put effort on applying it now, please do the same :)


Naming Convention
-----------------

Javascript
- Classes : UpperCamelCase
- functionsNames : lowerCamelCase
- variables : lowerCamelCase

Html (nunjucks templates), Javascript/TypeScripts and CSS
- folders : dashed-case
- files-names : dashed-case

Html/CSS
- classes-and-ids : dashed-case

Curly Bracket
-------------

Line return after functionName and parameters
```
myFunction(myParameter : any)
{
  // stuffs
}
```

Or inline function declaration `myFunction() { return this.foo; }`


Code Indentation
----------

Always use 2 spaces for indentation of code blocks

Spaces Around Operators
----------------------

Always put spaces around operators ( = + - * / ), and after commas:
```
var x = y + z;
var values = ["Volvo", "Saab", "Fiat"];
```

Continue with
---
[Code Explanation](3-Code-explanations.md)
