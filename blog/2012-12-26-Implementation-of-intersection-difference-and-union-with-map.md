---
slug: Implementation of intersection, difference and union with HashMap
title: Implementation of intersection, difference and union with HashMap
authors: ryukato
date: 2012-12-26 09:36:55
tags: [Java, Map]
---


# HashMap으로 교집합, 차집합, 합집합 구현하기
네이버 자바 관련 카페의 QnA 게시판을 보다가 재미 있는 질문이 있어서 함 구현해봤습니다.
원래 질문은 "HashMap으로 차집합을 어떻게 구현 할 수 있나요?" 였는데,
여기에 추가적으로 교집합, 차집합 그리고 중요한 합집합을 구현해 봤습니다.

## 구현하기
교집합, 차집합을 구할때는 굳이 Iterator를 써서 key,value를 받아오지 않아도 됩니다.
왜냐면 HashMap의 entrySet을 이용하면되기때문이죠.
여기서 잠깐, EntrySet을 살펴볼까요? HashMap 구현 소스를 보시면 아래의 코드를 보실 수 있습니다.

```
private transient Set<Map.Entry<K,V>> entrySet = null;
```

즉, entrySet은 Set 객체인거죠.
그러므로 Set interface에 있는  ```removeAll(Collection<?> c), retainAll(Collection<?> c)``` 메서드를 쓰면
간단히 교집합, 차집합은 구할 수 있습니다.
대충 아는걸로 해서 iterator를 써라, 이런 답변을 보신다면 HashMap 소스를 안들여다 본 사람이구나 하시면 됩니다.

#### 전체 소스 코드
아래는 전체 소스 코드입니다.

```
import java.util.HashMap;

import java.util.Iterator;

import java.util.Map;



public class RetainMap {

	//테스트 HashMap객체 생성 및 데이터 입력

	Map<String,String> map1 = new HashMap<String,String>();
  Map<String,String> map2 = new HashMap<String,String>();

	map1.put("1","1");
	map1.put("2","2");
	map1.put("3","3");

	map1.put("4","4");
	map2.put("3","3");
	map2.put("4","4");
	map2.put("5","5");

	//아래 예제는 원본(map1)을 그래도 유지하고 각각 copy본을 사용하였음

	//교집합 - map1,map2에 공통으로 들어가 있는 entrySet을 구하면 됨

	Map<String,String> copiedMap1 = new HashMap<String,String>(map1);
	copiedMap1.entrySet().retainAll(map2.entrySet());
	System.out.println(copiedMap1); // >> {3=3, 4=4} 출력

	//차집합 - map1에만 존재하는 entrySet을 구하면 됨
	Map<String,String> copiedMap2 = new HashMap<String,String>(map1);
	copiedMap2.entrySet().removeAll(map2.entrySet());
	System.out.println(copiedMap2); //>> {2=2, 1=1} 출력

	//합집합 - map3에 있는 entrySet을 map1으로 합치면됨 Set의 addAll은 쓸 수 없음
	Map<String,String> copiedMap3 = new HashMap<String,String>(map1);
	Iterator<String> keys = map2.keySet().iterator();
	while(keys.hasNext()){
		String key = keys.next();
		String value = map2.get(key);
	  if((!copiedMap3.containsKey(key))&&(!copiedMap3.containsValue(value))){
    copiedMap3.put(key, value);
		}
  }// end of while
	System.out.println(copiedMap3); //>> {3=3, 2=2, 1=1, 5=5, 4=4} 출력
}
```

그런데 합집합을 구하는 코드에서 왜 addAll 메서드를 쓸 수 없다고 해놓았을까요?
그 이유를 찾기위해서는 EntrySet의 부모class들을 살펴봐야합니다.
EntrySet > AbstractSet > AbstractCollection의 구조를 갖습니다.
그리고 EntrySet class의 메서드는 아래 메서드가 다입니다. addAll이 없죠.

* contains
* remove
* size
* clear
* iterator

그럼 AbstractSet을 볼까요?  역시 addAll은 없내요.

* removeAll
* equals
* hashCode

마지막으로 AbstractCollection을 보면 addAll이 마침내, 빙고! 있습니다.

근데 메서드 설명을 보니 뭔가 있내요.
뭘까요? add메서드를 override하지 않으면 UnsupportedOperationException을 던지겠다고 하내요.
그러면서 addAll 메서드 내부적으로는 add 메서드를 호출합니다.
이런이런. 그리고 add 메서드는 아래와 같이 구현해 놓았내요.

```
public boolean add(E e) {
	throw new UnsupportedOperationException();
}
```

뭐하자는 플레이일까요? ^^;;; 그 이유는 AbstractCollection의 설명에 자세히 나와있습니다.
unmodifiable collection을 구현할려면 AbstractCollection의 대부분의 메서드를 가져다 쓰고, iterator, size메서드만 구현해서 써라라고 말하고 있고, modifiable collection을 구현할려면 반드시 add메서드를 구현해라라고 말하고 있습니다.

즉, AbstractCollection는 Collection interface의 핵심 뼈대면 구현해놓고 나머지는 개발자가 용도에 맞게 구현해라라는 의도를 가진 class라는 것이죠.  그래서 저렇게 해놓은 것이라 생각이 듭니다.

짧게 쓰고 일찍 잘려고 했는데.. 조금 길어졌내요.  아무튼 API  그리고 시간날때마다, 궁금한것이 생길때마다, JDK 소스도 꼼꼼히 보시면 도움이 많이 될거라는 생각이 드내요.  아는 만큼 다른 사람에게도 도움을 줄 수 있겠죠. 모른다면 찾아보면 됩니다.
