---
slug: Java Map Literal
title: Java Map Literal
authors: ryukato
date: 2016-02-12 16:57:29
tags: [Java, Map, Literal]
---

<!-- truncate -->

# Java Map Literal
다른 언어에서 Map문자열을 지원하는데, Java에서는 이를 지원하지 않는다. 그런데 [DZone](https://dzone.com/articles/using-factory-methods-to-simulate-map-literals-in)이라는 웹 싸이트를 보다가 Java에서도 이와 유사하게 구현을 할 수 있는 것을 발견하여, 이에 대한 내용을 적어 본다.

다른 언어 Swift, JavaScript, Python 그리고 Scala(Literal까진 아니지만, 그래도 끼워준다)들이 지원하는 Map literal을 살펴보자

### Swift

```
var dictionary = ["a": 1, "b": 2, "c": 3]
```

### JavaScript

```
var object = {"a": 1, "b": 2, "c": 3};
```
혹은

```
var object = new Object();
object["a"] = 1;
object["b"] = 2;
object["c"] = 3;
```

### Python

```
map = { "a": 1, "b": 2, "c": 3}
map.get("a") // 결과 1
```

### Scala

```
val map = Map("a" -> 1)
map.get("a") // 결과  Option[Int] = Some(1)
map.get("a").get // 결과  Int = 1
```

### Java
위에서와 같이 다른 언어들은 Java 보다 쉽게 literal에서 Map을 생성할 수 있다. 그런데 Java에서는 아래와 같이 Map을 생성하고 일일이 key, value의 element를 넣어 주어야 한다.

```
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
```

이렇게 하는데 전혀 불편함이 없는 개발자분도 있겠지만, 난 다른 언어처럼, 조금이라도 짧게 코드를 작성하면 좋을 것 같다. Java처럼 JVM에서 실행가능한 Groovy를 사용하면 짧은 코드를 작성할 수 있겠지만 그 방법 말고 다른 방법으로 해보겠다.

#### Factory method를 사용한 개선
Java의 Map을 살펴보면, key, value의 element를 Entry interface로 감싸서 사용을 한다. 그래서 아래와 같이 mapOf 메서드의 인자를 `Map.Entry<K,V>` 타입의 가변인자로 선언하면 보다 쉽게 Map을 생성할 수 있지 않을까 한다.

```
@SafeVarargs
public static <K, V> Map<K, V> mapOf(Map.Entry<K, V>...entries){
    Map<K, V> map = new HashMap<>();
    for(Map.Entry<K, V> entry: entries){
        map.put(entry.getKey(), entry.getValue());
    }
    return map;
}

public static <K, V> Map.Entry<K, V> entry(K key, V value){
    return new AbstractMap.SimpleEntry<>(key, value);
}

Map<String,Integer> map2 = mapOf(entry("a", 1), entry("b", 2), entry("c", 1));
```

그런데 막상 작성하고 보니, 그렇게 짧아진것 같진 않다. 흠~
그렇지만 포기하긴 이르다 그리고 기대해도 되는 것은 Java9에 Map뿐만이 아닌 Collection전체에 대한 Collection literal을 지원해줄 예정이라는 것. 내년까지 좀 기다려야겠지만…

JEP-186과 JEP-269을 보면 알 수 있다.
Java9이 릴리즈가 되면 아래와 같이 Map, Set 그리고 List를 생성할 수 있을 것으로 생각된다.

#### Java 9의 Map factory method

##### Map

```
Map.of()
Map.of(k1, v1)
Map.of(k1, v1, k2, v2)
Map.of(k1, v1, k2, v2, k3, v3)
```

##### Set and List

```
Set<String> set = Set.of("a", "b", "c");
List.of(a, b, c);
```

Java 8에는 람다, 그리고 Java9에는 Collection literal, 이런 Java의 발전, 개선이 있어 점점 코딩하기에도 조금씩 편해지는 것 같다.
