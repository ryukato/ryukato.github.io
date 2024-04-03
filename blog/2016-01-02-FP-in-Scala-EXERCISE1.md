---
slug: Functional Programming in Scala - EXERCISE#1
title: Functional Programming in Scala - EXERCISE#1
authors: ryukato
date: 2016-01-02 09:36:55
tags: [FP, Functional-programming, Scala]
---

# Functional Programming in Scala - EXERCISE#1
## Description
Write a function to get the nth Fibonacci number.
The first two Fibonacci numbers are 0 and 1, and the next number is always the sum of the previous two.
Your definition should use a local tail-recursive function.

> 번역
> n번째의 피보나찌 수를 구하는 함수를 작성해라.
> 첫번째 두개의 피보나찌 숫자는 0과 1이고, 다음에 오는 숫자는 이전 두 숫자의 합이어야 한다.
> 꼬리-재귀(tail-recursive) 함수로 작성해야 한다.

## Implemetation - fib

```
def fib(n: Int): Int ={
    @annotation.tailrec
    def go(n: Int, pre: Int, cur: Int): Int = {
        if(n == 0) pre
        else go(n -1, cur, pre + cur)
    }
    go(n, 0, 1)
}

```

## Result

```
fib(1) // 1
fib(2) // 1
fib(3) // 2
fib(5) // 5
fib(6) // 8
```
