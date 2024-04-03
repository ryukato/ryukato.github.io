---
slug: Scala Tutorial 번역 - Pattern Matching
title: Scala Tutorial 번역 - Pattern Matching
authors: ryukato
date: 2017-01-14 09:36:55
tags: [FP, Scala, pattern-matching]
---

## Pattern Matching
Scala는 일반적인 pattern matching 메카니즘을 가지고 있다. 첫번째로 일치하는 구문을 적용한다는 정책에 따라 어떤 종류의 데이터든 비교하여 실행하도록 해준다.
아래의 간단한 예제를 통해, 정수 타입 값을 비교하여 일치하는 구문을 실행하는 방법을 살펴보자.

```
object MatchTest1 extends App {
  def matchTest(x: Int): String = {
    x match {
        case 1 => "One"
        case 2 => "Two"
        case _ => "many"
    }
  }

  println(matchTest(3))
}
```

###### output

```
many
```

case 구문 block은 정수를 문자열(string)으로 매핑하여 반환하는 함수를 정의하고 있다. **match**키워드를 통해 case 구문 block에 정의된 함수를 쉽게 적용할 수 있는 방법을 제공해준다.

다음의 예제를 통해 다른 타입에 대해 pattern matching을 적용하는 방법을 살펴보자

```
object MatchTest2 extends App {
  def matchTest(x: Any): Any = {
    x match {
      case 1 => "One"
      case "two" => 2
      case y: Int => "scala.Int"
    }
  }

  println(matchTest("two"))
  println(matchTest(1))
  println(matchTest(3))
}

```

###### output

```
2
One
scala.Int
```

주어진 값(x)이 1이라면, 첫번째 case 구문에 일치하게 되는 것이다. 두번째 구문은 주어진값(x)이 "two"일 경우, 일치되므로 정의된 함수가 실행이 되고, 마지막 구문은 주어진 값이(x) 정수형의 어떤값(* 1제외)이더라도 일치하게 되어 실행이 될 것이다.

Scala의 pattern matching은 case class와 함께 사용할때 가장 유용하게 사용될 수 있다. 또한 **extractor objects**의 **unapply** 메서드를 사용하여, case class에 독립적으로 패턴들을 정의하여 사용할 수 있다.
## Appendix
- [Pattern Matching](https://en.wikipedia.org/wiki/Pattern_matching)

### Pattern Matching with List

```
object MatchTest3 extends App {
  def matchTest(list: List[Int]) : Any = {
    list match {
      case x :: Nil => x  // 요소가 하나인 List
      case x :: xs => xs  // 요소가 하나 이상인 List
      case Nil => "Empty" // 요소가 없거나, Null인 경우
    }
  }

  println(matchTest(List(1)))     // 1
  println(matchTest(List(1,2)))   // List(2)
  println(matchTest(List(1,2,3))) // List(2, 3)
  println(matchTest(List()))      // Empty
  println(matchTest(Nil))         // Empty
}

```
