---
slug: Functional Programming in Scala - EXERCISE-2
title: Functional Programming in Scala - EXERCISE-2
authors: ryukato
date: 2016-01-03 09:36:55
tags: [FP, Functional-programming, Scala]
---

<!-- truncate -->

# Functional Programming in Scala - EXERCISE-2
## Description
Implement isSorted, which checks whether an Array[A] is sorted according to a given comparison function.

> 번역
> 주어진 배일이 정렬이 되어 있는지를 확인하는 isSorted함수를 작성해라

## Implemetation
### isSorted

```
def isSorted[A](as:Array[A], compare: (A, A) => Boolean): Boolean ={
  @annotation.tailrec
  def go(key: A, cur: Int): Boolean = {
    if(cur >= as.length)return true
    else{
      if(compare(key, as(cur))){
        val key2 = as(cur)
        go(key2, cur +1)
      }else{
        return false
      }
    }
  }
  go(as(0), 1)
}

```

### less

```
def less(a: Int, b: Int): Boolean = {
  return a <  b
}
```

### gt

```
def gt(a: Int, b: Int): Boolean = {
  return a >  b
}
```

## Test and result

```
val a = Array(2, 1, 3)
isSorted(a, less) // >> false
isSorted(a, (a: Int, b: Int) =>  a > b) // >> false

```

```
val a = Array(1, 2, 3)
isSorted(a, less) // >> true
isSorted(a, (a: Int, b: Int) =>  a < b) // >> true

```

```
// anomyous function for less
isSorted(a, (a: Int, b: Int) =>  a < b)

```
