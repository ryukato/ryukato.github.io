---
slug: Scala Tutorial 번역 - Implicit class
title: Scala Tutorial 번역 - Implicit class
authors: ryukato
date: 2017-01-16 09:36:55
tags: [FP, Scala, implicit-class]
---

<!-- truncate -->

## Implicit Class
Implicit Class는 클래스의 기본생성자(인자를 반드시 하나만 가지는)를 암묵적으로("자동으로"라고 해석해도 될 듯하다.) 호출하여 준다. 확~ 와닿지는 않는 말이기때문에 바로 아래의 예제를 보는 것이 좋을 것 같다.

```
object Test {
  implicit class ListToString[A](l : List[A]) {
    def listToStrJoinedBy(s: String): String = {
      l.map(e => e.toString).mkString(s)
    }
  }
  def main(args: Array[String]): Unit = {
    println(List(1,2,3,4) listToStrJoinedBy("|"))
  }
}
```
위의 예제를 살펴보면 Implicit class인 ListToString을 선언하고, main 메서드에서 이를 호출하고 있다. 그런데 호출 시 listToStrJoinedBy 메서드 앞에
List(1,2,3,4)를 먼저 선언하고 있다. 그리고 ListToString의 인스턴스도 만들고 있지 않다. Implicit Class를 설명한 문장을 다시 읽어보자. 클래스의 기본 생성자를 호출한다고 되어있다.
Implicit class인 ListToString는 List 타입의 인자를 받는다. 즉, 이 생성자를 암묵적으로 호출하여 인스턴스를 만든 다음 listToStrJoinedBy 메서드를 호출하는 식이 되는 것이다.
그럼 동일한 타입의 인자를 받는 Implicit class를 하나 이상 선언하면 될까? 그렇지 않다. compile시점에 아래와 같은 오류를 보게 된다.

```
Note that implicit conversions are not applicable because they are ambiguous
```

즉, Runtime 시점에 어떤 Implicit class의 생성자를 호출할 지 모르기 때문에, 위와 같은 compile에러 메세지를 내는 것으로 생각된다.

그럼 아래처럼 다른 타입의 인자를 받는 Implicit class는 얼마든지 선언하여 사용할 수 있다.

```
object Test {
  implicit class IntTimes(x: Int) {
    def times[A](f: => A): Unit = {
      def loop(current: Int): Unit = {
        if(current > 0){
          f
          loop(current - 1)
        }
      }
      loop(x)
    }
  }

  implicit class ListToString[A](l : List[A]) {
    def listToStrJoinedBy(s: String): String = {
      l.map(e => e.toString).mkString(s)
    }
  }

	/*
	//주석을 풀고, 컴파일하면 에러 메세지를 보게 된다.
  implicit class ListToString2[A](l : List[A]) {
    def listToStrJoinedBy(s: String): String = {
      l.map(e => e.toString).mkString(s)
    }
  }
	*/

  def main(args: Array[String]): Unit = {
    4 times println("Hello")
    println(List(1,2,3,4) listToStrJoinedBy("|")) // println(List(1,2,3,4) listToStrJoinedBy "|" ) 이렇게 해도 된다.
  }

}
```

그리고 Implicit Class 사용할 때, 한가지 더 유의 할 점이 있다. Implicit Class로 선언된 클래스의 기본 생성자는 인자를 하나만 받아야 한다. 왜 그렇게 정해 놓은 것인지는 좀 더 생각을 해봐야겠다. 인자를 두개 선언하고, 컴파일 하게 되면 아래와 같은 에러 메세지를 보게 된다.

```
implicit classes must accept exactly one primary constructor parameter
```
