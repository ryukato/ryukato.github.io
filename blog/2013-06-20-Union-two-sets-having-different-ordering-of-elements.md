---
slug: 정렬순서가 다른 두 Set을 하나로 만들기
title: 정렬순서가 다른 두 Set을 하나로 만들기
authors: ryukato
date: 2013-08-11 16:57:29
tags: [Java, JCF, Set, Ordering]
---

<!-- truncate -->

# 정렬순서가 다른 두 Set을 하나로 만들기
함께 일하는 분이 물어봐서 함 짜봤다.
아래 코드는 하나는 오름차순, 다른 하나는 내림차순으로 정렬하는 두개의 TreeSet을 만들어서 하나의 List에 합치는 것으로 **TreeSet**은 생성자에서 **Comparator**를 받아 해당 **Comparator** 객체를 가지고 Set에 들어갈 요소들을 정렬하기때문에, **오름차순으로 정렬하는 Comparator**, **내림차순으로 정렬하는 Comparator**를 각각 만들어서 각각의 TreeSet 생성자에 넣어주면 된다.

간단한 예제이지만 응용하면 괜찮을것 같다.

```
import java.util.*;
public class DiffOrderTest{
    public static void main(String[] args){
        java.util.Set<FloorEntry> ascMap = null;
        java.util.Set<FloorEntry> descMap = null;

        ascMap = new java.util.TreeSet<FloorEntry>(new Comparator<FloorEntry>(){
            public int compare(FloorEntry f1, FloorEntry f2){
                return f2.getFloor().compareTo(f1.getFloor());
            }    
        });
        descMap = new java.util.TreeSet<FloorEntry>(new Comparator<FloorEntry>(){
            public int compare(FloorEntry f1, FloorEntry f2){
                return f1.getFloor().compareTo(f2.getFloor());
            }    
        });

        ascMap.add(new FloorEntry("1","1"));
        ascMap.add(new FloorEntry("2","2"));
        ascMap.add(new FloorEntry("3","3"));
        ascMap.add(new FloorEntry("4","4"));
        ascMap.add(new FloorEntry("5","5"));
        ascMap.add(new FloorEntry("6","6"));
        ascMap.add(new FloorEntry("7","7"));

        descMap.add(new FloorEntry("B1","B1"));
        descMap.add(new FloorEntry("B2","B2"));
        descMap.add(new FloorEntry("B3","B3"));

        int totalSize = ascMap.size() + descMap.size();
        List<FloorEntry> totalList = new ArrayList<FloorEntry>(totalSize);
        mergeSetToList(ascMap,totalList);
        mergeSetToList(descMap,totalList);

        System.out.println(totalList);

    }
    public static void mergeSetToList(Set<FloorEntry> s1, List<FloorEntry> list){
        for(FloorEntry fe:s1){
            list.add(fe);
        }
    }

    static class FloorEntry{
        private final String floor;
        private final String data;

        public FloorEntry(String f, String d){
            this.floor = f;
            this.data = d;
        }
        public String getFloor(){
            return this.floor;
        }
        public String toString(){
            return "FloorEntry"+": floor="+ this.floor + ", data="+ this.data;
        }
    }
}
```
