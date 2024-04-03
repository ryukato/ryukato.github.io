---
slug: Functional Programming in Scala - EXERCISE#3
title: Functional Programming in Scala - EXERCISE#3
authors: ryukato
date: 2016-01-04 09:36:55
tags: [FP, Functional-programming, Scala]
---

<!-- truncate -->

# Functional Programming in Scala - EXERCISE#3 (HARD)
## Description
This function, partial1, takes a value and a function of two arguments, and returns a function of one argument as its result. The name comes from the fact that the function is being applied to some but not all of its required arguments.

Implement partial1 and write down a concrete usage of it. There is only one possible implementation that compiles. We don’t have any concrete types here, so we can only stick things together using the local ‘rules of the universe’ established by the type signature. The style of reasoning required here is very common in functional programming—we are simply manipulating symbols in a very abstract way, similar to how we would reason when solving an algebraic equation.


> 번역
> 제네릭처럼 추상화된 타입 선언을 가지고 있는 partail1 함수를 구현하되, partial1 함수에 아래와 같이 두개, A타입의 a 그리고 A, B타입의 인자를 받고 C타입의 값을 반환하는 함수를 인자로 선언한다.
> 그리고 partial1함수는 B타입의 인자를 받아 C타입의 값을 반환하여야 한다.
> partail1과 partail1함수에 인자로 넘기는 f:(A, B)는 partail1함수 선언시 사용된 타입들 A, B, C와 동일한 타입의 인자를 받아야 한다는 것을 의미한다.


## Implemetation
### partial1

```
def partial1[A, B, C](a: A, f:(A, B) => C): B => C = {
    (b: B) => f(a, b)
}

```

위의 partial1을 이용하여 정수, 숫자 문자열(String)을 인자로 받아 Double형의 값(두값의 정수합 /100)을 반환하는 함수를 구현한다고 하면 아래와 같다.
이미 partial1에서 데이터 타입을 모두 선언을 하였기때문에, partail1에 인자로 넘기는 함수에는 단순히 (a, b)의 형태로만 작성하여도 이미 타입정보를 알고 있기때문에, 컴파일이 정상적으로 된다라고 생각된다. 그리고 마지막의 apply는 partail1이 반환한 함수를 호출하기 위한 코드이다.

```
partail1[Int, String, Double](a, (a, b) => {(a + b.toInt)/100}).apply("100") // Double = 1.0

```
위에서 정의한 partial1은 아래의 형태의 함수를 반환하는데, 분명 인자 a, b를 두개를 받는다.그런데 apply에서는 B(String)타입의 인자만을 넘겨도 호출이 되는데, 이는 이미 a는 partail1에서 인자로 받아 넘겨주기 때문이라고 생각된다.

```
(b: B) => f(a, b)
```
