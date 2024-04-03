---
slug: Functional Programming in Scala - EXERCISE#6
title: Functional Programming in Scala - EXERCISE#6
authors: ryukato
date: 2016-02-23 09:36:55
tags: [FP, Functional-programming, Scala]
---

<!-- truncate -->

# Functional Programming in Scala - EXERCISE#6
## Description
Implement the higher-order function that composes two functions.

```
def componse[A, B, C](f: A => B, g: B => C): A => C
```

> 번역 및 해석
> 두개의 함수를 인자로 받는데, 첫번째 함수는 A타입의 인자를 받아, B를 반환하고, 두번째 함수는 B타입의 인자를 받아 C를 반환 합니다.
> 즉, 첫번째 함수의 결과는 두번째 함수의 인자가 되고 두번째 함수의 결과는 전체 실행 결과가 되는 것입니다.
> 그렇기때문에, compose함수의 최종 반환 타입이 A => C인 것이죠.
> compose라는 것은 아래의 그림 처럼 하나의 함수의 실행 결과가 다른 함수의 인자가 되고, 마지막 함수의 결과가 최종 결과가 되는 것입니다.

![](/assets/fp/compose.png)

## Solve
### compose함수 구현

```
def compose[A, B, C](f: A => B, g: B => C): A => C =
    (a: A) => g(f(a))
```

### compose함수 실행

```
compose[Int, Int, Int](a => a + 2, b => b * 10)(1)
//결과 => 30

```

보면 f함수가 A타입인 a인자를 받고, f함수의 결과가 다시 g함수의 인자가 됩니다. 이렇게 g와 f함수가 compose되어 반환이 되면 이 함수이 인자 1을 주면 1 => 1 + 2 => 3 * 10 이렇게 되서 결과가 30이 됩니다.
이런 compose를 g compose f라고 부른다고 합니다.

### Java에서의 compose
Java에도 위의 compose와 같은(이름도 같은)메서드가 있습니다. 그리고 이와 비슷하지만 다른 andThen이라는 메서드도 있습니다. 아래는 Java의 compose 메서드를 사용해서 위와 동일한 결과를 내는 메서드입니다.

```
static <A, B, C> Function<A, C> compose(Function<A, B> f, Function<B, C> g){
  return g.compose(f);
}
```

```
CompositionTest.<Integer, Integer, Integer>compose(a-> a+2, b -> b * 10).apply(1)
//결과 => 30
```

아래는 andThen을 이용하여 작성한 compose메서드의 코드입니다.

```
static <A, B, C> Function<A, C> compose(Function<A, B> f, Function<B, C> g){
  return f.andThen(g);
}
```
compose, andThen의 예제 코드 모두 실행을 하면 모두 동일한 결과가 나옵니다. 그런데 유심히 봐야 할 것이 compose와 andThen의 차이점입니다.

나중에 실행이 될 함수.compose(먼저 실행이 될 함수) 이런 순서이고, andThen은 반대로 먼저 실행이 될 함수.andThen(나중에 실행이 될 함수) 이렇게 됩니다.

### 추가 예제

주어진 List객체를 요소의 길이가 긴 순으로 정렬하고 첫번째 요소를 가져오는 간단한 예제입니다.

```
Function<List<String>, List<String>> sortByLength
        = list -> list.stream()
        .sorted((a, b) -> -(a.length() - b.length()))
        .collect(Collectors.toList());

Function<List<String>, Optional<String>> first = a -> a.stream().findFirst();

String s = sortByLength.andThen(first).apply(list).get();
System.out.println("first: "+ s); //결과 dddddd

s = first.compose(sortByLength).apply(list).get();
System.out.println("first: "+ s); //결과 dddddd
```

위의 추가 예제에서처럼, componse를 잘 활용하면 여러 함수를 그때 그때 필요에 따라 서로 compose하고 de-compose할 수 있는 유연한 코드가 나오지 않을까 생각이 됩니다.

-끝-
