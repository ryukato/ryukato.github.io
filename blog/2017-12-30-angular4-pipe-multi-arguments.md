---
slug: Angular4 파이프에 다수의 인자 넘기기
title: Angular4 파이프에 다수의 인자 넘기기
authors: ryukato
date: 2017-12-30 09:36:55
tags: [JavaScript, Angular4, 'Pipe multi-arguments']
---

<!-- truncate -->

# Angular4 - 파이브에 다수의 인자 넘기기
Angular의 파이프는 Angular에서 제공하는 **PipeTransform** 인터페이스의 구현체이다.
따라서 **PipeTransform** 인터페이스에 선언된 ```transform(value: any, ...args: any[]): any;``` 메서드만 구현하면 파이프로 사용이 가능하다.
물론 Angular에서 해당 콤포넌트를 파이프로 인식 할 수 있도록 ```@Pipe``` 데코레이터와 메타 데이터를 해당 콤포넌트 클래스 상단에 선언해야 한다.
예를 들면 아래와 같다.

```
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'custom'
})
export class CustomPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return `${value}-custom`;
  }
}

```

```
<span>{{'홍길동' | custom }}</span>
```

```transform(value: any, ...args: any[]): any;``` 메서드의 첫번째 인자는 위의 예제 코드에서와 같이 ```|```를 기준으로 왼쪽편의 값이 전달되는 것이다.
그리고 추가적으로 ```args?``` 매개변수가 있다. 그럼 ```args?```에는 어떤 인자가 넘어 오는 것일까?

아래와 같이 정의한 파이프 다음에 ```:```을 사용하여 추가적인 인자 값을 넘길 수 있다.
```
<span>{{'홍길동' | custom: 'test'}}</span>
```

그런데 추가로 전달하고 싶은 인자가 하나 이상일 때는 어떻게 해야 할까? ```transform``` 메서드를 보면 ```...args: any[]```와 같이 두번째 매겨변수가 선언이 되어있다. 다시 말하면, 가변 인자이며 타입은 모든 타입의 요소를 받을 수 있는 배열로 선언이 되어 있다. 따라서 아래와 같은 코드들을 사용하여 하나 이상의 인자를 넘길 수 있다.

```
<span>{{'홍길동' | custom: ['test', 'test2'] }}</span>
```

```
transform(value: any, args1: any, args2: any): any {
  return `${value}님`;
}

<span>{{'홍길동' | custom: 'test': 'test2' }}</span>
```
