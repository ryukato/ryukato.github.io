---
slug: Scala Tutorial 번역 - Singleton object, Companion
title: Scala Tutorial 번역 - Singleton object, Companion
authors: ryukato
date: 2017-01-22 09:36:55
tags: [FP, Scala, singleton, companion]
---

<!-- truncate -->

## Singleton Objects
 Scala는 Java보다 좀 더 객체지향이라고 할 수 있다. 그 이유는 Scala는 static member를 가질 수 없기때문이다. static member대신에 singleton 객체를 제공한다.

singleton 객체를 만들때 class키워드 대신 **object**키워드를 사용하여 정의 한다. singleton 객체는 new 키워드를 사용하여 인스턴스를 만들 수 없기때문에, 생성자에 인자들을 넘길 수 없다. 이것은 약간 자바랑 다를 수 있다. 자바에서는  singleton class정의시에 인자를 받을 수 있는 생성자를 정의할 수 있고, newInstance 혹은 createInstance등과 같은 static method를 통해 해당 생성자를 호출 할 수 있기 때문이다. (* 좋은 방법은 아니다. 권장하지 않음)

```
package test
object Blah {
  def main(args: Array[String]): Unit = {
    val l = List(1,2,3,4,5)
    println(sum(l))
  }

  def sum(l: List[Int]) : Int = {
    l match {
      case x :: Nil => x
      case x :: xs => x + sum(xs)
      case Nil => 0
    }
  }
}
```

위의 예제에 정의된 sum 메서드는 전역으로 사용 가능하다. 즉, test.Blah.sum으로 import하거나 참조되어 사용 가능하다.

## Companions
대부분의 singleton 객체들은 singleton객체와 동일한 이름을 가지는 class 혹은 trait와 함께 정의한다. 그리고 반드시 동일한 source 파일에 정의되어야 한다. 그리고 다른 객체와는 다르게 class 혹은 trait에 private로 선언된 속성 혹은 메서드에 접근 할 수 있다. 이렇게 동일한 이름으로 선언된 object와 class는 싱글 톤 객체(object)는 클래스의 컴패니언 객체라고 불리며, 클래스는 객체의 컴패니언 클래스라고 불린다.
[Sclacdoc](https://wiki.scala-lang.org/display/SW/Introduction)은 companion의 표기를 다음과 같이 하고 있다.
- "C" : jump to companion class
- "O" : jump to companion object

(* Companions는 자바로 치자면 static member 혹은 method라고 할 수 있을 것이다. )

```
class IntPair(val x: Int, val y:Int){
  private val sum = x + y;
  override def toString = "(" + x + ", " + y + ")"
}
object IntPair {
  import math.Ordering
  /*
  IntPair(1, 1) 이렇게 생성자 비슷하게 호출할 경우, 아래의 apply메서드가 호출된다. 그리고 IntPair class 객체를 아래와 같이 생성하여 반환한다.
  */
  def apply(x: Int, y: Int) = {
    println("apply of object, x: "+ x + ", y: "+ y)
    val intPair = new IntPair(x, y)
    intPair // return 키워드가 생략된 것이다.
  }
  /*
  http://www.scala-lang.org/api/current/scala/util/Sorting$.html
  API정의에서 보듯이 Sorting.quickSort는 Ordering을 필요로 한다.
  quickSort메서드가 필요로 하는 Ordering은 아래의 메서드가 제공을 해주는 것이고,
  아래의 메서드는 implicit 키워드를 사용해서 정의되었기 때문에, 런타임에 알아서, 자동으로 호출이 된다. 반환타입등으로 추론을하여 호출하여 주는 것으로 생각된다.
  그렇기 때문에 아래의 함수명은 아무렇게나 지어도 상관없다. 이름으로 호출하는 것이 아니라 반환 타입등으로 추론하여 호출하기 때문이다.
  */
  implicit def ipord: Ordering[IntPair] = {
    Ordering.by(ip => {println("ip:" + ip); ip.sum})
  }

}

object Test {
  import IntPair._
  import scala.util.Sorting
  def main(args: Array[String]): Unit = {
    val list = Array(IntPair(3, 3), IntPair(1, 1), IntPair(2, 1))
    println(list.mkString(","))
    Sorting.quickSort(list)
    println(list.mkString(","))
  }
}

```

## Note for Java programmers
static은 Scala에서는 사용되지 않는 키워드이다. singleton 객체에 포함되는 모든 member 그리고 class들 모두 static하게 접근할 수 있다. 위에서 설명한 것처럼 java에서 사용하던 static member, class들은 Scala에서는 companion으로 정의하여 사용할 수 있다. 아래 예제와 같은 패턴으로 사용하는 것이 일반적이다.

```
class X {
	import X._

	def blah = foo
}

object X {
	private def foo = 42
}
```
위의 예제에서 한번 더 확인 할 수 있는 것이, private으로 선언된 member를 아무렇지 않게 접근할 수 있다. 이는 class와 class의 companion은 서로 친한 친구같은 사이여서 서로의 member등에(private이어도)접근할 수 있다. 그렇지만 친구에게도 공개하고 싶지 않은게 있는 것처럼 companion에게도 공개하지 않을려면 아래와 같이 선언하면 된다.

```
private[this] blah
```
Java에서 companion으로 선언된 singleton object의 메서드를 사용할려면 companion class에 동일한 이름을 가지는 메서드(static forwarder)를 선언해서 호출할 수있다. 그 이외의 member들은 아래와 같이 접근할 수 있다.

```
X$.MODULE$.[method or field name]
```



## 참고
### Companion
- [daily scala](http://daily-scala.blogspot.kr/2009/09/companion-object.html)

### static forwarder
- [stackoverflow ](http://stackoverflow.com/questions/3282653/how-do-you-call-a-scala-singleton-method-from-java)
