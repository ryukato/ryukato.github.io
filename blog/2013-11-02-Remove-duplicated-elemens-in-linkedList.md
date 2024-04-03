---
slug: Remove duplicated elements of linked-list
title: Remove duplicated elements of linked-list
authors: ryukato
date: 2013-11-02 09:36:55
tags: [Java, LinkedList, Java-puzzle]
---

# LinkedList의 중복된 요소 제거
우연히 메일을 확인하다가 발견한 내용인데. 문제가 재미있어 보여서 함 풀어봤습니다.
문제의 내용은 아래와 같습니다. 출처는 [http://java.dzone.com/articles/thursday-code-puzzler-remove#comment-106477](http://java.dzone.com/articles/thursday-code-puzzler-remove#comment-106477)

```
Remove Duplicates from a Linked List
Given an unsorted linked list, and without using a temporary buffer, write a method that will delete any duplicates from the linked list.
```

해석하자면 정렬되지 않은  LinkedList내의 중복된 요소를 제거하되, 임시 버퍼 역활을 하는 변수나 객체를 사용하지 않고 제거하라는 내용입니다.
여기서 임시 버퍼 역활을 저는 LinkedList와 같은 구조체 객체로 생각해서 코드를 짜보았습니다.

## Version-1

```
private static void removeDuplicate(LinkedList<String> linkedList){

	long startTime = System.nanoTime();

	ListIterator<String> it = linkedList.listIterator();

	while(it.hasNext()){

		int firstIndex = linkedList.indexOf(it.next());

		int lastIndex = linkedList.lastIndexOf(linkedList.get(firstIndex));

		if(firstIndex != lastIndex){

			it.remove();
		}
	}

	long endTime = System.nanoTime();
	System.out.println((endTime - startTime));
}
```

이 방법으로 하면 중복을 제거 할 수 있겠죠. 위의 방법은 LinkedList뿐만 아니라 **indexOf**, **lastIndexOf** 메서드를 가지는 모든 **List의** 구현체에도 적용할 수 있습니다.

즉 `private static void removeDuplicate(List<String> linkedList)` 이렇게 메서드를 선언하고 매개변수로 LinkedList를 주어도 잘 작동한다는 것이죠.
그런데 문제의 내용을 보면 **LinkedList**라고 적혀있내요. 왜 일까요? 뭔가 **LinkedList**만의 특징적인 것이 있기 때문이 아닐까라는 생각이 듭니다.

List의 구현체들을 보면
* AbstractList
* AbstractSequentialList
* ArrayList
* AttributeList
* CopyOnWriteArrayList
* LinkedList
* RoleList
* RoleUnresolvedList
* Stack
* Vector

이렇게 많이 있습니다. 그렇지만 **LinkedList만이 가지는 특징**이 있다는 것이죠.
뭘까요? 그건 바로 LinkedList만이 **Queue interface**를 구현하는 구현체라는 것입니다.
다른 List의 구현체는 Queue interface의 구현체가 아니라는 것이죠.

다시 말해서 **Queue**는 **FIFO(first in, first out)** 을 기본적으로 구현하는 구조체이죠. 그리고 **LinkedList**에는 이런 FIFO를 구현하기 위한 메서드들이 있습니다.
예를 들면 **offerFirst**, **addLast**, **pollLast**, **pop** 등의 메서드들이 그것이죠.
이런 메서드들은 List interface 에는 없는 메서드들입니다.

그럼 이런 메서드들을 사용하면 되지 않을까요? 그래서 만들어 봤습니다.

## Version-2

```
private static void removeDuplicate2(LinkedList<String> linkedList){
	long startTime = System.nanoTime();

	int loopCnt = linkedList.size();

	for(int i=0;i<loopCnt;i++){

		String em = linkedList.pop();
		if(linkedList.contains(em)) continue;
		linkedList.addLast(em);
	}

	long endTime = System.nanoTime();
	System.out.println((endTime - startTime));
}
```

version1 과 성능을 비교하면 version2가 당연히 좋습니다.
그 이유는 **LinkedList**의 특성때문인데, 다른 List의 구현체, ArrayList의 경우를 보면 **RandomAccess interface**를 구현하는 구현체입니다.
다시말하면 ArrayList의 경우 **각 요소의 index값**을 가지고 add, remove하는 것이 빠릅니다.

하지만 **LinkedList**는 다른 구조를 가집니다. RandomAccess를 구현하는 구현체가 아니라 각 요소가 **자신의 앞, 뒤 요소와 연결**이 되어 있는 구조를 가지는 구현체라는 것이죠.
그렇기 때문에 LinkedList 객체 사용시 get(index) 메서드를 사용시 ArrayList에서 get(index)를 사용할때와 비교하면 속도가 떨어지게 되는 것이죠. 이 내용은 [API](https://docs.oracle.com/javase/8/docs/api/java/util/LinkedList.html)를 보시거나 실제 ArrayList, LinkedList 소스를 보면 알 수 있습니다.

그래서 문제의 의도에 가까운 코드가 version2의 코드가 아닐까 생각해 봅니다.
혹시 더 나은 성능을 가진, 문제의 의도에 더 가까운 코드가 있다면 서로 공유하는 것도 좋을 것 같내요.
