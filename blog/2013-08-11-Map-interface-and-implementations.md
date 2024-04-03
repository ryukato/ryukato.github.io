---
slug: Map interface and its implementations
title: Map interface and its implementations
authors: ryukato
date: 2013-08-11 16:57:29
tags: [Java, JCF, Map]
---

<!-- truncate -->

# Map interface 와 Map의 기본 구현체들
Map은 실제로 많이 사용되는 객체이지요. 이번에는 Map에 대해 써 볼까 합니다. Set을 자세히 알기 위해서도 먼저 Map을 알아두는 것이 좋다고 생각이됩니다. 왜냐면 Set의 구현체들 HashSet, TreeSet등등은 내부적으로 Map의 구현체들을 각각 사용하여 요소들을 저장 및 추출하고, 정렬하기때문입니다.

## Map의 특성
### Key, Value의 Entry 구조
Map의 요소는 key, value형태의 구조를 가지며, Entry라는 타입으로 Map에 저장됩니다. 고유한 key와 1:1로 매핑되는 value를 가지는 것이죠.

### Elements and auto-boxing
key, value 모두 primitive, Object 타입을 받을 수 있는 것 처럼 보이지만 실제론 그렇지 않습니다. primitive type의 변수를 key 혹은 value로 입력할 경우 내부적으로 입력한 primitive type과 매핑되는 Wrapper Object 타입으로 auto-boxing이 이루어 집니다. 그 이유는 Map의 put, get, containsKey, containsValue등의 메서드를 보면 알 수 있지 않나 생각됩니다. 각각의 메서드는 인자로 Object 타입을 받습니다.  
아래의 예제를 보면 알 수 있습니다. key, value로 int 형의 1,2를 각각 입력했습니다.
하지만 get 메서드에 의해 반환된 value의 타입을 보면 int의 Wrapper인 Integer입니다. 즉, 내부적으로 auto-boxing이 일어난겁니다.
별거 아닌거 같지만 auto-boxing, un-boxing은 속도에 영향을 미칩니다. 되도록이면 key, value입력시에 primitive type은 해당 Wrapper로 변환하여 입력하는 것이 좋을 것으로 생각됩니다.

###### auto-boxing sample code

```
public class MapAutoboxingTestDrive{
	Map<Integer, Integer> autoboxingMap = new HashMap<Integer,Integer>();
	autoboxingMap.put(1, 1);
	autoboxingMap.put(2, 2);

	if(autoboxingMap.containsKey(1)){
		System.out.println("autoboxing occur for 1");
		System.out.println("return type of value returned by get" + autoboxingMap.get(1).getClass().getName());
	}
}
```

###### auto-boxing sample output

```
autoboxing occur for 1
return type of value returned by getjava.lang.Integer
```

### 중복된 Key
Map 객체는 중복된(동일한 hashCode를 가지는) key를 허용하지 않습니다. key로 사용될 객체의 hashCode값을 비교하여 해당 키가 있으면 value를 새로이 넣어 값을 갱신시켜버리고 이전 value객체는 반환을 해줍니다.
자세한 것은  HashMap 부분에서 다루도록 하겠습니다.

### 내부 Collection View
Map객체는 내부적으로 키값들의 집합, 값들의 집합 그리고 요소들의 집합, 이렇게 세개의 Collection view들을 가지고 있습니다.

#### 키 집합
keySet method를 통해 반환됩니다.

#### 값들의 집합 (Collection of values)
values  method에 의해 반환되며 Collection이라는 포괄적인 용어를 쓴것은 이건 각 구현체마다 각기 AbstractCollection을 상속받은 구현체인 Values라는 내부 클래스를 가지고 있기때문입니다. AbstractCollection을 상속받았으니 AbstractCollection가 가지고 있는 메서드는 모두 사용할 수 있겠죠. AbstractCollection은 Collection interface를 구현하는 구현체기때문에 Values는 Collection interface에 선언되어있는 메서드는 모두 사용할 수 있는 Collection 구현체 객체입니다. 그래서 Collection of values라는 말을 사용할 수 있는 것이죠

#### 요소들의 집합 (set of key-value mappings, set of entry)
Entry는 Map 객체의 내부 객체이고 Entry 타입의 table이라는 배열 참조 변수에 각각의 key-value mapping인 entry가 저장이 됩니다. 따라서 set of entries(set of key-value mappings)는 table에 저장되어 있는 모든 Entry 객체들을 Set형태로 반환해주게 됩니다. 바로 entrySet method를 사용해서 말입니다.

## 구현체 클래스와 생성자.
Map interface를 구현한 모든 구현체에는 기본 생성자(인자를 받지 않는)와 Map 객체를 인자로 받는 생성자를 가집니다. Map 객체를 인자로 받는 생성자는, 넘겨받은 해당 Map객체안에 들어있는 모든 Entry 객체들을 복사해서 가지고 있게 됩니다. 그런데 여기서 복사라는 것은 deep copy가 됩니다. 즉,  Entry가 가지고 있는 key, value 값을 복사에서 새로운 Entry객체를 생성 후 저장하게 됩니다.

### 다른 Map객체로부터 Map 생성과 deep copy
아래의 예제를 보면 originalMap을 인자로 받는 새로운copiedMap을 생성한 후 originalMap 의 첫번째 Entry의 value를 바꿉니다.

만약 shallow copy가 되서 동일한 reference를 가지는 Entry를 copiedMap 이 가지고 있다면 originalMap의 변화가 copiedMap에도 영향이 가겠지만 결과는 그렇지 않습니다.

###### sample code
```
import java.util.HashMap;

import java.util.Map;

public class DeepCopyMapTestDrive {

	public static void main(String[] args) {
		Map<String,String> originalMap = new HashMap<String, String>();
		originalMap.put("1", "1");
		originalMap.put("2", "2");
		originalMap.put("3", "3");


		Map<String,String> copiedMap = new HashMap<String, String>(originalMap);
		System.out.println("original is equal to copy > "+ (originalMap.equals(copiedMap)));

		//change original map
		System.out.println("Change original map");

		originalMap.put("1", "new");

		System.out.println(originalMap.toString());
		System.out.println(copiedMap.toString());  // the change is not affected to copy
	}
}
```

###### sample code output

```
original is equal to copy > true
Change original map
original Map's entries {3=3, 2=2, 1=new}
copied Map's entries {3=3, 2=2, 1=1}
```

## Map interface API
Map interface의 메서드는 아래의 api 혹은 최신 자바버전의 api를 보시면 됩니다.
http://docs.oracle.com/javase/6/docs/api/

## 구현체들(Implementations)
Map interface의 구현체는 크게 general-purpose implementation과 special purpose implementation으로 나뉩니다. general은 말 그대로 일반적으로 사용되는 Map의 구현체이고 special들은 뭔가 특별한 것이 있겠죠?

일단 general-purpose implementation들을 살펴보겠습니다. 살펴보기에 앞서 한가지 예기할 것은 Map은 key, value 형태의 Entry를 가진다고 했습니다. 그런데 Map의 구현체들은 내부 배열(bucket, 위에서 말한 Entry[] table)의  index가 아닌 key로 해당 value를 가져오는 구조 입니다. 이것에 어떻게 가능하냐면 key 객체의 hashCode값을 가지고 내부배열의 index 값을 계산하여 접근해서 해당 value를 가져오게 되는 것이죠. 따라서 위에서 한번 언급이 되었지만 key, value를 입력할 때 key가 이미 존재하는지 확인하고 있으면 새로운 value로 치환, 없으면 새로운 Entry객체를 생성해서 내부배열에 저장을 합니다.  이때 저장 순서는 각 구현체마다 조금씩 다른데 HashMap은 hash라는 메서드가 key객체의 hashCode를 가지고 내부배열의 index값을 정해주고 해당 index에 Entry가 저장이 됩니다. 그래서 순차 입력이 아닌 골고루 분배 입력이 되는 셈이죠.

### AbstractMap
HashMap, TreeMap, LinkedHashMap을 살펴보기 전에 AbstractMap이라는 추상 클래스에 대해 간력히 보겠습니다.

AbstractMap클래스는 Map interface의  빼대가 되는 메서드들을 구현해 놓은 추상 클래스입니다. 따라서 AbstractMap클래스를 상속받아 Map interface를 구현한다면 보다 쉽게 Map interface를 구현할 수 있겠죠.
하지만 AbstractMap클래스에는 entrySet메서드는 구현해 놓지 않았습니다.  그 이유는 각 구현체의 성격이 조금씩 다르기 때문에 각 구현체의 내부 클래스로 선언된 EntrySet의 구현도 조금씩 다르를 수 밖에 없지 않나 생각해 봅니다.

### HashMap
가장 많이 쓰이고 속도도 가장 빠른 Map의 구현체 이며 key, value 모두 null을 허용합니다.

하지만 key로 정렬된 iteration은 제공하지 않고 또 HashMap은 정렬을 아예 제공하지 않습니다. 즉, 입력한 순서와도 무관하게 iteration이 돌게 됩니다.

그 이유는 어느 정도 예측이 가능하지 않나요? HashMap에 entry를 저장할때, put할때 HashMap이 key 객체의 hashCode를 가지고 내부배열의 index값을 구한다고 했습니다. 그래서 골고루 분배가 되기 때문에 iteration이 순차적으로 나올 수 없는 이유가 되는 것이죠.

HashMap은 (TreeMap, LinkedHashMap)은 multi-threading을 기본 제공하지 않습니다. 따라서  Multi-thread 환경에서 HashMap을 사용할려면 동기화 처리를 꼭 해주셔야하겠죠.

### LinkedHashMap
LinkedHashMap은  HashMap에 가까운 성능을 가지고 저장된 순서로 iteration을 해주는 특성을 가지고 있습니다. 또한 removeEldestEntry라는 메서드가 있는데 이 메서드는 가장 오래된 객체를 삭제해주는 메서드 입니다. 따라서 LinkedHashMap을 확장(상속받아)해서 removeEldestEntry메서드를 오버라이드 하면 custom cache를 구현할 수 있을 것으로 보입니다.

### HapMap과 LinkedHashMap의 생성자와 인자값들
HashMap과 LinkedHashMap의 생성자들을 살펴보면 int initialCapacity, float loadFactor라는 인자를 받는 생성자가 있는걸 보실 수 있습니다. 두 인자는 뭐하는데 쓰이는 용도 일까요?  하나씩 살펴 보겠습니다.

#### initialCapacity
initialCapacity는 내부 배열(bucket 혹은 table)의 size입니다. 즉, 내부 배열의 초기 용량을 설정하는 값이죠. 그런데 이 값을 실제 입력될 요소의 갯수보다 많이 잡으면 bucket에 빈 공간이 생기게 되므로 메모리를 낭비하겠죠. 그래서 실제 입력될 요소의 갯수를 잘 파악하여 initialCapacity를 설정하면 성능에 좋을 것이라고 생각됩니다.

#### LoadFactor
load factor는 bucket이 얼마만큼 가득 찼느냐를 의미하는 수치 입니다. 예를 들어 bucket에 100개의 공간이 있는데 이중 75개의 요소가 들어가 있다면 load factor는 .75 입니다. load factor가 단순히 이 수치만을 나타내기 위한 것은 아니겠죠? 이 load factor가 필요한 이유는  load factor만큼 요소가 bucket에 저장이 되는 시점에 bucket의 사이즈를 늘려주기때문입니다. 그리고 bucket의 용량이 늘리고 난 바로 담에 rehashing이라는 작업을 통해 저장되어 있는 요소들을 다시 분배 시켜주는 작업을 하게 됩니다. 성능에는 안좋겠죠. 그리고 rehashing은 load factor 값을 작게 주면 더 빈번하게 일어나게 되겠죠.

하지만 rehashing을 너무 걱정한 나머지 load factor값을 너무 크게 줘 버리게 되면 look up cost( iteration cost)가 증가하게 되어 iteration의 성능에 악 영향을 주게 됩니다.  

따라서 load factor는 권장값인 .75를 사용하시면 되겠습니다. 그리고 initial capacity를 계산하는 방법은 아래와 같습니다.

```
initial capacity를 = 최대 entry 갯수 / load factor (.75)
```

따라서 최대 entry 갯수를 잘 예측하여 initial capacity를 주면 rehashing을 어느 정도 줄이게 되니 성능에도 좋을 것으로 생각됩니다.

### TreeMap
TreeMap은 [Red-Black tree](http://ko.wikipedia.org/wiki/레드-블랙_트리)라는 알고리즘을 기초로 한 NavigableMap의 구현체 입니다.  내부적으로 균형을 이룬 Red-Black tree라는 이진탐색 트리를 사용하는 Map 이며 TreeMap에 저장되는요소들을 정렬하기 위해 Red-Black tree를 사용한것으로 보입니다.

TreeMap의 정렬 방법은 기본적으로 key에 대해 오름차순정렬을 하며, 특정 정렬 방법으로 내부 요소들을 정렬하기 위해선 Comparator의 구현체를 사용 하면 됩니다. (* Comparator에 대해선 Appendix를 참조)

TreeMap의 정렬은 이진탐색트리의 기본 방법을 사용하고  그 방법은 기준값보다 작은 값이 들어오면 왼쪽으로, 큰 값이 들어오면 오른쪽으로 보내는 방법입니다.

기준과 특정 요소값의 비교는 TreeMap 생성시 주어진 Comparator 객체를 사용하거나, 해당 TreeMap에 들어갈 요소(`Entry<K,V>`)의 Key를 가지고 자연정렬방식으로 정렬을 하게 됩니다.

따라서 Comparator를 TreeMap 생성시 인자로 건내주거나, TreeMap에 저장할 요소의 Key객체가 반드시 Comparable을 구현한 객체이어야 하겠죠.

이때 TreeMap 객체의 키로 사용되는 객체가 Comparable interface를 구현하지만 Comparable interface의 compareTo(Object o) 메서드를 잘못 구현했다면 해당 TreeMap 객체에 요소를 입력하고 추출하는 예상하지 못한 결과를 얻을 수 도 있습니다.  (* Appendix의 WrongComparatorImpl 및 WrongComparatorTestDrive를 참조)

그럼 TreeMap의 성능은 어떨까요? HashMap,  LinkedHashMap과 비교해보면 가장 안좋습니다. 바로 정렬때문이죠.


### Sample Codes

#### MapHashTest
```
public class MapHashTest {

    public static void main(String[] args){
        String a = "a";
        String a1 = "a";
        String aa = "aa";
        String b= "b";

        int h = a.hashCode();
        int h1 = b.hashCode();
        int haa = aa.hashCode();
        int ha = a1.hashCode();

        h = hash(h);
        h1 = hash(h1);
        haa = hash(haa);
        ha = hash(ha);

        System.out.println("hash > "+ h);
        System.out.println("hash ha > "+ ha);
        System.out.println("hash1 > "+ h1);
        System.out.println("hash haa > "+ haa);
        System.out.println("index > "+ indexFor(h));
        System.out.println("index ha> "+ indexFor(ha));
        System.out.println("index1 > "+ indexFor(h1));
        System.out.println("index haa > "+ indexFor(haa));
    }

    static int hash(int h) {
        // This function ensures that hashCodes that differ only by
        // constant multiples at each bit position have a bounded
        // number of collisions (approximately 8 at default load factor).
        h ^= (h >>> 20) ^ (h >>> 12);
        return h ^ (h >>> 7) ^ (h >>> 4);
    }

    static int indexFor(int h) {
        return h & (20-1);
    }

     /**
     * Returns index for hash code h.
     */
    static int indexFor(int h, int length) {
        return h & (length-1);
    }
}

```

### MapPerformParamTest

```
import java.util.*;

public class MapPerformParamTest{
    public static void main(String[] args){
        Map<String,String> defaultMap = new HashMap<String,String>();
        Map<String,String> onlyInitCapaMap = new HashMap<String,String>(100000);
        Map<String,String> initCapaNLoadFactorMap = new  HashMap<String,String>(500,.01f);

        MapOrderTest.insertElementToMap(defaultMap,10);
        MapOrderTest.insertElementToMap(onlyInitCapaMap,10);
        MapOrderTest.insertElementToMap(initCapaNLoadFactorMap,10);

        System.out.println("defaultMap test ");
        MapOrderTest.displayElementInMap(defaultMap);

        System.out.println("onlyInitCapaMap test ");
        MapOrderTest.displayElementInMap(onlyInitCapaMap);

        System.out.println("initCapaNLoadFactorMap test ");
        MapOrderTest.displayElementInMap(initCapaNLoadFactorMap);

        defaultMap = null;
        onlyInitCapaMap = null;
        initCapaNLoadFactorMap = null;
    }
}

```

### MapOrderTest

```
import java.util.*;

public class MapOrderTest{
    public static void main(String[] args){
        Map<String,String> hashMap = new HashMap<String,String>();
        Map<String,String> treeMap = new TreeMap<String,String>();
        Map<String,String> linkedHashMap = new LinkedHashMap<String,String>();

        insertElementToMap(hashMap,10000);
        insertElementToMap(treeMap,10000);
        insertElementToMap(linkedHashMap,10000);

        displayElementInMap(hashMap);
        displayElementInMap(treeMap);
        displayElementInMap(linkedHashMap);
    }

    public static void insertElementToMap(Map<String,String> map, int cnt){
        long start = System.currentTimeMillis();
        for(int i=0;i<=cnt;i++){
            String keyAndValue = String.valueOf(i);
            map.put(keyAndValue,keyAndValue);
        }

        long end = System.currentTimeMillis();
        System.out.println("Insertion Process time of "+map.getClass().getSimpleName()+"  : " + (end-start));
    }

    public static void displayElementInMap(Map<String,String> map){
        long start = System.currentTimeMillis();

        System.out.println(map.getClass().getName() + " iteration with enhaced for loop");
        for(String key:map.keySet()){
            String value = map.get(key);
            System.out.println("key= "+ key + " value=" + value);
        }

        long end = System.currentTimeMillis();
        System.out.println("Iteration Process time of "+map.getClass().getSimpleName()+"  : " + (end-start));
    }
}
```

## Appendix
### Comparator
Collection 객체의 정렬 방식을 지정하기 위한 interface로 Comparator interface를 구현한 객체는 아래와 같은 메서드 혹은 생성자에 인자로 전달할 수 있다.

#### Methods
* Collections.sort
* Arrays.sort

#### 객체 생성자
* SortedSet의 모든 구현체
* SortedMap의 모든 구현체

#### Comparator interface 구현
Comparator는 compare(T o1, T o2) 메서드와 equals 메서드를 가지는데 compare(e1,e2) == 0 이라면 반드시 e1.equals(e2)(or e1.equals(e1))은 true를 반환해야 한다. 그렇지 않으면 원하지 않는 정렬 결과가 나올 수 있다.

###### TreeMapTest with Comparator
```
import java.util.*;

public class TreeMapTest{
   public static void main(String[] args){
       Map<Dummy,String> treeMap = new TreeMap<Dummy,String>();
       treeMap.put(new Dummy("1","dummy1"),"1");
       treeMap.put(new Dummy("2","dummy2"),"2");
       treeMap.put(new Dummy("3","dummy3"),"3");
       treeMap.put(new Dummy("4","dummy4"),"4");
       System.out.println(treeMap.toString());
   }
}

class Dummy implements Comparable<Dummy>{
   private String id;
   private String name;

   public Dummy(String i, String n){
       this.id = i;
       this.name = n;
   }

   public String getId(){
       return this.id;
   }

   public String getName(){
       return this.name;
   }

   public int compareTo(Dummy d){
       return this.id.compareTo(d.getId());
   }

   public int hashCode(){
       final int PRIME = 31;
       int result = 1;
       return PRIME * result + this.id.hashCode();
   }

   public boolean equals(Object o){
       if(o == null){
           return false;
       }

       if(!(o instanceof Dummy)){
           return false;
       }
       Dummy other = (Dummy)o;
       return this.id.equals(other.getId());
   }

   public String toString(){
       return this.id;
   }
}

class Dummy2{
   private String id;
   private String name;

   public Dummy2(String i, String n){
       this.id = i;
       this.name = n;
   }

   public String getId(){
       return this.id;
   }

   public String getName(){
       return this.name;
   }

   public String toString(){
       return this.id;
   }
}

```

###### WrongComparatorTestDrive

```
import java.util.Comparator;

public class WrongComparatorImpl implements Comparator<WrongComparatorImpl>, Comparable<WrongComparatorImpl> {

  private String id;

  public WrongComparatorImpl(String identity){
    this.id = identity;
  }



  @Override
  public int compare(WrongComparatorImpl o1, WrongComparatorImpl o2) {
    return 0;
  }

  @Override
  public int compareTo(WrongComparatorImpl o) {
    return 0;
  }

  /*
  Correct overrided compareTo method
  @Override
  public int compareTo(WrongComparatorImpl o){
    return  this.id.compareTo(o.getId());
  }
  */

  @Override
  public String toString() {
    return "WrongComparatorImpl [id=" + id + "]";
  }

  public String getId() {
    return id;
  }
}



import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class WrongComparatorTestDrive {
  public static void main(String[] args) {

    Map<WrongComparatorImpl,WrongComparatorImpl> treeMap = new TreeMap<WrongComparatorImpl,WrongComparatorImpl>();

    WrongComparatorImpl test1 = new WrongComparatorImpl("test1");
    WrongComparatorImpl test2 = new WrongComparatorImpl("test2");
    WrongComparatorImpl test3 = new WrongComparatorImpl("test3");

    treeMap.put(test1, test1);
    treeMap.put(test2, test2);
    treeMap.put(test3, test3);

    System.out.println(treeMap.toString());

    Map<Integer, Integer> autoboxingMap = new HashMap<Integer,Integer>();
    autoboxingMap.put(1, 1);
    autoboxingMap.put(2, 2);

    if(autoboxingMap.containsKey(1)) {
      System.out.println("autoboxing occur for 1");
      System.out.println("return type of value returned by get" + autoboxingMap.get(1).getClass().getName());
    }

    System.out.println("type of the returned by values method "+ autoboxingMap.values().getClass().getName());
  }
}

```
