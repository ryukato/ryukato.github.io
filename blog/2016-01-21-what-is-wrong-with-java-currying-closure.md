---
slug: currying_closure_in_java8
title: Java 8의 문제점 - 커링(currying)대 클로져(closure))
authors: ryukato
date: 2016-01-21 09:36:55
tags: [Java, Closure, Currying]
---

<!-- truncate -->

# Java 8의 문제점: 커링([currying](https://en.wikipedia.org/wiki/Currying))대 클로져([closure](https://en.wikipedia.org/wiki/Closure_(computer_programming)))

[원문-What's Wrong with Java 8: Currying vs Closures](https://dzone.com/articles/whats-wrong-java-8-currying-vs)


Java 8을 둘러싼 잘못된 생각들이 많이 있다. 이중에 하나는 Java 8에서부터 Java가 closure를 지원한다고 생각하는 것이다. 이것은 잘못된 생각이다. 왜냐하면  언어가 생긴이래로 이미 Java에는  계속 closure가 존재했었다. 하지만 Java에서의 closure는 굉장히 위험하다. 그리고 Java8이 함수형 프로그래밍을 향해 갈 것으로 보이지만, Java에서의 closure는 최대한 사용을 자제하는 것이 좋다. 그렇지만 Java8은 이런 부분에 대해 도움을 주지 못하고 있다.

메서드를 사용하는 것과 함수를 사용하는 것 사이에 하나의 큰 차이는 바로 매개변수(parameter)의 값을 구하는 시점이다. Java에서는, 몇몇 인자들을 받아 하나의 값을 반환하는 메서드를 작성할 수 있다. 그런데 이것이 함수인가? 전혀 아니다. 해당 메서드를 호출하는 것말고 다른 방법으로는 해당 메서드를 처리할 수 없고, 이런 이유로 해당 메서드의 실행전에 그 인자들의 값은 구해질 것이다. 이것은 자바에서 값으로 해당 인자들이 전달된 결과이다.

함수는 위에서 언급한 것과는 다르다. 함수들을 전개하지 않고도 함수들을 처리할 수 있다. 그리고 인자들의 값을 구했을때, 완벽하게 제어를 할 수 있다. 그리고 만약 함수가 여러개의 인자를 가질 경우, 인자들은 각가 다른 시점에 값이 구해질 수 있다. 바로 currying을 사용하여 각 인자들이 다른 시점에 값이 구해 질 수 있도록 할 수 있다. 하지만 먼저, closure를 가지고 어떻게 하면 currying과 같이 처리할 수 있는지 보자.

## Closure 예제
Closure는 자신을 둘러싼 context내의 변수등에 접근 할 수 있다. 함수형 프로그래밍에서, 함수의 결과는 함수의 인자에 따라 값이 결정된다. closure는 이런 규칙을 깨버린다.

아래의 예제를 살펴보자. (* 약간 억지스럽긴 하지만 충분히 발생 가능한 상황이라고 생각이 된다. 참조와 final에 대한 개념이 충분하지 않은 상황에서 아래와 같은 코드를 사용하고 만약 문제가 발생한다면 원인을 찾기 힘들어 질 수 있을 것이라고 생각된다.)

```

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ClosureTest {
	private Integer b = 2;
	List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);

	public void doTest(){
		System.out.println(calculate(list.stream(), 3).collect(Collectors.toList()));
	}
	private Stream<String> calculate(Stream<Integer> stream, Integer a) {
	  return stream.map(t -> String.valueOf(t * a + b));
	}

	public static void main(String[] args) {
		new ClosureTest().doTest();
	}
}
```
결과는 아래와 같을 것이다.

```
[5, 8, 11, 14, 17]
```
위의 결과는 리스트 [1, 2, 3, 4, 5]의 요소에 대한 함수 f(x) = x * 3 + 2를 적용한 결과이다. 여기까지는 일단 문제가 없어 보인다. 그런데 잠깐... 3과 2가 다른 값으로 대체될 수 있을까? 다시 말해서, 리스트 [1, 2, 3, 4, 5]의 요소에 대해 함수 f(x, a, b) = x * a + b를 적용 할 수 있을 것인가 하는 말이다. 음, 할 수 없다. a와 b는 암묵적으로 final이다. 따라서 함수가 실 전개될때 a와 b는 상수처럼 사용된다. 그렇지만 a와 b의 값은 바뀔 수 도 있다. a와 b가 final이란 사실만이 컴파일러가 컴파일을 최적화하기위한 유일한 방법이다. 컴파일러는 잠재적으로 값이 바뀔 수 있다는 것에 신경을 쓰지 않는다. 컴파일러가 오로지 신경을 쓰는 부분은 바로 참조값이 바뀌지 않도록 하는 것이다. 다시 말해서, 컴파일러가 원하는 것은 a와 b가 가지는 Integer객체의 참조값이 바뀌지않는 것만을 원하는 것이다. 하지만 함수내에서 사용되는 값에 대해서는 신경쓰지 않는다. 이런 현상은 아래의 예제에서 발생한다.

```
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ClosureTest {
	private Integer b = 2;
	private Integer getB(){
		return this.b;
	}
	List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);

	public void doTest(){
		//System.out.println(calculate(list.stream(), 3).collect(Collectors.toList()));

		System.out.println(calculate(list.stream(), new Int(3)).collect(Collectors.toList()));
	}
	private Stream<String> calculate(Stream<Integer> stream, Int a) {
		a.setValue(10); //함수내에서 사용되는 a의 값 value는 변경될 수 있다. 이러면 side-effect가 발생할 수 있다.
	  return stream.map(t -> String.valueOf(t * a.value + getB()));
	}

	public static void main(String[] args) {
		new ClosureTest().doTest();
	}

	private static class Int{
		public int value;

		public Int(int value){
			this.value = value;
		}
		public void setValue(int value){
			this.value = value;
		}
	}
}
```
여기서 우리는 변경가능한 객체를 a가 참조하도록 하였고, b에 접근해서 반환하도록 하는 메서드를 사용했다. 이제 세개의 변수를 사용하는 함수를 흉내를 내보았다. 그렇지만 여전히 하나의 변수를 사용하는 함수와 다른 두 변수를 대체할 두개의 closure를 사용했다. 이것은 분명히 함수적이지 않다. 험수는 함수에 주어진 인자에만 의존하여야 한다는 규칙을 어겼기때문이다.

위의 예제를 통해 얻은 하나의 결론은 위에 정의된 함수를 재사용할 필요가 있을 것 같은데 실은 재 사용을 할 수 없을 수도 있다는 것이다. 왜냐면 주어진 인자에만 의존하는 것이 아니라 주어진 context (*자신이 선언된 객체의 속성등을 사용하는*)에 의존하기 때문이다. 그래서 중복된 코드를 작성해야 할 것이다. 또 다른 결론은 정의한 함수를 고립시켜서(다른 속성 및 상황에 영향을 받지 않는)테스트 할 수 없다는 것이다. 그 이유는 해당 함수가 의존하는 context를 생성해야 하기 때문이다.

그래서, 세개의 인자를 가지는 함수를 사용해야만 할까? 어쩌면 불가능할 수도 있다라고 생각할 수 도 있다. 그 이유는 함수에 주어야할 인자들이 어디서 값이 적용이 되는지에 관계되어있기때문이다. 세개의 모든 인자가 각각 다른 곳에서 값이 적용이 되고 있다. 만약에 세개의 인자를 가지는 함수를 사용한다면, 동일한 시점에 그 세개의 인자에 값이 적용이 되어야 한다. 이게 불가능한 이유는 map메서드는 세개의 인자를 가지는 함수가 아닌, 하나의 인자를 가지는 함수를 stream에 적용을 할 것이기때문이다. 그렇기때문에, 두개의 인자는 해당 함수가 map메서드에 전달이 될때, 이미 값이 적용이 되어있어야만 한다. 해답은 두개의 인자에 먼저 값을 적용하는 것이다.

clousure를 통해 동일한 효과를 얻을 수 있다. 하지만 아래의 예제코드는 테스트가 가능하지 않고 중복된 코드를 만들어낼 잠재적 가능성이 있다. Java8의 lamda식을 사용한 코드는 아래와 같다. 하지만 달라지는 것은 없다.

```
private Integer b = 2;
private Stream<Integer> calculate(Stream<Integer> stream, Integer a){
	return stream.map(t -> t * a + b)			
}
```

우리가 필요한 방법은 세개의 모든 인자들을 각기 다른 시점에 적용을 하는 것이다. 이런 방법은 커링(currying)이라고 한다. (이름은 커링인데 실제로 개발한 사람의 이름은 *Moses Shönfinkel* 이다.)

## 커링 사용하기

커링은 각 단계에서 하나의 인자를 가지는 함수를 생성하면서, 함수의 인자를 하나씩 하나씩 적용하는 것이다. 예를 들어, 다음과 같은 함수가 있다면

```
f(x, y, z) = x * y + z
```
3, 4, 5라는 인자들을 동시에 적용하여 다음과 같은 결과를 얻을 것이다.

```
f(3, 4, 5) = 3 * 4 + 5 = 17
```
하지만 3 하나만을 적용한다면, 다음과 같을 것이다.

```
f(3, y, z) = g(y, z) = 3 * y + z
```

자 이제 두개의 인자를 가지는 g라는 새로운 함수가 생겼다. 우리는 4를 y에 적용하여 이 함수를 다시 커링할 수 있다.

```
g(4, z) = h(z) = 3 * 4 + z
```
인자를 적용하는 순서는 크게 상관이 없다. 우리는 부분적인 계산을 수행하는 것이 아니기때문이다.(하지만 연산자의 순서는 잘 지켜야 할 것이다.) 우리는 함수의 부분적인 적용을 한 것이다.

이것을 Java에서 어떻게 구현할 수 있을까? 아마도 다음의 예제와 같이 할 수 있을 것이다.

```
public class CurryTestWithCurrying {
	private static Integer b = 2;
	private static List<Integer> calculate(List<Integer> list, Integer a){
		return list.stream().map(new Function<Integer, Function<Integer, Function<Integer, Integer>>>() {
		    @Override
		    public Function<Integer, Function<Integer, Integer>> apply(final Integer x) {
		      return new Function<Integer, Function<Integer, Integer>>() {
		        @Override
		        public Function<Integer, Integer> apply(final Integer y) {
		          return new Function<Integer, Integer>() {
		            @Override
		            public Integer apply(Integer t) {
		              return x + y * t;
		            }
		          };
		        }
		      };
		    }
		  }.apply(b).apply(a)).collect(Collectors.toList());
	}

	public static void main(String[] args) {
		List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
		System.out.println(calculate(list, 3));
	}
}
```
결과

```
[5, 8, 11, 14, 17]
```

위의 예제 코드는 확실히 정확한 결과를 내고 있다. 하지만 저런 형식으로 코드를 작성하기는 쉽지 않아 보인다. 그렇지만 희망적이게도 lamda식을 사용하면 좀 더 코드는 간결해질 수 있다.

```
private static List<Integer> calculateWithLamda(List<Integer> list, Integer a){
	return list.stream().map(((Function<Integer, Function<Integer, Function<Integer, Integer>>>)
            x -> y -> t -> x + y * t).apply(b).apply(a)).collect(Collectors.toList());
}
```
Java8은 타입 추론을 못하기때문에 `(Function<Integer, Function<Integer, Function<Integer, Integer>>>)` 이런식으로 캐스팅을 해주어야한다. 그래서 타입을 확실히 알려줘야 하기때문에 캐스팅 구문을 써준 것이다. 위의 코드를 좀 더 줄이기 위해 다음과 같이 약간의 꼼수를 쓸 수 도 있다.

```
private static List<Integer> calculateWithLamdaMoreSimple(List<Integer> list, Integer a){
	return list.stream().map(((F3) x -> y -> t -> x + y * t).apply(b).apply(a)).collect(Collectors.toList());
}

interface F3 extends Function<Integer, Function<Integer, Function<Integer, Integer>>>{}
```
자 그럼 이제 다음과 같이 정의한 함수에 이름을 주고 필요할 때 재사용할 수 있다.

```
private static List<Integer> calculateWithLamdaMoreSimple(List<Integer> list, Integer a){
	final F3 calcFunc = ( x -> y -> t -> x + y * t);
	return list.stream().map(calcFunc.apply(b).apply(a)).collect(Collectors.toList());
}
```
calculate를 helper 클래스의 static 멤버로 선언해놓고 사용한다면 코드는 좀 더 깔끔해 질 것이다.

```
private static class Funcitons{
	static Function<Integer, Function<Integer, Function<Integer, Integer>>> calculation = x -> y -> t -> x + y * t;

}

private static List<Integer> calculateWithLamdaMoreSimple(List<Integer> list, Integer a){
	return list.stream().map(Funcitons.calculation.apply(b).apply(a)).collect(Collectors.toList());
}
```

안타깝게도 Java8은 cloure의 사용을 권장한다. 개인적인 생각으론 커링의 사용을 쉽게 하기 위해 문법적 간결함(용이성)을 제공하는 것이 훨씬 좋았을 것으로 생각된다. Scala에서는 위의 예제를 다음과 같이 작성할 수 있다.

```
stream().map(calculation(b)(a))
```
하지만 Java에서는 이렇게 하지 못한다. 하지만 다음과 같은 static메서드를 정의해서 위에 유사한 코드를 작성할 수 있을 것이다.

```
static Function<Integer, Function<Integer, Function<Integer, Integer>>> calculation
    = x -> y -> z -> x + y * z;
static Function<Integer, Integer> calculation(Integer x, Integer y) {
  return calculation.apply(x).apply(y);
}

private Stream<Integer> calculate(Stream<Integer> stream, Integer a) {
  return stream.map(calculation(b, a));
}
```
참고로 **calculation(b, a)**는 두개의 인자를 가지는 함수는 아니다. 그것은 단지 인자를 세개 가지는 함수에 두개의 인자를 부분적(하나씩 하나씩)으로 적용한후에 하나의 인자를 가지는 함수를 반환해주는 메서드일뿐이다. 결과적으로 보면 하나의 인자를 가지는 함수를 map메서드에 넘겨줄 준비가 된것이다.
(*덧붙이자면 이미 넘져준 두개의 인자는 값이 적용이 된 상태이기때문에, 반환되는 함수에는 closure가 적용되지 않는다라고 생각된다.*)
또한  이제 ** calculation**은 고립시켜서 테스트가 가능하다.

## 자동 커링
이전의 예제에서, 직접 커링을 적용해 보았다. 그러나 컴퓨터를 사용하는 입장에서, 컴퓨터가 직접 커링을 해주도록 할 수 있다. 우리는 두개의 인자를 받는 함수를 인자로 받고 커링된 함수를 반환하는 메서드를 작성할 수 있다. 아래의 예제처럼 매우 간단한다.

```
public <A, B, C> Function<A, Function<B, C>> curry(final BiFunction<A, B, C> f){
	return (A a) -> (B b) -> f.apply(a, b);
}
```
*원문에는 없지만 참고로 위의 예제중 list(1, 2, 3, 4, 5)를 가지고 결과 [5, 8, 11, 14, 17]을 출력하는 예제와 동일한 결과를 내기 위해서는 바로 위의 예제를 다음과 같이 활용하면된다.*

```
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
System.out.println(list.stream().map( t-> curry(biFunc).apply(t * 3).apply(2)).collect(Collectors.toList()));
```
커링을 역으로 처리하는 메서드를 다음과 같이 작성할 수 있다. C를 반환하는 B의 함수, 그리고 다시 B의 함수를 반환하는 A의 함수를 인자로 받아, A와 B를 인자로 받아 C를 반환하는 BiFunction을 반환하는 메서드이다.

```
public static <A, B, C> BiFunction<A, B, C> uncurry(Function<A, Function<B, C>> f){
	return (A a, B b) -> f.apply(a).apply(b);
}
```
*원문에는 없지만 참고로 위의 예제중 list(1, 2, 3, 4, 5)를 가지고 결과 [5, 8, 11, 14, 17]을 출력하는 예제와 동일한 결과를 내기 위해서는 바로 위의 예제를 다음과 같이 활용하면된다.*

```
Function<Integer, Function<Integer, Integer>> f = (Integer a) -> (Integer b) -> (a + b);
BiFunction<Integer, Integer, Integer> biFunc = uncurry(f);
System.out.println(list.stream().map( t -> biFunc.apply(t * 3, 2)).collect(Collectors.toList()));
```

## currying의 다른 응용들
커링의 다른 응용들이 있겠지만, 가장 중요한 점은 하나 이상의 인자를 받는 함수를 모의로 구현해 보았다는 것이다. Java8에는, 하나의 인자를 받는 함수들(**java.util.functions.Function**)이 있고 두개의 인자를 받는 함수(**java.util.functions.BiFunction**)가 있다. 다른 언어에서 처럼 세개, 네개, 다섯개 혹은 그 이상의 인자를 받는 함수는 존재하지 않는다. 그렇지만 그런 함수들은 필요하지 않다. 그들은 여러 인자들이 동시에 값이 적용되어야 하는 경우를 위한 단지 문법적 용이성을 위한 것일뿐이다. 이런 이유로 Java 8에 BiFunction이 존재하는 것이다.(??) 한가지 함수의 주된 사용은 binary operator를 가장하기 위해서이다.( *참고로 Java 8에 BinaryOperator가 있지만 동일한 타입의 두개의 인자를 받아서 동일한 타입의 값을 반환하는,매우 제한적인 용도로 사용된다.*)

*원문에는 없는 BinaryOperator의 사용 예제는 아래와 같다.*

```
System.out.println("BinaryOperator to find max value : " + java.util.function.BinaryOperator.maxBy((Integer a, Integer b) -> a - b).apply(1, 2));
```

커링은 함수의 인자들이 반드시 다른 곳에서 값이 적용되어야 할 경우에 매우 유용하다. 커링을 사용해서, 하나의 인자는 이쪽 콤포넌트에서 값을 적용하고 그 결과를 또 다른 인자의 값을 적용하기 위해 다른 콤포넌트에 전달하여,결국 모든 인자들의 값이 적용될때까지 진행할 수 있다.


## 정리
Java 8은 함수형 언어와는 상당한 거리가 있다.(아마도 계속 그럴 것 같다.) 그러나 함수형 패러다임을 사용하여 Java 8(혹은 그 이하 버전)에서 코드를 작성할 수 있다. 단지 비용이 들뿐이다. 그리고 그 비용은 Java 8에서 많이 줄어들었다. 하지만 함수형 코드를 작성하고 싶어하는 개발자들은 함수형 패러다임에 걸맞게 코드를 작성하기 위해 여전히 지적인 노력을 필요로 한다. 커링의 사용이 그중 하나이다.

다음을 기억하자.

```
(A, B, C) -> D
```
Java 8이 위의 표현의 타입을 추론할 수 없더하더라도 위의 코드는 언제나 다음과 같이 치환될 수 있다.

```
A -> B -> C -> D
```
위와 같은 표현식을 사용하기 위해선 직접 타입을 명시해 주어야 한다. 이것이 커링이고 closure를 사용하는 것 보다 더 안전하다.


(*발번역, 오역, 직역이 많아 이해하기 힘들 수 있습니다. 그러니 한번 읽어보고 원문을 꼭 읽어보시길 바랍니다.*)
