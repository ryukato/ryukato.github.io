---
slug: Array toString with filtering null elements
title: Array toString with filtering null elements
authors: ryukato
date: 2016-01-11 09:36:55
tags: [Java, ArrayList, toString]
---

# 배열의 Null 요소를 뺀 toString
코드를 작성하다보면 배열에 담겨있는 요소들을 toString으로 확인해야 할 경우가 있다. 그런데 배열은 null을 허용하기때문에 다음과 같은 코드를 무심코 작성하게 되면 NullPointerException이 발생하게 된다.

## NullPointerException 발생코드
만약 배열에 포함된 요소 중, Null이 있다면 ```e.toString``` 실행 시, NullPointerException이 발생하게 된다. 비지니스 로직을 수행하던 것도 아닌 코드에서 발생한 예외로 심각한 상황(애플리케이션이 죽는)이 초래 될 수 도 있다.

```
public static <E> String toString(E[] array){
  StringBuilder sb = new StringBuilder();
  final String separator = ", ";
  for(int i = 0; i < array.length; i++){
    E e = array[i];
    sb.append(e.toString());
    if(i > 0 && i < array.length -1) {
      sb.append(separator);
    }
  }
  return String.format("[%s]", sb.toString().endsWith(separator) ? sb.toString().replaceAll(separator.concat("$"), ""): sb.toString());
}

```

## NullPointerException 발생방지 코드

```
public static <E> String toString(E[] array){
  StringBuilder sb = new StringBuilder();
  final String separator = ", ";
  for(int i = 0; i < array.length; i++){
    E e = array[i];
    if(e != null) { // null check
      sb.append(e.toString());
      if(i > 0 && i < array.length -1){
        sb.append(separator);
      }
    }
  } return String.format("[%s]", sb.toString().endsWith(separator) ? sb.toString().replaceAll(separator.concat("$"), ""): sb.toString());
}

```
그런데 배열의 내용을 확인할 목적의 toString 메서드 코드치곤 양이 너무 많다. Java8애서 제공하는 Stream, Function 그리고 lamda식을 사용하면 좀 간결해지지 않을까? 아래 처럼 말이다.

### Java 8 style - 배열인자

```
public static <E> String toString(E[] array) {
    String elements = Arrays.stream(array).filter(e -> (e != null))
            .map(e -> e.toString())
            .collect(Collectors.joining(", "));
    return String.format("[%s]", elements);
}

```

### Java 8 style - Collection인자

```
public static <E> String toString(Collection<E> collection) {
    String elements = collection.stream().filter(e -> (e != null))
    .map(e -> e.toString())
    .collect(Collectors.joining(", "));
    return String.format("[%s]", elements);
}

```

위의 코드들을 null이 포함된 배열이나, Collection을 가지고 실행한다면 아래처럼 결과가 나올것이다.

```
[1, 2, 3]
```

### Java 8 style - null요소를 ‘null’로 - Collection인자
참고로 아래는 null일 경우, ‘null’을 출력하도록 하는 코드이다.

```
public static <E> String toStringIncludeNull(Collection<E> collection) {
    String elements = collection.stream()
    .map(e -> e == null ? "null" : e.toString())
    .collect(Collectors.joining(", "));
    return String.format("[%s]", elements);
}
```

### Java 8 style - null요소를 ‘null’로 - 배열인자

```
public static <E> String toStringIncludeNull(E[] array) {
    String elements = Arrays.stream(array)
    .map(e -> e == null ? "null" : e.toString())
    .collect(Collectors.joining(", "));
    return String.format("[%s]", elements);
}
```

위의 두 메서드 실행 시 결과는 아래처럼 나올 것이다

```
[null, 1, 2, 3, null]
```
