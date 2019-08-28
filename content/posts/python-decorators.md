---
title: "Python Decorators"
date: 2019-08-27
---

It can be easy to succumb to the sheer mystery or python decorators. Even if you use them, you may not understand how they work. Let's fix that.
<!--more-->

First things first: **a decorator is just a function.**

In my opinion, this is an important thing to let soak in. Because, as developers, we know functions intimately; functions are not mysterious; we understand functions.

```python
class Teacher:

    @property # <-- function
    def name(self):
        return self._name

    @classmethod # <-- function
    def has_pension(cls):
        return True

@contextlib.contextmanager # <- function
def with_context():
    ...
```

So what is special about these function, then? What makes them decorators?

_A decorator is a function that takes a function, and returns a function._

So that sounds simple enough, let's try it!

```python
# let's just define a function that fits
# the above description
def my_decorator(func):
    return func

# so does that make it a decorator?
@my_decorator
def say_hello(name):
    print("hello, " + name)

say_hello("world")
# hello, world
```

It works! I mean, the decorator clearly has no effect on the running code, but it also did not create errors. So that proves the definition at least, but what exactly happened? Let's add some print statments to find out:


```python
print("defore decorator")
def my_decorator(func):
    print("decorator called")
    print(func)
    return func
print("after decorator")

print("before function")
@my_decorator
def say_hello(name):
    print("hello, " + name)
print("after function")

say_hello("world")
# defore decorator
# after decorator
# before function
# decorator called
# <function say_hello at 0x7f8792cd8dd0>
# after function
# hello, world
```

Interesting, so what we are learning here is that python is calling the decorator with the function as it's being defined. So what happens to the return value? Can we return whatever we want?

```python
def my_decorator(func):
    return None

@my_decorator
def say_hello(name):
    print("hello, " + name)

print(say_hello)
say_hello("world")
# None
# Traceback (most recent call last):
#   File "/home/rbottriell/work/ryanbottriell.com/test.py", line 11, in <module>
#     say_hello("world")
# TypeError: 'NoneType' object is not callable
```

So there you go, python takes whatever we return, and stores it in place of the original function. In the normal pythonic way, it also does no checking on what the decorator retuns.

I'll leave it there for now, hopefully this simple introduction get's rid of some of the mystery of the decorator - maybe it gives you a starting point to think about how `@property` or `@classmethod` are implemented, or even how you can leverage the concept in your own projects!

Thanks for reading!
