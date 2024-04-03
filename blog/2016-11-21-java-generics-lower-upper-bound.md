---
slug: Java Generics - Lower and Upper bound
title: Java Generics - Lower and Upper bound
authors: ryukato
date: 2016-11-21 09:36:55
tags: [Java, Generics, Lower-bound, Upper-bound]
---

<!-- truncate -->

# Java Generics - Lower and Upper bound
## Lower bound
### Expression
Generic의 하위 경계는 다음과 같이 표현한다.

```
<? super A>
```
> 상하위 경계 표현을 동시에 사용할 수 는 없다.

### Examples
예를 들어 list에 정수를 넣고자 할 경우, 다음과 같이 선언할 수 있다.

```
List<Integer> list = ...
```

```
List<Number> list = ...
```

```
List<Object> list = ...
```

그렇지만 List의 표현은`List<? super Integer>`의 표현보다 더 제한적이다. 왜냐면`List<Integer>`는 해당 list에 포함될 요소가 반드시 Integer이어야 하기때문이다. 하지만 `List<? super Integer>`는 list에 포함될 요소의 type을 Integer의 모든 super타입으로 지정하기 때문에 좀 더 유연하다.

다음의 예제 코드는 lower bound wildcard를 사용한 메서드로 1부터 10까지 입력하는 코드이다.

```
public static void addNumbers(List<? super Integer> list){
    for(int i = 1; i <= 10; i++){
        list.add(i);
    }
}

```

## Upper bound
### Expression
Generic의 상위 경계는 다음과 같이 표현한다.

```
<?  extends A>
```

### Examples
예를 들어, List, List, List이 모두에 적용되는 코드를 작성하고자 할때, ```List<? extends Number>```와 같이 **상위 경계(upper bounded) wildcard** 를 사용한다. 이때 사용된 **extends**는 **상속(extends)와 구현(implements)**의 의미를 모두 포함하는 일반적인 의미로 사용된다.
이때 ```List<Number>```로 사용하게 되면, 실제 입력 가능한 요소의 type은 Number로 제한이 된다. 하지만 ```List<? extends Number>```로 선언하게 되면, 입력 가능한 요소는 Integer, Double, Float등 **Number의 하위 타입의 요소** 모두 입력 가능하다.즉, 아래와 같은 코드를 작성할 수 있게 된다.

```
public static double sumOfList(List<? extends Number> list) {
    return list.stream()
            .mapToDouble(a -> a.doubleValue())
            .sum();
}

public static void main(String[] args) {
List<Integer> list = Arrays.asList(1,2,3,4,5);
    System.out.println(sumOfList(list));
}

```

## Guidelines for Wildcard use
Generic을 사용하면서 헛갈리는 것중의 하나가 바로 언제 upper bounded 혹은 lower bounded wildcard를 사용해야 하는지 일 것이다.
아래의 두가지 경우를 예로 생각해 보자.

### In variables
copy라는 메서드가 다음과 같이 있다고 하였을 경우, ```copy(src, dest);``` src는 복사될 data를 제공해주는 변수이다. 이런 변수를 in 매겨변수라고 한다.

### Out variables
out 변수는 다른 곳에서 사용이 될 수 있는 변수를 말한다. 즉, 위의 copy의 예에서 보면, dest 매개변수는 data를 받아 들이는 변수로 사용이 된다. 이런 변수를 out매개변수라고 한다.

물론 특정 변수는 in, out 모두의 용도로 사용이 될 수 있다.

### Wildcard Guidelines
이런 in, out의 개념에 따라서, wildcard를 사용해야 하는지, 어떤 wildcard를 사용해야 하는지를 결정할 수 있다. 다음의 목록이 각각의 경우를 설명한다.

* in 변수는 extends 키워드를 사용하는 상위 경계(upper bounded) wildcard로 정의 될 수 있다.
* 위와 반대로 out 변수는 super키워드를 사용하는 하위 경계(lower bounded) wildcard로 정의할 수 있다.
* in 변수에 Object class에 정의된 메서드를 사용해서 접근할 수 있는 경우에는 상위 경계(upper bounded) wildcard를 사용한다.
* in, out 모두의 용도로 사용되는 변수에 접근해야 할 경우는 wildcard를 사용하지 않는다.

위의 guideline들은 메서드의 **반환 타입에는 적용되지 않는다**. 그리고 메서드의 반환 타입에 wildcard를 사용하는 것은 피하는 것이 좋다. 왜냐면 그렇게 선언을 해버리는 경우, 메서드를 구현할때 wildcard를 반드시 다루어야 하기때문이다. 다시말하면 wildcard를 사용할 수 밖에 없도록 강제되기 때문이다.

### Read-only
`List<? extends …>`의 형식으로 선언된 list를 아마도 read-only라고 생각할 수 도 있다. 하지만 이는 엄격하게 보장되지는 않는다. 다음과 같은 코드가 있다고 해보자.

```
class NaturalNumber {
    private int i;
    public NatualNumber(int i){this.i = i;}
    //...
}

class EventNumber extends NaturalNumber {
    public EventNumber(int i){
        super(i);
    }
    //...
}

```

다음과 같은 코드를 실행한다고 생각해보자.

```
List<EventNumber> le = new ArrayList<>();
List<? extends NaturalNumber> ln = le;
ln.add(new NaturalNumber(35)); //compile-time error

```

왜냐하면, List는 `List<? extends NaturalNumber>`의 하위 타입이므로 할당이 가능하다. 하지만 ln에 NaturalNumber타입의 요소를 추가를 할수는 없다.
> 왜냐면 wildcard기 때문에 확실한 타입을 알 수 없다. 따라서 타입을 모르는데 어떻게 입력하고자 하는 NaturalNumber 타입의 요소를 변환할 수 있겠는가?라는게 내 생각. 그리고 `<? extends…>`처럼 wildcard로 선언된 변수는 **in변수** 로만 사용 가능.

따라서 아래와 같은 메서드 호출만 가능하다.
* add null (null은 타입이 없기때문)
* clear 호출
* iterator를 반환 받아 remove 호출
* isEmtpy, size 등과 같이 type에 상관없는 메서드 호출.
