---
slug: Ordering elements of Set implementations - HashSet, TreeSet and LinkedHashSet
title: Ordering elements of Set implementations - HashSet, TreeSet and LinkedHashSet
authors: ryukato
date: 2012-12-26 09:36:55
tags: [Java, JCF, HashSet, TreeSet, LinkedHashSet]
---

# Set Implementations - HashSet, TreeSet, and LinkedHashSet의 정렬
HashSet, TreeSet, and LinkedHashSet은 Set의 구현체 클래스입니다.
Set interface의 모든 메서드들을 서로 가지고 있지만 이들의 정렬 방법은 서로 다릅니다.
그래서 정렬을 해야하는 경우, 정렬이 상관없는 경우등에 따라서 써야할 객체가 달라질 수 있습니다.
성능은 **HashSet > LinkedHashSet > TreeSet**  순이며, 그 이유는 정렬의 여부도 영향을 미치는 것으로 알고 있습니다


먼저 HashSet은 정렬이 안됩니다. 예를 들어 1,2,3,4,5순으로 입력했다하여도 Iteration을 할 경우 출력되는 순서는 입력순서와는 상관이 없습니다.즉, chaotic order, 무순서입니다. HashSet에 입력될 객체가 Comparable, Comparator를 구현하였다고 하여도 HashSet에 입력된 element들은 정렬되지 않습니다. 그리고 HashSet의 생성자들을 보면 Comparable 혹은 Comparator를 인자로 받는 생성자는 없습니다. 이건 HashSet이 정렬을 제공하지 않는다라는 것이죠.

그럼 HashSet객체에 데이터를 담았는데, 담겨있는 데이터를 순서대로 출력하거나, 받아올려면 어떻게 해야할까요?

TreeSet을 이용하면 됩니다. TreeSet은 HashSet과는 달리 요소를 입력할때 요소들을 정렬을 시켜 줍니다. 단, 입력할 요소 객체는 반드시 Comparable의 구현체 이어야 합니다.

```
final Set<Comparable> hashSet = new HashSet<Comparable>();
hashSet.add(new Dummy("1"));
hashSet.add(new Dummy("3"));
hashSet.add(new Dummy("2"));
hashSet.add(new Dummy("4"));

System.out.println("======================= HashSet order Test =======================");

Iterator<Comparable> it = hashSet.iterator();
	while(it.hasNext()){
		System.out.println(">>" + ((Dummy)it.next()).getName());
	}

System.out.println("======================= TreeSet order Test =======================");
//HashSet객체를 TreeSet 생성자에 인자로 주어, TreeSet객체를 생성.
final Set<Comparable> treeSet = new TreeSet<Comparable>(hashSet);
it = treeSet.iterator();
while(it.hasNext()){
  System.out.println(">>" + ((Dummy)it.next()).getName());
}

```

다음은 LinkedHashSet입니다. 이 객체는 입력된 순서대로 Iteration이 되고 출력을 합니다.
만약 HashSet인스턴스를 매개변수로 받아 새로운 LinkedHashSet 인스턴스를 만드는 경우에는 HashSet에 element들이 입력된 순서에는 상관없이 HashSet과 똑같은 순서로 Iteration이 되고 출력이 됩니다.
LinkedHashSet도 HashSet과 마찮가지로 element로 입력될 객체가 Comparable, Comparator를 구현해도 출력되는 순서는 바뀌지 않습니다.

마지막으로 TreeSet입니다. 먼저 TreeSet에 입력될 element 객체는 반드시 Comparable을 구현해야하고 혹은 입력될 객체에 대한 Comparator를 구현한 클래스 객체를 TreeSet 객체 생성시 매개변수로 주어야합니다.
이유는 TreeSet은 입력된 element들을 Comparable을 구현한 객체,혹은 Comparator 객체의 정렬방식으로 정렬이 되기 때문입니다. Primitive type같은 경우는 auto-boxing을 하여 Wrapper 객체로 변환됩니다.
Set의 add method를 보면 boolean add(E o); Object를 받습니다.
Primitive type은 Object가 아니죠. 따라서 auto-boxing되는 겁니다.
그리고 Wrapper 클래스들을 보면 Comparable을 구현하기때문에 TreeSet에 넣어도 정렬이 되는 것이죠.
아래의 예제의 마지막 부분에 primitiveTreeSet의 iterator를 받는 부분에 `Iterator<Integer>`라고 했습니다.
Integer는 int의 Wrapper클래스이고 입력된 int값들은 Integer로 auto-boxing되는 것이죠. 아래의 예제를 보면 충분히 이해가 될것입니다.


```
public class Dummy implements Comparable<Dummy> {
 private String name;
 Dummy(String n){
  this.name = n;
 }

 public int compareTo(Dummy o) {
  return this.name.compareTo(o.name);
 }

 public String getName(){
  return this.name;
 }
}

import java.util.Comparator;

class DummyComparator implements Comparator<Dummy>{
 public int compare(Dummy o1, Dummy o2) {
  return o1.getName().compareTo(o2.getName());
 }
}

import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.TreeSet;

public class LinkedHashSetTest {

 public static void main(String[] args) {
  Set<Dummy> linkedHashSet = null;
  Set<Dummy> hashSet = new HashSet<Dummy>();
  hashSet.add(new Dummy("1"));
  hashSet.add(new Dummy("2"));
  hashSet.add(new Dummy("3"));
  hashSet.add(new Dummy("5"));
  hashSet.add(new Dummy("4"));

  Iterator<Dummy> it = hashSet.iterator();
  System.out.println("HashSet iteratortion");
  printIterator(it);

  linkedHashSet = new LinkedHashSet<Dummy>(hashSet);
  it = linkedHashSet.iterator();
  System.out.println("LinkedHashSet iteratortion");
  printIterator(it);

  linkedHashSet.clear();
  linkedHashSet.add(new Dummy("1"));
  linkedHashSet.add(new Dummy("2"));
  linkedHashSet.add(new Dummy("3"));
  linkedHashSet.add(new Dummy("5"));
  linkedHashSet.add(new Dummy("4"));
  it = linkedHashSet.iterator();
  System.out.println("LinkedHashSet iteratortion in insertion order");
  printIterator(it);

  TreeSet<Dummy> treeSet = new TreeSet<Dummy>(hashSet);
  it = treeSet.iterator();
  System.out.println("TreeSet iteratortion");
  printIterator(it);

  treeSet.clear();
  treeSet.add(new Dummy("1"));
  treeSet.add(new Dummy("2"));
  treeSet.add(new Dummy("3"));
  treeSet.add(new Dummy("5"));
  treeSet.add(new Dummy("4"));

  it = treeSet.iterator();
  System.out.println("TreeSet iteratortion regardless of insertion order");
  printIterator(it);

  TreeSet<Integer> primitiveTreeSet = new TreeSet<Integer>();
  primitiveTreeSet.add(1);
  primitiveTreeSet.add(2);
  primitiveTreeSet.add(3);
  primitiveTreeSet.add(4);
  primitiveTreeSet.add(5);
  Iterator<Integer> it2 = primitiveTreeSet.iterator();
  System.out.println("TreeSet iteratortion primitive type");
  printIterator2(it2);
 }

 public static void printIterator(Iterator<Dummy> it){
  while(it.hasNext()){
   Dummy s = it.next();
   System.out.println("hashCode: "+s.getName());
  }
 }
 public static void printIterator2(Iterator<Integer> it){
  while(it.hasNext()){
   System.out.println("hashCode: "+it.next());
  }
 }
}
```
