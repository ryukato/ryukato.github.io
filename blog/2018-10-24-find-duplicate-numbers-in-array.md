---
slgu: Find duplicate numbers in array.
title: Find duplicate numbers in array.
authors: ryukato
date: 2018-10-23 09:36:55
tags: [Algorithm, find-duplicate-numbers]
---

<!-- truncate -->

주어진 배열의 요소 중, 중복된 요소를 찾는 문제이다. 이 문제를 푸는 방법 또한 여러가지 방법이 있을 수 있다. 다만, 각각의 푸는 방법에 따라 시간 복잡도와 공간(메모리) 복잡도다 달라지게 된다. 따라서 추가적인 제한 조건, 예를 들어 공간 복잡도는 O(1)를 가지도록 문제를 해결하라 등의 제한조건이 있을 수 있다.

첫번째 방법으로 주어진 배열의 요소를 하나씩 선택해서 전체 배열의 요소를 대상으로 자신과 같은지를 비교하는 방법으로 복잡도는 O(n^2)이지만, 추가적인 공간은 사용하지 않으므로 공간 복잡도는 O(1)이 된다.  코드는 다음과 같다.

```
public void printDuplicateNumbers(int[] numbers) {
	for(int i = 0; i < numbers.length; i++) {
		for(int j = i + 1; j < numbers.length; j++) {
			if (numbers[i] == numbers[j]) {
				System.out.println("Duplicate number: " + numbers[i]);
			}
		}
	}
}
```

두번째 방법으로는 주어진 배열을 먼저 정렬하고, 배열내의 요소들을 차례대로 반복하여 각각을 비교하는 방법이다. 복잡도는 정렬의 복잡도에 의해 O(n log(n))이며, 공간 복잡도는 O(n)이 된다.

```
public static void printDuplicateNumbersBySort(int[] numbers) {
    Arrays.sort(numbers);
    for(int i = 0; i < numbers.length -1; i++) {
        if (numbers[i] == numbers[i + 1]) {
            System.out.println("Duplicate number: " + numbers[i]);
        }
    }
}
```

마지막 방법으로는 중복을 허용하지 않는 Set 객체를 이용하는 방법이다.  이 방법은 주어진 배열의 요소를 한번씩만 확인하면 되기 때문에 복잡도는 O(n)이 되고 각 요소를 Set 객체에 저장해야 하므로 공간 복잡도는 O(n)이 된다.

```
public static void printDuplicateNumbersBySet(int[] numbers) {
    java.util.Set<Integer> numberSet = new HashSet<>();
    for (int i : numbers) {
        Integer number = new Integer(i);
        if (numberSet.contains(number)) {
            System.out.println("Duplicate number: " + number.intValue());
        } else {
            numberSet.add(number);
        }
    }
}
```
