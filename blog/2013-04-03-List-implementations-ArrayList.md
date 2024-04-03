---
slug: List implementations, ArrayList
title: List implementations, ArrayList
authors: ryukato
date: 2013-04-03 16:57:29
tags: [Java, JCF, List, ArrayList]
---

# List - ArrayList

원래 Set의 구현체들에 대해 하나씩 써보기로 했었는데, Set을 더 깊게 이해하기 위해선 Map등 알아야 할 내용이 넘 많은것 같아 그래도 간단한 List의 구현체들을 하나씩 살펴볼려고 합니다. 그래서 이번에는 가장 많이 쓰이는 List의 구현체인 ArrayList에 대해 샆펴보려고 합니다.

ArrayList는 List의 일반적인 구현체로 JCF중에 가장 많이 쓰이는 클래스로 생각됩니다.

## ArrayList의 특징
ArrayList의 특징으로는 **position**이라고하는 **index** 값을 가지고 특정 elements를 추가, 변경, 획득, 삭제등을 하게 됩니다. 이런 position을가지고 그 position에 해당하는 element에 접근하는 것을 **Random Access** 라고 합니다. 그리고 해당 element를 가지고 올때 position을 가지고 접근하기 때문에 항상 **일정한 접근 시간**을 가질 수 있습니다.
이것은 ArrayList가 내부적으로 Object 타입의 배열을 가지고 있으면서 해당 배열에 값을 쓰고 받아오고 지우고 하기 때문입니다. 그말은 **position은 바로 내부 배열의 index값인것이죠.**
하지만 element를 추가하고 삭제할 경우도 항상 일정한 시간이 걸릴까요? 추가, 삭제시에 내부배열에는 어떤일이 생길까요? 만약 새로운 요소를 추가할때 이미 내부배열이 가득차 있다면 어떻게 될까요? 삭제할 경우에는 내부배열에 어떤 일이 생길까요? 이런 질문에 답을 생각해 보시면 더 도움이 될 것으로 생각됩니다.
그리고 중요한 것을 빠드릴뻔 했는데, ArrayList와 List의 다른 구현체들은 **중복과 Null을 허용** 합니다. 즉, 중복된 요소와 Null을 해당 객체에 넣을 수 있습니다.

## Multi-Thread와 ArrayList
**ArrayList는 동기화를 지원하지 않습니다.** 그말은 개발자가 Multi-thread환경에서 ArrayList를 사용하고자 한다면 반드시 **synchronized** 키워드를 써서 동기화 처리를 해주어야 합니다. 반면 **Vector** 의 경우는 동기화를 지원합니다. 즉, 개발자가 동기화 처리를 따로 하지 않아도 동기화처리가 된다는 것이죠.
하지만 Multi-thread환경이 아닌곳에서 Vector를 쓰면 해당 프로그램에 성능이 저하될 우려가 있습니다.

프로그램이 다루는 데이터의 양에 따라서 차이가 있을 수 있겠지만 Single-thread환경에서는 굳이Vector를 쓰기보단 ArrayList를 쓰는 것이 더 좋습니다.
참고로 Multi-thread환경하에서 Vector를 쓰지 않고도 동기화 처리를 할 수 있는 방법은 아래의 메서드를 써서 List객체를 받아와 사용하면 됩니다.

```
Collections.synchronizedList(List<Object>)
```

## ArrayList 내부 살펴보기
### Member 객체(변수)
ArrayList는 elementData, size와 같은 멤버 변수를 가집니다. 각 멤버 변수에 대한 내용은 아래와 같습니다.
* elementData: Object 타입의 배열 변수로, 내부 배열 객체로  실제 추가될 요소를 저장하는 배열 객체입니다.타입이 Object인 이유는 모든 타입의 요소를 다루기 위합입니다.
* size: int 타입의 변수로, 생성된 ArrayList 인스턴스가 가지고 있는 요소의 갯수를 의미합니다. **elementData의 length와는 별개의 값입니다.**

### capacity와 size
ArrayList는 내부적으로 용량(capacity)와 현재 추가되어 있는 요소의 갯수(size)를 나타내는 변수를 가지고 있습니다. ArrayList는 내부 배열을 사용하여 요소를 저장하며, 별도의 작업을 하지 않아도 내부 배열의 크기를 자동으로 증가 시켜 줍니다. 내부 배열의 크기를 자동으로 증가 시키기 위해 필요한 값들이 용량(내부 배열의 크기)와 현재 추가되어 있는 요소의 갯수가 됩니다. ArrayList는 capacity값이 주어지지 않은 경우(기본 생성자를 통해 인스턴스를 만든 경우), 내부 배열의 크기를 기본값(10)으로 설정합니다.
하지만 유의할것은 elementData의 사이즈가 10이라고 해서 size변수의 값도 10이 되는 것은 아닙니다. 내부배열(elementData)의 사이즈를 미리 10으로 해놓고 요소를 해당 ArrayList 인스턴스에 추가할때 내부배열에 바로 넣기 위한것이죠. 예를 들면 이런거죠. 어느 한 호텔이 있습니다. 그리고 단체 손님(10명정도)를 미리 예약을 받아 방을 예약한 손님들에게 미리 할당을 해놓는 것이죠. 그 미리 예약된 방의 갯수가 ArrayList객체의 내부 배열의 length가 되는 것이고 손님들이 오기로 한 날짜가 되어 실제 손님들이 방에 들어가 그 방을 차지하게 되면 방을 차지한 손님의 명수가 ArrayList의 size가 되는 것입니다.
그리고 요소를 추가하기 전에 내부배열(elementData)의 사이즈를 항상 체크를 해서 내부배열이 사이즈를 증가 시켜줍니다. 아래의 소스를 보시면 이해가 될것입니다. 아래의 add 메서드에서 ensureCapacity 메서드를 호출하는데 이부분이 내부배열의 사이즈를 체크하는 부분입니다. 현재 사이즈 +1해서 체크를 하내요. 현재 사이즈 +1은 minimum capacity 입니다. 즉, 최소한 내부 배열 사이즈를 minimum capacity만큼 유지를 해야한다는 것입니다.
아래의 add 메서드를 보면 ensureCapacity에 minimum capacity를 현재 size + 1로 주게 됩니다. ensureCapacity는 말 그대로 내부 배열의 capacity(용량)을 ensure(보장)하겠다는 것으로 내부배열의 현재 length를 체크하여 필요에 따라 일정 크기만큼 증가 시켜주는 역활을 합니다. add 메서드 코드 아래의 코드가 바로 ensureCapacity 메서드의 내용입니다. 정확히 현재 내부배열의 length*3/2 +1 만큼 증가를 시켜 줍니다.

###### add, ensureCapacity methods

```
public boolean add(E e) {
  ensureCapacity(size + 1);   
  elementData[size++] = e;
  return true;
}

public void ensureCapacity(int minCapacity) {
	modCount++;
	int oldCapacity = elementData.length;
	if (minCapacity > oldCapacity) {
		Object oldData[] = elementData;
    int newCapacity = (oldCapacity * 3)/2 + 1;
    if (newCapacity < minCapacity)
		  newCapacity = minCapacity;
    elementData = Arrays.copyOf(elementData, newCapacity);
	}// end of if for  (minCapacity > oldCapacity)  compare
 } // end of ensureCapacity method
```

간단하게 예를 들어보면 아래와 같겠죠.

###### ensureCapacity example
```
current size = 10
oldCapacity = 10 (기본 10)
newCapacity = 10*3/2 +1 >> 16
minCapacity = 11 (size:10+1)
```

```
if newCapacity < minCapacity  : (16<11)  >> false

newCapacity win >> increase length of internal array to 16
```

ArrayList에 요소를 추가할때마다 ensureCapacity가 실행이 됩니다. 그럼 이렇게 매번 ensureCapacity를 실행하게 되고 minCapacity가 내부배열의 사이즈보다 크게 될 경우 - 내부배열에 빈방이 없을 경우에 ensureCapacity에서 내부배열의 크기를 증가시키는 것이 성능에 영향을 미치게 되는거죠.
그래서 예상가능한 데이터 건수를 initial capacity로 주어서 내부배열에 방을 미리 확보에 둔다면 성능이 어느정도 향상이 되지 않을까 생각해 봅니다.

### 생성자
#### 기본생성자
ArrayList의 기본 생성자는 아무런 인자를 받지 않는 말 그대로 기본 생성자의 형태로 정의 되어 있습니다. 기본 생성자를 통해 ArrayList의 인스턴스를 생성하면 위에서 설명한 것처럼 기본 용량은 10이 됩니다.

#### ArrayList(int initialCapacity)
이 생성자는 initialCapacity라는 인자값을 받는데 이 initialCapacity가 내부배열의 초기 사이즈가 됩니다. 데이터를 가져오거나 할때 데이터의 건수를 잘 예측하여 initialCapacity로 주게 되면 내부배열의 사이즈를 체크하고 증가시키는 비용을 줄이고 성능도 어느정도 향상되지 않을까 생각합니다.
너무나도 당연한 이야기겠지만 initialCapacity는 항상 양의 정수값이어야합니다. 그렇지 않으면 IllegalArgumentException이 발생합니다.

#### `ArrayList(Collection<? extends E> c)`
ArrayList 인스턴스를 생성한후 인자로 넘어온 Collection 객체가 가지고있는 요소들을 생성한 ArrayList 인스턴스에 복사해서 넣습니다. 이때 생각해볼 것은 reference만 가지고 오는지, 인자로 넘어온 Collection객체가 가지고 있는 요소의 복사본(Deep cloned)을 가지고 가는지를 생각해봐야 할것입니다. 왜냐면 참조값(reference)만 가지고 온다면 원본(Collection객체의 요소)의 속성값이나 상태값이 바뀌게 되면 생성한 ArrayList인스턴스에 들어가있는 동일한 요소의 속성 혹은 상태값도 변경이 되기때문입니다.
제가 확인한 바로는 reference만 가져가는 Shallow copy가 됩니다. 그러니 위의 사항을 유의하셔야 할것으로 생각되내요. 즉, 원본이 되는 Collection 객체가 가지고 있는 요소 객체의 속성값이 바뀌게 되면 해당 ArrayList객체에 속한 동일한 객체의 속성도 바뀌게 된다는 것이죠.

참고로 Colleciton 타입의 인자 객체가 가지고 있는 요소들을 생성한 ArrayList 인스턴스에 넣을 수 있는 것은 ArrayList가 구현한 List interface가 Collection inteface를 상속받기 때문에 ArrayList의 super type은 바로  Collection이 되는것이죠. 그리고 Collection interface에 선언되어있는 모든 메서드들을 ArrayList가 구현하기때문에 인자로 Collection interface의 하위에 있는 모든 interface혹은 구현체들을 인자로 받아들일 수 있습니다.

## 요소 추가/삭제하기
### add method로 추가하기
ArrayList객체에 요소를 추가하는 방법은 add  계열 메서드를 통하여 추가하는 방법과 다른 Collection 객체를 생성하고 ArrayList 객체를 생성할때 인자값으로 넘겨주는 방법이 있습니다.

먼저 add  계열 메서드를 통하여 요소를 추가하는 방법을 보도록 하죠.
일단 ArrayList 객체 생성 후 add 메서드를 호출하여 요소를 추가할 경우에 생각해 볼 것은 primitive type 변수를 추가하는 경우와 객체 타입의 요소를 추가하는 경우를 생각해 보아야합니다.
그 이유는 위에서 잠깐 살펴본  ArrayList의 add 메서드를 보시면 알 수 있습니다.
add 메서드는 객체 타입을 인자로 받습니다.
그럼 primitive type(short, int, double, float....)변수를 인자로 받는 경우 어떻게 해서 추가가 되는 것일까요? 바로 auto-boxing이 내부적으로 일어나기 때문입니다.
즉, primitive type에 해당 하는 wrapper 객체 타입으로 변환이 되어 추가가 되는 것입니다.
int는 Integer로, long은 Long으로 이런식으로 auto-boxing이 되어 ArrayList객체에 추가가 되는 것이죠. (* wrapper class에 대한 자세한 사항은 http://en.wikipedia.org/wiki/Primitive_wrapper_class 를 참조해주세요.)

#### 기본 add 메서드

```
List<String> alist = new ArrayList<String>();
alist.add("1");  
/*
size:0  (* 내부 배열에 요소가 추가되기 전이기때문에 size는 0)
minCapacity = 1 (0+1)
oldCapacity: 10 (기본값: 10)
내부 배열 크기 증가는 발생하지 않음
*/
```

#### add(int index, E) 메서드
 add(int index, E) 메서드는 주어진 index(position)에 해당 요소를 밀어넣겟다는 의미의 메서드입니다. 즉, 이미 해당 index(position)에 요소가 존재한다면 그 요소는 뒤로 한칸 밀리게 되는 것이죠.

#### addAll 메서드
인자로 주어진 Collection 객체의 모든 요소를 대상 ArrayList로 모두 추가하기 위한 메서드 입니다.

```
Collection<String> c = new ArrayList<String>();
c.add("3");
c.add("4");
c.add("5");
alist.addAll(alist.size(),c);   // addAll의 경우 이전 add 메서드의 예에서 "1"을 추가하여 현재 position이 0이므로 position: 1부터 추가하게 됩니다.
```

### remove method로 삭제하기
remove 메서드는 remove(int index), remove(Object o)가 있습니다. 둘의 차이가 뭘까요? remove(int index) 메서드를 호출하면 add 메서드때와 마찮가지로 auto-boxing이 일어날까요? 그렇지 않습니다. remove(int index) 메서드는 주어진  index(position)에 해당하는 요소를 지우겠다는 것입니다. 내부적으로 소스를 보면 *System.arraycopy* 를 통해서 해당 요소를 지우게 되는 것입니다.

그럼 remove(Object o)는 어떨까요? 내부적으로 현재의 size만큼 for loop를 돌면서 equals 메서드를 통해 주어진 객체와 동일한 놈을 찾아 지우게 됩니다. (성능상 안좋겠죠). 그래서 add 때와는 달리 remove일 경우에는 auto-boxing이 일어나지 않습니다. 그렇지만 remove는 지운 요소를 반환을 시켜주는데 이때 반환되는 타입은 Object 입니다. 그럼 아래의 코드와 같은 경우는 **un-boxing** ( wrapper >> primitive type으로 변환)이 일어나게 됩니다.
```
int i = remove(new Integer(1));
```

## ArrayList 복사 및 다른 Collection 객체를 ArrayList로 복사
ArrayList 객체를 복사하는 방법은 아래와 같이 여러가지가 있습니다. 그리고 각 대부분의 복사 방법은 Shallow copy(ArrayList 객체안에 들어있는 요소의 reference만을 복사하는 형태) 입니다.

### ArrayList의 clone 메서드를 사용하여 복사 (shallo copy)
아래의 코드 처럼 ArrayList 객체를 하나 만들고 하나의 ArrayListTestDummy 객체를 생성하여 추가를 합니다. 그리고 clone 메서드를 통해 a1(원본객체)을 복사하는 것이죠.

이 경우 위에서 말한 것 처럼 reference만 가져가는 shallow copy가 되는 것입니다.
제 생각에는 배열도 마찮가지로 shallow copy로 clone 복사가 이루어질 것으로 생각됩니다.
그 이유는 ArrayList는 내부적으로 배열을 가지고 있다고 했습니다. 그 내부 배열에는 특정 객체가 들어가 있겠죠. 그런데 ArrayList의 clone 메서드는 내부 배열안의 요소까지 복사본을 뜨는 것이 아니라 ArrayList 객체 자체만을 복사하기 때문인거죠.

말로만 하니까 설명하기도 이해하기도 힘들것 같아 허접한 그림하나 그렸습니다.
아래의 그림을 보시면   ArrayList 객체 a1이 있고 a1은 내부 배열에 대한 멤버변수(reference 변수)를 가지고 있죠. 그리고 내부 배열은 자신이 포함하고 있는 객체들의 reference를 가지고 있는 것이죠.
그럼 ArrayList의 clone 메서드를 호출한다는 것은 빨간색의 각 요소 객체들까지 모두 복사하는 것이 아니라 ArrayList 객체 자신과 내부 배열만 복사해 가는 것입니다.
그렇게 되면 내부 배열은 요소 객체에 대한 reference만들 가지고 있으니 복사본에도 요소 객체에 대한 reference만을 가져가는 것이죠. (이런 shallow copy는 실제 map, set에서도 동일합니다.)
그래서 그림에서 처럼 복사본인 clonedAlist는 동일한 요소 객체들을 지칭하는 reference를 가지게 됩니다. (* 그림에 소질이 없어서 나름 열심히 그렸습니다. ^^;)

```
ArrayListTestDummy a1 = new ArrayListTestDummy("1");
List<ArrayListTestDummy> alist = new ArrayList<ArrayListTestDummy>();
for (int i = 0; i < 1; i++) {
  alist.add(new ArrayListTestDummy(String.valueOf(i)));
}
//test clone of arraylist >> shallow copy
List<ArrayListTestDummy> clonedAlist = (List<ArrayListTestDummy>) ((ArrayList)alist).clone();
printCompareResult(alist, clonedAlist,"Shallow copy clone");
```

![](/assets/java/collection/arraylist_shallow_cp.png)

### 기타 ArrayList의 요소들을 복사하는 방법
그리고 아래의 코드들은 다양한 방법으로 ArrayList의 요소들을 복사하는 방법입니다. 뭐 이런 방법도 있구나하고 한번 살펴보면 될거같내요.

###### 기타 ArrayList의 요소들을 복사하는 방법 example
```
//test copy list into another list   >> shallow copu
List<ArrayListTestDummy> clist = new ArrayList<ArrayListTestDummy>(alist);
//printCompareResult(alist, clist);

List<ArrayListTestDummy> clist2 = new ArrayList<ArrayListTestDummy>(alist.size());
clist2.add(null);
Collections.copy(clist2, alist);		
//printCompareResult(alist, clist2);

alist.get(0).setName("222");
List<ArrayListTestDummy> clonedList = deepCopyList(alist);
printCompareResult(alist, clonedList,"Deep copy clone");

System.out.println("------------------System.arrcopyTest---------------------");
ArrayListTestDummy[] arrDummy = new ArrayListTestDummy[alist.size()];
System.arraycopy(alist.toArray(),0,arrDummy,0,alist.size());
List<ArrayListTestDummy> arrCopiedList = Arrays.asList(arrDummy);
alist.get(0).setName("new Name");
System.out.println(arrCopiedList);

```
### Deep copy로 ArrayList의 요소들을 복사하는 방법
Shallow copy를 하는 위의 방법과는 다른 Deep copy의 코드는 아래와 같습니다. Deep copy 시에 유의 할 사항은 ArrayList 안에 들어갈 요소 객체가 clone메서드를 override하고 있어야 한다는 것입니다.
그렇지 않으면 제대로 clone이 되지 않겠죠.

###### deep copy example
```
private static  List<ArrayListTestDummy> deepCopyList(List<ArrayListTestDummy> l1){
  Iterator<ArrayListTestDummy> it = l1.iterator();
  List<ArrayListTestDummy> clonedList = new ArrayList<ArrayListTestDummy>(l1.size());
  while(it.hasNext()){
    try {
            ArrayListTestDummy originalEm = it.next();
            ArrayListTestDummy clonedEm = (ArrayListTestDummy)originalEm.clone();
            clonedList.add(clonedEm);
    } catch (CloneNotSupportedException e) {
            e.printStackTrace();
    }
  }
  /*
  //enhanced for loop
  try{
      for(ArrayListTestDummy original:l1){
          ArrayListTestDummy clonedEm = (ArrayListTestDummy)original.clone();
          clonedList.add(clonedEm);
      }
  }catch (CloneNotSupportedException e) {
    e.printStackTrace();
  }
  */
  return clonedList;
}
```

## ArrayList와 LinkedList 비교
둘을 비교하기 전에 LinkedList에 대해 잘 모르시면 아래의 문서를 보시면 될 것 같내요.
(\*LinkedList data structur reference - http://en.wikipedia.org/wiki/Linked_list)

JCF에서 제공해주는 LinkedList는 doubly linked list라고 생각하시면 됩니다.
LinkedList는 ArrayList와는 달리 요소를 추가하고 삭제하는데 항상 일정한 시간이 걸립니다. 그 이유는 LinkedList에 들어있는 요소들은 서로 연결이 되어있고 LinkedList 객체 내부적으로 addBefore라는 메서드를 통해 index(position)을 따져서 추가하는 ArrayList의 add 메서드와는 달리 쉽게 해당 요소를 추가하고 해당 요소와 해당 요소의 이전, 다음 요소를 연결만 시켜주면 됩니다. 아래의 코드가 LinkedList의 addBefore와 add 메서드의 코드입니다.

###### LinkedList의 addBefore와 add 메서드
```
private Entry<E> addBefore(E e, Entry<E> entry) {
    Entry<E> newEntry = new Entry<E>(e, entry, entry.previous);
    newEntry.previous.next = newEntry;
    newEntry.next.previous = newEntry;
    size++;
    modCount++;
    return newEntry;
}

public boolean add(E e) {
    addBefore(e, header);
    return true;
}
```

그런데 LinkedList에서도 position(index)를 가지고 get 합니다. 하지만 이렇게 get메서드를 통해 LinkedList의 요소를 받아오는 것은 ArrayList에 비해 성능이 좋지 않습니다.

추가/삭제가 많이 일어나지만 iteration이나 get 메서드를 통해 요소를 받아오는 경우가 드물때, 혹은 첫번째/마지막 요소만 가져올 경우에 한하여 ArrayList보다는 LinkedList를 쓰는 것이 효율적이라고 합니다.
Queue같은 구조체가 필요할 경우 LinkedList를 쓰면 좋을 것 같습니다. 그리고 실제로 LinkedList는 Queue interface를 구현하고 있습니다.

## 기타
튜토리얼에서는 **CopyOnWriteArrayList**라는 놈을 소개해 주고 있습니다. CopyOnWriteArrayList는 동기화가 필요없고(* iteration중에도 말이죠, 그리고 iteration중에도 ConcurrentModificationException을 던지지 않는다고 합니다.). 이 구조체는 event-handler에 적합하다고 말하고 있내요. 더 자세히 할고 싶으시분들은 직접 튜토리얼을 보셔도 되고 API를 찾아보시면 될것같내요.

그럼 생각보다 글이 길어져서 막판에는 조금 서둘러 쓴 느낌이내요. (실제로도 좀 빨리 쓰고 정리하고픈 맘에 후다닥 ^^;;). 아무튼 조금이라도 도움이 되었으면 합니다.
혹시라도 틀린부분이 있거나 하면 지적해 주시면 고맙겠습니다.

(ps. 아 글을 쓰면서 테스트용 코드들 (ArrayList와 LinkedList의 단순 성능 비교 코드 포함)을 압축하여 첨부하니 꼭 살펴보셨으면 합니다. [sample_code.zip](/assets/java/collection/arrylist.zip))
