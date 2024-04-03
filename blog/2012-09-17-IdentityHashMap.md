---
slug: IdentityHashMap
title: IdentityHashMap
authors: ryukato
date: 2013-04-03 16:57:29
tags: [Java, JCF, Map, IdentityHashMap]
categories: [Java]
---

<!-- truncate -->

# IdentityHashMap
IdentityHashMap객체는 key로 쓰이는 특정 object의 hashCode,equals 메서드를 사용하지 않고 자체적으로 해당 key object의 레퍼런스값을 비교하여 같은지 아닌지를 비교합니다.
IdentityHashMap객체는 Map객체의 일반적인 계약사항(key object의 hashCode,equals 메서드를 사용하여 해당 key object를 비교하는것)을 위반하였는데, 이는 reference-equality semantics이 요구되는 특별한 경우에 사용되기 때문입니다.

 아래의 예제는 가장많이(?)사용되는 HashMap과 비교한 예제입니다. 결과를 보시면 무엇이 다른지를 알 수 있을 것입니다.

```
 public class Dummy {
 private String name;

 public Dummy(String s){
  this.name = s;
 }

 @Override
 public int hashCode() {
  final int prime = 31;
  int result = 1;
  result = prime * result + ((name == null) ? 0 : name.hashCode());
  return result;
 }

 @Override
 public boolean equals(Object obj) {
  if (this == obj)
   return true;
  if (obj == null)
   return false;
  if (getClass() != obj.getClass())
   return false;
  Dummy other = (Dummy) obj;
  if (name == null) {
   if (other.name != null)
    return false;
  } else if (!name.equals(other.name))
   return false;
  return true;
 }
}

```

Test classIdentityHashMap과 HashMap의 equals 메서드를 비교해보는 코드입니다.
결과에서 볼 수 있듯이 HashMap의 equals 메서드는 true를 반환하는데, IdentityHashMap의 equals 메서드는 false를 반환합니다.
그 이유는 IdentityHashMap의 equals 메서드는 key object가 같은 reference인지 아닌지를 판단하여 같으면 true, 다르면 false를 반환하기 때문입니다.
> 같은 레퍼런스를 가진다라는 것은 힙에 생성된 동일한 instance에 대한 레퍼런스가 같다는 것을 의미합니다. 즉, 동일한 instance임을 의미하는 것이죠.

```
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.Map;

public class IdentityHashMapTest {
 public Map<Dummy,String> iMap = new IdentityHashMap<Dummy,String>();
 public Map<Dummy,String> iMap2 = new IdentityHashMap<Dummy,String>();

 public Map<Dummy,String> m1 = new HashMap<Dummy,String>();
 public Map<Dummy,String> m2 = new HashMap<Dummy,String>();

 public IdentityHashMapTest(){
  System.out.println("IdentityHashMap >>>>>>>>>>>>");
  Dummy dummy1 = new Dummy("1");
  Dummy dummy2 = new Dummy("1");
  System.out.println("Dummy1 and Dummy2 have same reference? " + (dummy1==dummy2 ));
  iMap.put(dummy1,"A");
  iMap.put(dummy2,"A");

  iMap.put(dummy1,"A");
  iMap.put(dummy2,"A");
 }

 public IdentityHashMapTest(int dummy){
  System.out.println("HashMap >>>>>>>>>>>>");
  Dummy dummy1 = new Dummy("1");
  Dummy dummy2 = new Dummy("1");
  System.out.println("Dummy1 and Dummy2 have same reference? " + (dummy1==dummy2 ));
  m1.put(dummy1,"A");
  m1.put(dummy2,"A");

  m2.put(dummy1,"A");
  m2.put(dummy2,"A");
 }
 public boolean compareTwoIdentityHashMap(Map<Dummy,String> map1, Map<Dummy,String> map2){
  return map1.equals(map2);
 }

 public static void main(String[] args) {
  IdentityHashMapTest it = new IdentityHashMapTest();
  System.out.println("map1 and map2 is same ?" + it.compareTwoIdentityHashMap(it.iMap, it.iMap2));

  IdentityHashMapTest it2 = new IdentityHashMapTest(1);
  System.out.println("map1 and map2 is same ?" + it.compareTwoIdentityHashMap(it2.m1, it2.m2));

 }
}
```
