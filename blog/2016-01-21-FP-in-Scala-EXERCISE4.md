---
slug: Functional Programming in Scala - EXERCISE-4
title: Functional Programming in Scala - EXERCISE-4
authors: ryukato
date: 2016-01-21 09:36:55
tags: [FP, Functional-programming, Scala]
---

<!-- truncate -->

# Functional Programming in Scala - EXERCISE-4
## Description
Let’s look at another example, currying, which converts a function of N arguments into a function of one argument that returns another function as its result.11 Here again, there is only one implementation that typechecks.


> 번역 및 해석
> 커링을 실제 구현해 보는 문제입니다. 커링은 여러개의 인자를 받는 함수를, 하나의 인자를 받으면서 다른 인자를 받는 함수를 반환하는 함수로 변형하는 것입니다.
“이번에도 타입을 확인 구현 방법은 오로지 하나만 존재합니다.”라고 문제에서 말하고 있는 것으로 해석됩니다.
커링에 대한 내용은 [Java 8의 문제점: 커링(currying)대 클로져(closure))](Java 8의 문제점 - 커링(currying)대 클로져(closure)))를 보시면 좀 더 도움이 될 것 같내요.

## Solve

문제에서 제공하는 커링 함수의 정의는 아래와 같습니다.

```
def curry[A, B, C](f: (A, B) => C): A => (B => C)
```

curry[A, B, C] 여기서 [A, B, C]는 generic선언이고, f: (A, B) => C 이렇게 선언되어 있는 curry 함수의 인자는 다른 함수로 ,A타입과 B타입의 인자 두개를 받아서 C 타입의 값을 반환하는 함수입니다. 그런데 curry함수의 반환 타입을 보면 A => (B => C) 이렇게 선언이 되어있고, 풀어서 이야기하면, A타입의 인자 하나만을 받아서 다른 함수를 반환하는데 반환되는 함수는 B타입의 인자 하나를 받아서 C타입의 값을 반환하도록 되어 있는 함수 입니다.

즉, 인자를 두개 받는 함수 f: (A, B) => C를 인자를 하나씩 받도록 변형을 시킨 것이고, curry함수가 반환하는 함수는 A 타입의 인자를 받아서 결과로 B타입의 인자를 받는 함수를 반환하는 것입니다. 마지막으로 B타입의 인자를 받는 함수는 최종적으로 C타입의 값을 반환하는 것이죠.

아래의 예제처럼 되는 것입니다.

```
var f = (a: Int, b: Int) => (a + b)
curry[Int, Int, Int](f)(2)(3)

```

위의 예제에서 curry함수가 반환하는 함수를 다시 써보면, Int타입의 a인자를 받아서, Int타입의 b인자를 받아 (a + b)를 반환하는 함수를 반환하게 되는 것입니다.

```
(a: Int) => (b: Int) => (a + b)
```

a 인자를 받는 함수를 g라고 하고, b 인자를 받아 (a + b)를 반환하는 함수를 h라고 하면 아래와 같이 되는 것이죠.

```
g returns h
```

그럼 다시 g와 h를 하나씩 본래데로 되돌리면

```
(a: Int) => h
```

이렇게 되고, 다시 h를 b인자를 받아 a, b 두 인자의 합을 반환하는 함수로 바꾸면

```
(a: Int) => (b: Int) => (a + b)
```

이렇게 됩니다.

여기서 중요한건 a가 함수 h로 넘어갈때, a의 값은 이미 2로 적용이 되어서 넘어간다는 것입니다.


그럼 문제를 풀어 보면, 아래와 같이 되겠죠.

```
def curry[A, B, C](f: (A, B) => C): A => (B => C) =
    a => b => f(a, b)
```

그리고 아래처럼 각 인자를 주어서 실행을 해보면, \#1, \#2 이렇게 번호를 붙인 이유는 각각 실행을 해보셔요. scala REPL에 각 라인을 입력하고 결과를 잘 보시기 바랍니다.

* \#1

  ```
  var f = (a: Int, b: Int) => (a + b)
  ```

* \#2

  ```
  var f = (a: Int, b: Int) => (a + b)
  ```
* \#1 결과

  ```
  f: (Int, Int) => Int = <function2>
  ```
  다 알고 있겠지만, 위의 결과를 보면 function2라는 함수명이 보입니다. 실제로 두개의 Int형 인자를 받아서 Int형 값을 반환하는 함수 객체를 하나 만들어서 반환해주는 것이죠.

* \#2 결과

  ```
  res15: Int = 5
  ```
  2와 3의 합이 5니까 당연 5를 반환하겠죠.

끝으로 curry함수는 그냥 아래처럼 함수를 만들어서 사용할 수 있습니다.

```
var curriedFunc = (a: Int) => (b: Int) => (a + b)
curriedFunc(2)(3)
```

인자를 하나만 주고 curriedFunc실행

```
curriedFunc(2)
```
결과:

```
Int => Int = <function1>
```
함수를 반환합니다.

이제 커링에 대해 어느정도 감이 잡혀가는 것 같내요.
