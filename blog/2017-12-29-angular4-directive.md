---
slug: Angular4_directive_summary
title: Angular4 지시자(Directive) 요약정리
authors: ryukato
date: 2017-12-27 09:36:55
tags: [JavaScript, Angular4, Directive]
---

<!-- truncate -->

# Angular4 - 지시자(Directive)
Angular에서 가장 중요한 콤포넌트로 지시자는 DOM을 다루기 위한 모든것으로 정의할 수 있으며, 템플릿을 동적으로 만들어주는 요소이다.
다시 말하면, 콤포넌트(Component)는 지시자(Directive)의 하위 객체이다. 단 지시자는 뷰(View)를 가질 수 없기때문에, 콤포넌트를 하위(자식)
으로 가질 수 없다. 마찮가지 이유로 지시자는 콤포넌트 트리상에서 루트(최상위 객체)가 될 수 없다.

아래에서 설명할 지시자는 넓은 범위(콤포넌트의 상위 개념)이 아닌 좁은 범위(콤포넌트를 제외한)를 말한다.
지시자는 크게 구조 지시자와 속성 지시자로 구분할 수 있다.

## 구조 지시자 (structural directive)
구조 지시자는 DOM의 구조를 동적으로 처리할 때 사용한다.
구조 지시자의 대표적인 예는 **NgIf**, **NgSwitch**, **NgFor** 지시자들이 있다.

### NgIf
```*ngIf```로 DOM에 사용하며, 참/거짓을 반환하는 표현식을 좌변에 가질 수 있다.

##### NgIf 사용 예
```
<span *ngIf="isValid">Pass</span>
<span *ngIf="!isValid">Fail</span>
```

### NgSwitch
```[ngSwitch]```와 ```*ngSwitchCase``` 로 DOM에 사용하며, 일반적인 switch case 구문을 생각하면 된다. 좌변에는 바인딩할 콤포넌트의 속성을 명시하면 된다.

```
<div [ngSwitch]="colors">
  <span *ngSwitchCase="'red'">RED</span>
  <span *ngSwitchCase="'green'">GREEN</span>
  <span *ngSwitchDefault>WHITE</span>
</div>
```

### NgFor
일반적인 for를 사용한 반복문을 생각하면 된다. 따라서 for 반복문과 비슷하게 `let {배열 요소} of {배열}`의 문법으로 선언하여 사용하면 된다. 또한 인덱스(index)를 사용해야 할 경우, 다음과 같이 선언하여 사용하면 된다.

```
*ngFor="let i = index; let item of list"
```

아래의 예시 코드와 같이 ```*ngFor``` 지시자를 활용하여 DOM을 반복적으로 표시할 수 있다.

```
<span *ngFor="let i=index; let item of numbers">
  <span>index: {{i}}</span>
  <span> item: {{item}}</span><br/>
</span>
```

## 속성 지시자 (attribute directive)
속성 지시자는 DOM의 속성을 앵귤러 방식으로 관리할때 사용한다. 속성 지시자로는 **NgClass**와 **NgStyle**이 있다.

### NgClass
NgClass는 DOM의 class 속성을 동적으로 변경하기 위해 사용하며```[]```내에는 ```ngClass``` 혹은 ```[class.class명]```을 사용할 수 있다.

```ngClass```를 사용할 경우, 좌변에는 사용할 클래스명을 포함하는 콤포넌트의 속성을 명시하면 된다.
```[class.class명]```를 사용할 경우, 좌변에는 참/거짓을 반환하는 표현식을 명시하면 된다.

###### ngClass 사용

```
<span [ngClass]="myClass"></span>
```

######```[class.class명]```사용

```
<span [class.myClass]="isApplyMyClass"></span>
```

### NgStyle
사용법은 **NgClass**와 유사하다.

```
<span [ngStyle]="myStyle"></span>
```

**NgClass**와 **NgStyle**의 좌변으로 객체를 사용할 수 있다. 단 **NgClass**의 경우 객체의 속성 중 참 혹은 거짓을 반환하는 속성의 키 값만 사용이 된다. 예를 들어 ```{ 'my-class': false, 'your-class': 'true', 'no-class': 0 }``` 이 좌변에 사용이 된다면 실제 적용되는 클래스는 **your-class**만이 적용된다.

**NgStyle**의 경우,```this.styleConf = {color: this.isRed ? 'red' : 'blue', 'font-size': this.isLarge ? '20px;' : '12px;'}``` 로 콤포넌트에 styleConf가 정의하여 사용할 수 있다. 
