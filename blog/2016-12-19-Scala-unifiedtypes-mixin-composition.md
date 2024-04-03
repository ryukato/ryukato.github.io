---
slug: Scala Tutorial 번역 - Unified Types, Mixin and Composition
title: Scala Tutorial 번역 - Unified Types, Mixin and Composition
authors: ryukato
date: 2016-12-19 09:36:55
tags: [FP, Scala, Unified-Types, Mixin, Composition]
---

<!-- truncate -->

# Scala
## Unified Types
자바와는 대조적으로, Scala에서는 아래에 명시된 모든 값은 객체들이다.

1. 원시 변수 타입 (primitive type)
	- numberic
	- byte
	- short
	- int
	- long
	- float
	- double
	- boolean
	- char
2. 객체 타입 (reference type)
	- Class를 통해 생성되는 모든 객체  

## Scala Class Hierarchy
아래의 figure1.1를 통해  Scala 타입의 계층 정보를 한눈에 볼 수 있다.

**figure1.1**
![figure1.1](http://docs.scala-lang.org/resources/images/classhierarchy.img_assist_custom.png)
Scala에서의 최상위 클래스는 scala.Any 클래스이다. 그리고 아래와 같은 두개의 하위 클래스를 가진다.

### scala.AnyVal
값을 표현하는 최상위 클래스이며, 자바에서의 원시타입들로 표현되는 값을 나타내는 모든 클래스들로 이미 scala에서도 미리 모두 정의가 되어 있다.  
### scala.AnyRef
참조 객체를 표현하는 최상위 클래스이며, 사용자 정의 클래스들은 직,간접적으로 AnyRef클래스들을 상속받게 된다. 그리고 사용자 정의 클래스들은 간접적으로 trait인 scala.ScalaObject를 상속받는다. 하지만 scala가 실행되는 환경(예, JVM)에서 제공된느 클래스들은 scala.ScalaObject를 상속받지 않는다. 그렇지만 JVM에서 scala가 실행될 경우, AnyRef는 java.lang.Object에 대응된다.
아래의 예제를 참조하면 scala의 type을 이행하는데 도움이 될 것이다.

```
import scala.collection.mutable

object UnifiedTypes extends App {
  //모든 타입의 변수를 저장할 수 있다
  val set = new mutable.LinkedHashSet[Any]

  set += "This is a string" // string type의 값 추가
  set += 732  // int type의 값 추가
  set += 'c'  // char type의 값 추가
  set += true // boolean type의 값 추가
  set += main _ // main function 추가
  val iter:Iterator[Any] = set.iterator;

  while(iter.hasNext){
    val e: Any = iter.next()
    println("Type: " + e.getClass() + " value: " + e.toString)
  }
}
```
**Output**

```
Type: class java.lang.String value: This is a string
Type: class java.lang.Integer value: 732
Type: class java.lang.Character value: c
Type: class java.lang.Boolean value: true
Type: class UnifiedTypes$$anonfun$1 value: <function1>
```

## Classes
Scala에서의 class는 동일한 속성 및 행위를 가지는 객체를 생성할 수 있는 정적인 template을 의미한다. (* Java에서도 이와 같은 의미로 사용된다.) 아래는 Point class정의를 보여준다.

**Point class**

```
class Point(var x: Int, var y: Int) {
  def move(dx: Int, dy: Int): Unit = {
    x = x + dx;
    y = y + dy;
  }

  override def toString: String = "(" + x + ", " + y + ")"
}
```
**Create Point and print toString**

```
object _main {
  def main(args: Array[String]): Unit = {
    val p: Point = new Point(0, 0)
    p.move(10, 30)
    println(p.toString())
  }
}
```

## Define Variables
### Immutable variable(불변 변수)
**val** 키워드를 사용하여 변수를 선언할 경우, 이는 Java에서 final로 선언한 변수와 동일하다. 즉, 변수에 값을 할당하게 되면, 그 이후로 값을 재 할당할 수 없다.
### Mutable variable (가변 변수)
**var**키워드를 사용하여 변수를 선언하고 값을 할당한 이후, 값을 재 할당하여 변수가 포함하는 값을 언제든지 변경할 수 있다.

### Return and specify return type
#### Return type:
1. Return nothing: Unit (same with Void in Java)
#### Return
Scala에서는 값 반환 시, return 키워드를 사용하지 않아도 된다. 메서드내의 마지막 값을 자동으로 반환한다.

아래와 같이 Any타입의 인자를 받고 아무것도 반환하지 않는 함수를 반환할 수 도 있다.

```
def returnFun(): Function[Any, Unit] ={
	{a:Any => println(a.toString())}
}
```

## Traits
Java의 Interface와 비슷한 기능을 하며, 특정 메서드를 포함하는 객체(타입)을 정의하기 위해서 사용이 된다.
Java 8에서와 같이, default 메서드를 지원한다. 따라서 일부 구현이 된 상태로 정의할 수 있다. class와는 대조적으로 **traits**는 생성자   메서드를 가질 수 없다. 아래의 예제를 참고하면된다.
아래의 예제는 두개의 메서드로 이루어져있다. 그런데 **isSimilar** 메서드는 빈 메서드인 반면, **isNotSimilar** 메서드는 빈 메서드가 아닌 구현되어 있다. 따라서 Similarity trait를 구현하는 class는 **isSimilar** 메스드만을 구현하면 된다.
```
trait Similarity {
	def isSimilar(x: Any): Boolean
	def isNotSimilar(x: Any): Boolean  = !isSimilar(x)
}
```

```
class Point(xc: Int, yc: Int) extends Similarity {
	var x: Int = xc
	var y: Int = yc
	def isSimilar(obj: Any) = obj.isInstanceOf[Point] && obj.asInstanceOf[Point]
}
```

## Mixin Class Composition
단일 상속만을 지원하는 언어와는 다르게, Scala는 class의 재사용에 대한 더 많은 개념을 가지고 있다. Scala는 새로운 class를 정의할 때 다중 상속과 비슷한 mixin-class composition을 지원한다.
일단 아래와 같은 클래스 정의가 있다고 하자

```
abstract class AbIterator {
type T
}
```
그 다음엔, AbIterator를 확장하는 mixin class를 생각해보자. mixin class는 주어진 함수가 iterator에 의해 반환되는 각각의 요소에 적용되는 foreach 메서드를 가지고 있다. mixin으로 사용되는 class를 정의하기 위해서는 trait를 사용해야 한다.

```
trait RichIteraotr extends AbIterator {
	def foreach(f: T => Unit /*T type의 인자를 받고 반환 타입이 없는 함수 */){
		while(hasNext) f(next)
	}
}
```

아래는 AbIterator를 확장하고 AbIterator의 메서드를 구현하는 class이다.

```
class StringIterator(s: String) extends AbIterator {
	type T = Char
	private var i = 0
	def hasNext = i < s.length
	/*변수 ch에 주어진 문자열에서 i번재 해당하는 문자를 할당하고, i를 1만큼 증가 시킨 후, ch를 반환하는 함수 */
	def next = {val ch = s.charAt i; i += 1; ch}
}
```

**StringIterator**와 **RichIteraotr**의 기능을 하나의 class에 결합시키길 원하다면, 단일 상속으로는 이를 구현할 수 없다. 이를 해결할 수 있도록 Scala에서는 mixin-class compoistion을 지원한다. mixin-class composition은 프로그래머로 하여금 class정의를 재사용할 수 있도록 도와준다. with 키워드를 통해 결합되는 class가 mixin class이다. 아래의 예제를 살펴보자

```
object StringIteratorTest {
	def main(args: Array[String]) {
		/*
		mixin-class composition을 사용하여 새로운 클래스 정의. StringIterator와 RichIterator의 기능을 모두 포함 한다.
		*/
		class Iter extends StringIterator("test") with RichIterator

		val iter = new Iter
		iter foreach println
	}
}
```
**Output**

```
t
e
s
t
```

## Anonymous Function Syntax
Scala를 사용하여 익명 함수를 선언하는 것은 비교적 쉽다고 할 수 있다. 다음의 예제는 Scala에서 익명 함수를 생성하는 것을 보여준다.

```
val f = (x: Int) => x + 1
f(1) // output 2
```
위의 예제와 동일한 코드를 아래와 같이 작성할 수 도 있다.

```
val g = new Function1[Int, Int] {
	def apply(x: Int): Int = x + 1
}
g(1) //output 2
```

하나 이상의 인자를 받는 함수는 아래와 같이 작성 할 수 있다.

```
val h = (x: Int, y: Int) => "(" + x + ", " + y + ")"
println(h(1, 2)) // (1, 2)
```

아무런 인자를 받지 않는 함수는 아래와 같이 작성할 수 있다.

```
val i = () => {System.getProperty("user.dir")}
println(i()) // output is directory path
```

## Higher-order Functions

Scala에서는 함수를 인자로 받거나 함수를 결과로 반환하는 고차 함수를 정의할 수 있다. 아래의 예제에 나오는 apply는 함수와 정수 값을 인자로 받고, 인자로 받은 정수 값을 인자로 받은 함수에 적용한다.

```
def apply(f: Int => String, v: Int) = f(v)
apply((a: Int) => "value : "+ a, 10) // res0: String = value : 10
```
(* 문맥적으로 메서드를 함수로의 변경이 필요할 경우, 메서드는 자동으로 함수로 실행된다.)
아래의 예제를 추가적으로 살펴보자

```
class Decorator(left: String, right: String) {
  def layout[A](x: A) = left + x.toString() + right
}
object FunTest extends App {
  def apply(f: Int => String, v: Int) = f(v)
  val decorator = new Decorator("[", "]")
  println(apply(decorator.layout, 7)) // [7]
}
```
(*위의 예제는 함수를 인자로 받는 high-order function(고차함수)를 보여주기 위함으로 이해된다. 그 이유는 다음의 코드처럼 ```decorator.layout(7)```으로 실행해도 동일한 결과가 나오기 때문이다. )

위의 예제에서 decorator.layout 메서드는 apply 메서드에서 필요로 하는 Int => String 타입의 함수로 실행되었다. decorator.layout은 다형적 메서드이며(* generic을 사용하여 인자의 타입을 추상화 하였다.), Scala compiler는 메서드의 타입을 먼저 구체화하여 compile을 진행하게 된다.

## Nested Functions
스칼라에서 중첩 함수(Nested function)를 사용할 수 있다. 다음의 예제에 선언된 object는 기준값(threshold)이하의 값을 걸러내는 filter 함수를 제공한다.

```
object FilterTest extends App {
	def filter(xs: List[Int], threshold: Int) = {
    def process(ys: List[Int]) : List[Int] = {
      if(ys.isEmpty) ys		//주어진 List가 비어있을 경우, 그대로 반환.
      else if (ys.head < threshold) ys.head :: process(ys.tail) // ys.head 첫번째 요소가 threshold보다 작으면, 나머지 리스트의 요소에 대해 process를 호출하여 반환되는 결과를  head와 합침.
      else process(ys.tail)
    }
    process(xs) // 중첩함수(Nested function) 호출
  }
  println(filter(List(1, 9, 2, 8, 3, 7, 4), 5))
}
```
##### output
```
List(1, 2, 3, 4)
```

***Note: 중첩함수(Nested function) process는 해당 함수의 외부에서 선언된, filter함수의 매개변수로 주어진 threshold 변수를 참조한다.***

## Currying
메서드(혹은 함수)는 하나 이상의 인자를 가질 수 있도록 선언할 수 있다. 그런데 메서드(혹은 함수)가 호출 될때 선언된 인자보다 적은 인자를 받을 경우, 해당 메서드는 나머지 인자를 받을 수 있는 함수를 반환한다.

아래의 예제를 살펴보자

```
object CurryingTest extends App {
	/*
	Int형의 요소를 가지는 리스트(xs)와 Int형의 인자를 받아 boolean을 반환하는 함수를 인자로 받는 filter함수이고
	filter함수는 인자로 받은 p함수가 true를 반환하는 인자들을 반환한다.
	*/
	def filter(xs: List[Int], p: Int => Boolean) : List[Int] = {
    if(xs.isEmpty) xs
    else if(p(xs.head)) xs.head :: filter(xs.tail, p)
    else filter(xs.tail, p)
  }

  def modN(n: Int)(x: Int) = ((x % n) == 0) //currying function으로 인자를 두개 받도록 선언되어 있다. 단 def modN(n: Int, x: Int) 이렇게 선언하면 호출 시 반드시 인자를 두개 넘겨주어야 한다. 즉, 컴파일 에러가 난다.
  val nums = List(1,2,3,4,5,6,7,8)

  println(filter(nums, modN(2)))  // currying function인 modN 호출을 하고 있지만 인자를 하나만 주고 있다. 하지만 실행 시에 filter의 개별 요소를 나머지 인자로 넘겨주게 된다.
  println(filter(nums, modN(3)))

}
```
##### output
```
List(2, 4, 6, 8)
List(3, 6)
```

***Note: method modN는 두번의 filter함수 호출에서 부분적으로 적용되었다. 즉, 첫번째 인자만을 주어 부분적으로 적용한 것이다. 그렇기때문에 modN(2)는  Int => Boolean 함수를 반환한다. 따라서 filte함수 내에서 반환된 함수(Int => Boolean)가 호출되는 것이다. ***
