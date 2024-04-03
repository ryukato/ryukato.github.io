---
slug: Scala Tutorial 번역 - Partially Applied Function
title: Scala Tutorial 번역 - Partially Applied Function
authors: ryukato
date: 2017-01-20 09:36:55
tags: [FP, Scala, partially-applied-function]
---

<!-- truncate -->

## Partially Applied Functions
직역을 하자면 부분 적용된 함수라고 할 수 있을 것이다. 정의한 함수를 호출할때, 보통 함수가 필요로 하는 인자들을 모두 넘겨주어야 함수를 정상적으로 호출할 수 있다. 이런 경우는 전체적으로 적용된 함수라고 할 수 있다. 그런데 스칼라에서는 일부 인자만을 주고 함수를 호출하게 되면, 나머지 인자를 받을 수 있는 함수를 반환해 줄 수 있다. 이것을 바로 Partially Applied Function이라고 한다. 그리고 그 반환된 함수에 나머지 인자를 주게 되면 함수의 본체(body)가 실행하게 된다. 아래의 예제들을 하나씩 살펴보면 좀 더 이해할 수 있을 것이다.

### Fully Applied Function
```
import java.util.Date

object Test {
	def main(args: Array[String]): Unit = {
		val date = new Date
		log(date, "message1")
		log(date, "message2")
		log(date, "message3")
	}

	def log(date: Date, message: String): Unit= {
		println(date + "---" + message)
	}
}
```
###### output

```
Fri Jan 20 21:18:40 KST 2017---message1
Fri Jan 20 21:18:40 KST 2017---message2
Fri Jan 20 21:18:40 KST 2017---message3
```

위의 예제에 선언된 **log**함수는 두개의 인자를 받도록 정의되어 있다. 그리고 log함수를 호출할때 마다 두개의 인자를 모두 주어 호출하고 있다. 그렇지만 date는 변하지 않고, message만 바꿔 호출하고 있는 것을 볼 수 있는데, message만 주어 호출 할 수 있도록 할 수 있다. 아래의 예제를 살펴보자.

```
import java.util.Date

object Test {
	def main(args: Array[String]): Unit = {
		val logWithDateBound = log(new Date, _: String)
		println("logWithDateBound is " + logWithDateBound)
		logWithDateBound("message1")
		logWithDateBound("message2")
		logWithDateBound("message3")
	}

	def log(date: Date, message: String): Unit= {
		println(date + "---" + message)
	}
}
```
###### output
```
logWithDateBound is <function1>
Fri Jan 20 21:32:07 KST 2017---message1
Fri Jan 20 21:32:07 KST 2017---message2
Fri Jan 20 21:32:07 KST 2017---message3
```
위의 예제에서 보듯이 **logWithDateBound**는 partially applied function이 된다. 따라서 **logWithDateBound**는 이미 date를 가지고 있기때문에 호출할때 message만 주어 호출하게 되면 이전의 예제와 동일한 결과를 얻을 수 있다.
