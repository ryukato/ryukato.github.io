---
slug: Scala Tutorial 번역 - Case Class
title: Scala Tutorial 번역 - Case Class
authors: ryukato
date: 2017-01-14 09:36:55
tags: [FP, Scala, Case Class]
---

<!-- truncate -->

## Case class
Scala는 case class를 지원한다. Case class는 다음과 같은 특징을 가지는 일반 class이다.
- 기본적으로 case class를 통해 생성되는 인스턴스는 불변(Immutable)이다.
- [Pattern matching](http://docs.scala-lang.org/tutorials/tour/pattern-matching.html)을 통해, 각각의 경우로 분해하여 선언할 수 있다.([decomposable](https://en.wikipedia.org/wiki/Decomposition_(computer_science)))
- 참조값으로 동치를 비교하지 않고 구조적 동치(속성들의 타입 과 값 비교)를 비교한다.
- 인스턴스를 간결하게 생성할 수 있고, 동작한다.

아래의 예제는 Notification이라는 최상위 추상 class와 case class를 사용하여 구현된 하위 타입의 Email, SMS, VoiceRecording들의 계층 구조를 보여주는 예제이다.

```
abstract class Notification
case class Email(sourceEmail: String, title: String, body: String) extends Notification
case class SMS(sourceNumber: String, message: String) extends Notification
case class VoiceRecording(contactName: String, link: String) extends Notification

```

아래와 같이 case class 인스턴스를 생성할때는 new 키워드를 사용하지 않고 바로 생성할 수 있다.

```
var emailFromJohn = Email("john.doe@mail.com", "Greetings From John!", "Hello World!")
```

case class의 생성자에 선언된 인자들은 언제 어디서든 접근 가능한 public변수로 취급된다.
(* 그 이유는 case class인스턴스는 기본적으로 속성의 값이 한번 설정이 되면 바뀌지 않는 불변객체이기 때문이다.)

```
var title = emailFromJohn.title
println(title) // prints "Greetings From John!"
```
case class로 정의한 객체의 속성의 값은 직접 수정이 불가하다. (* 속성을  **var** 키워드로 선언한다면 변경이 가능하지만, 권장하지 않는 방법이다.)

```
emailFromJohn.title = "Goodbye From John!" // 컴파일 에러!!!
```
대신, **copy** 메서드를 이용해서 인스턴서의 복사본을 만들 수 있다. 이때, 변경하고자 하는 속성의 값을 주어 기존의 속성값을 대체할 수 있다.

```
var editedEmail = emailFromJohn.copy(title="I am learning Scala!", body="It's so cool!")

println(emailFromJohn)
println(editedEmail)

```

###### output
```
Email(john.doe@mail.com,Greetings From John!,Hello World!)
Email(john.doe@mail.com,I am learning Scala!,It's so cool!)
```

모든 case class들에 대해 Scala compiler는 **equals**와 **toString**메서드를 생성해 준다. 생성된 **equals** 메서드는 아래와 같이 구조적 동치를 비교한다.

```
var firstSms = SMS("12345", "Hello")
var secondSms = SMS("12345", "Hello")

if(firstSms == secondSms){
  println("They are equal!")
}

println("SMS is : "+ firstSms)
```

###### output

```
They are equal!
SMS is : SMS(12345,Hello)
```

어떤 데이터를 다루는데 pattern matching과 case class를 이용할 수 있다. 아래의 예제에 선언된 함수는 수신한 Notification의 타입에 따라 다른 메세지를 출력하는 함수이다.

```
def showNotification(notification: Notification): String = {
    notification match {
      case Email(email, title, _) => "You got an email from "+ email + " with title: " + title
      case SMS(number, message) => "You got an SMS from " + number + "! Message: " + message
      case VoiceRecording(name, link) => "you received a Voice Recording from " + name + "! Click the link to hear it: " + link
    }
}


val someSms = SMS("12345", "Are you there?")
val someVoiceRecording = VoiceRecording("Tom", "voicerecording.org/id/123")

println(showNotification(someSms))
println(showNotification(someVoiceRecording))

```

###### output

```
You got an SMS from 12345! Message: Are you there?
you received a Voice Recording from Tom! Click the link to hear it: voicerecording.o
rg/id/123
```

아래의 예제는 if 구문을 사용한 예제로, if 구문의 조건에 만족되지 않으면 pattern match 구분에서 false를 반환하도록 되어있다.

```
def showNotificationSpecial(notification: Notification, specialEmail: String, specialNumber: String): String = {
  notification match {
    case Email(email, _, _) if email == specialEmail =>
      "You got an email from special someone!"
    case SMS(number, _) if number == specialNumber =>
      "You got an SMS from special someone!"
    case other =>
      showNotification(other) // nothing special, delegate to our original showNotification function   
  }
}
val SPECIAL_NUMBER = "55555"
val SPECIAL_EMAIL = "jane@mail.com"
val someSms = SMS("12345", "Are you there?")
val someVoiceRecording = VoiceRecording("Tom", "voicerecording.org/id/123")
val specialEmail = Email("jane@mail.com", "Drinks tonight?", "I'm free after 5!")
val specialSms = SMS("55555", "I'm here! Where are you?")
println(showNotificationSpecial(someSms, SPECIAL_EMAIL, SPECIAL_NUMBER))
println(showNotificationSpecial(someVoiceRecording, SPECIAL_EMAIL, SPECIAL_NUMBER))
println(showNotificationSpecial(specialEmail, SPECIAL_EMAIL, SPECIAL_NUMBER))
println(showNotificationSpecial(specialSms, SPECIAL_EMAIL, SPECIAL_NUMBER))
```

###### output

```
You got an SMS from 12345! Message: Are you there?
you received a Voice Recording from Tom! Click the link to hear it: voicerecording.org/id/123
You got an email from special someone!
You got an SMS from special someone!
```

Scalaf로 프로그래밍을 할때, 사용할 데이터를 정의할 때, case class를 적극적으로 사용하는 것을 권장한다. 그 이유는 보다 표현적이고 유지 가능한 코드를 작성할 수 있기 때문이다.
- 불변성(Immutability)은 언제, 어디서 값이 변경되는지를 따라가거나 추적하지 않도록 해준다.
- 값으로 비교하는 것은 비교 대상이 원식값인 것과 똑같이 비교할 수 있도록 해준다. 인스턴스를 비교할 때 참조값으로 비교되는지 값으로 비교되는지를 안따져봐도 되는 것이다.
- Pattern matching은 분기처리를 단순화해줘서 버그를 줄일 수 있도록 해주고, 읽기 쉬운 코드를 만들어 준다.




## Appendix
### Decomposable
Decomposable은 복잡한 하나의 문제를 이해하기 쉬운 형태들로 쪼개는 것을 의미한다. 더 자세한 내용은 decomposable](https://en.wikipedia.org/wiki/Decomposition_(computer_science))를 참조하면 된다.
