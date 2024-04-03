---
slug: Angular4 data binding 요약정리
title: Angular4 data binding 요약정리
authors: ryukato
date: 2017-12-27 09:36:55
tags: [JavaScript, Angular4, 'Data binding']
---

# Angular4 Data Binding 요약 정리
데이터 바인딩은 뷰와 콤포넌트에서 발생한 데이터의 변경 사항을 자동으로 일치시켜주는 것을 말한다.
또한 데이터 흐름에 따라 **양방향**, **단방향** 바인딩으로 구분된다.

## 양방향, 단방향 데이터 바인딩
**양방향** 데이터 바인딩은 뷰와 콤포넌트 사이의 상태(혹은 값)의 변경을일치 시키며, 뷰에서 콤포넌트, 콤포넌트에서 뷰, 이 두 방향 모두를 지원한다.
반면 **단방향** 데이터 바인딩은 콤포넌트에서 뷰 혹은 뷰에서 콤포넌트 한쪽으로 만 데이터를 바인딩 해준다.

## 삽입식, 프러퍼티 그리고 이벤트 바인딩
**양방향** 데이터 바인딩과는 달리 **단방향** 데이터 바인딩은 바인딩 방식에 따라 아래와 같이, 삽입식, 프로퍼티 그리고 이벤트 바인딩으로 나눌 수 있다.

### 삽입식 바인딩
아래의 코드와 같이 콤포넌트의 속성을 ```{{ }}```로 감싸, 뷰에 선언한 방식이 삽입식 바인딩이다. 콤포넌트의 상태값이 변경하게 되면 자동으로 뷰에 표시되는 값도 변경이 된다.

###### sample-component.html
```
<span>{{ name }}</span>
```

###### sample-component.ts

```
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-sample-component',
  templateUrl: './sample-component.component.html',
  styleUrls: ['./sample-component.css']
})
export class SampleComponent implements AfterViewInit {
  name: string = "";

  constructor() { }

  ngAfterViewInit(): void {
    const setDefaultName = () => {
      this.name = "default";
    };
    setTimeout(setDefaultName, 5000); // 5초 후에, name 속성의 기본값을 설정한다.
  }
}

```

### 프로퍼티 바인딩
DOM(Document Object Model)이 가지고 있는 속성(프로퍼티)를 ```[]```로 감싸 바인딩하는 방식이다. ```[]```안에는 DOM요소(태그)가 가지는 속성을 명시하고 아래의 예제 코드와 같이 ```=```로 구분되는  ```[]``` 의 값은 표현식(expression)을 적어주면 된다.

###### sample-component.html
```
<button type="button" name="button" [disabled]="!isInputValid">Submit</button>
```

###### sample-component.ts

```
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample-component',
  templateUrl: './sample-component.component.html',
  styleUrls: ['./sample-component.css']
})
export class SampleComponent {
  isInputValid: boolean = false;
}

```

### 이벤트 바인딩
이벤트 바인딩은 말 그대로 버튼 클릭등과 같은 사용자의 action에 따른 이벤트 처리를 위한 DOM 이벤트 핸들러로 컴포넌트의 메서드를 사용할 수 있다.
이벤트 명을 ```()```안에 적어주면되고, ```=```를 기준으로 우변에 핸들러 사용할 메서드를 적어주면 DOM 이벤트와 컴포넌트의 메서드를 서로 바인딩 할 수 있다.

###### sample-component.html
```
<input type="text" name="name" id="name" #name >
<button type="button" name="button" (click)="handleClick(name.value)">Submit</button>
```

###### sample-component.ts

```
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample-component',
  templateUrl: './sample-component.component.html',
  styleUrls: ['./sample-component.css']
})
export class SampleComponent {
  name: string = '';

  handleClick(name: string) {
    this.name = name;
  }
}

```
