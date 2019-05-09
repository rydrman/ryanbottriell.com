---
title: "Exit First"
date: 2019-05-09
---

In our neverending persuit of clean and maintainable code, I present in this post a simple rule to reduce cognitive complexity and help your code stay easy to read. <!--more-->

This rule is easy to remember and easy to follow; literally, the title says it all. To be a little more verbose, though consider this:

> Organize the logic paths of a function to return as soon as possible.

In other words, write the easiest way out first. As an example of this in practice, consider the following function:

```go
func getValue() int {

    value := 0
    if condition {

        value = someBase()
        if shouldMore {
            value += more()
        }

    } else {

        value = alternative()

    }

    return value

}
```

If we then refactor this function with this rule in mind, you might get something like the following:

```go
func getValue() int {

    if !condition {
        return alternative()
    }

    value := someBase()
    if !shouldMore {
        return value
    }

    return value + more()

}
```

This is a simple example, but shows how the application of this rule can change the structure of your function. In the latter example, we've reduced nesting, cognitive complexity, and what I am going to call *cognitive line dependency*. When a line of code appears inside a nested conditional block, those lines become attached to that conditional. The reader may then feel a much stronger need to keep all of the conditions in mind while reading the code. In the refactored example, conditions are dealt with and fogotten. Clearly, in both examples the preconditions of each line are the same, but I believe the structure helps to reduce noise and convey only what is important for understanding and bug fixing.

The refactored example shows us pretty clearly that there are three final states or exit conditions to this function. This can aid future developers in understanding where they need to make changes. The new structure also provides us clear separation points on which we could break this function down into multiple, smaller functions for cleanliness. I often use this method as the first step to refactoring an overly large and complex method.
