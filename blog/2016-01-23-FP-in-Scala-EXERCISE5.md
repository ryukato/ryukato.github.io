---
slug: Functional Programming in Scala - EXERCISE-5
title: Functional Programming in Scala - EXERCISE-5
authors: ryukato
date: 2016-01-23 09:36:55
tags: [FP, Functional-programming, Scala]
---

<!-- truncate -->

# Functional Programming in Scala - EXERCISE-5 (Optional)
## Description
Implement uncurry, which reverses the transformation of curry. Note that since => associates to the right, A => (B => C) can be written as A => B => C

> 번역
> curry함수가 인자를 여러개 받는 함수를, 인자를 하나씩 받는 함수로 바꾸는 거였다면, uncurry는 이와 반대입니다. 즉, 인자를 하나씩 받는 함수를 다시 여러개의 인자를 받는 함수로 변형하여 반환하여 주는 함수입니다. 참고사항으로는 A => (B => C)의 표현은 A => B => C 로 재 작성될 수 있습니다.

## Solve

### uncurry 함수 정의

```
def uncurry[A, B, C](f: A => B => C): (A, B) => C
```

### uncurry 함수 구현
이전 Functional Programming in Scala - EXERCISE 4와 Java 8의 문제점: 커링(currying)대 클로져(closure)) 에서 curry에 대한 연습 문제와 curry에대한 개념을 살펴보았기 때문에 이번 문제는 어렵지 않게 풀릴 것이라고 생각되내요. 실제 코드 내용도 굉장히 간단합니다.

```
def uncurry[A, B, C](f: A => B => C): (A, B) => C = (a, b) => f(a)(b)
```
위의 코드처럼 구현을 했으니 이번에는 실제 uncurry에 인자를 주고 실행해보는 코드를 작성해 보겠습니다.

```
uncurry[Int, Int, Int]((a: Int) => (b: Int) =>(a + b))(1, 2) // 결과 Int = 3
```
간단하죠?

끝~
