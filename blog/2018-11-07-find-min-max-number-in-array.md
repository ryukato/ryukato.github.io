---
slug: Find smallest and largest number in array
title: Find smallest and largest number in array
authors: ryukato
date: 2018-11-07 09:36:55
tags: [Algorithm, find-min-max-numbers]
---

주어진 배열의 요소 중, 가장 작은 숫자와 가장 큰 숫자를 찾는 문제로 정렬을 사용하면 너무도 쉽게 풀 수 있는 문제다. 하지만 정렬을 사용하지 않고 문제를 해결해야 하거나, 시간복잡도 O(n)으로 혹은 공간 복잡도 O(1)로 풀어야 한다는 제약 조건이 추가로 붙는다면 다른 해결 방법을 찾아야 한다.

주어진 배열을 자연 정렬하면, 첫번째 숫자는 가장 작은 숫자가 되며 배열의 마지막 숫자가 가장 큰 숫자가 되게 된다. 하지만 정렬을 사용하면 시간복잡도 O(n)으로 해결하기가 쉽지 않다. 정렬 알고리즘 중 시간복잡도 O(n)으로 정렬을 처리하는 알고리즘이 거의 없기 때문이다.
아래의 코드에서 사용된 `Arrays.sort`는 [TimSort](https://en.wikipedia.org/wiki/Timsort)라는 알고리즘으로 정렬을 수행한다. [TimSort](https://en.wikipedia.org/wiki/Timsort)는 O(n log n)의 시간 복잡도를 가진다.

```
public static void printMinMaxNumbersBySort(int[] numbers) {
  Arrays.sort(numbers);
  System.out.println(String.format("%d is the smallest number", numbers[0]));
  System.out.println(String.format("%d is the largest number", numbers[numbers.length -1]));
}
```

시간복잡도 O(n)으로 혹은 공간 복잡도 O(1)로 풀어야 한다면 다음과 같이 문제를 해결 할 수 있을 것으로 생각된다.

```
public static void printMinMaxNumbers(int[] numbers) {
  int largest = Integer.MIN_VALUE;
  int smallest = Integer.MAX_VALUE;
  for (int number: numbers) {
      if (number > largest) {
          largest = number;
      } else if (number < smallest) {
          smallest = number;
      }
  }

  System.out.println(String.format("%d is the smallest number", smallest));
  System.out.println(String.format("%d is the largest number", largest));
}
```

만약 위 문제에 대해 추가적인 질문으로 다음과 같은 질문들을 생각해 볼 수 있을 것 같다.
* 위의 해결 방법 말고, 시간 복잡도를 O(log n)으로 풀 수 있는 방법이 있을까? 대답은 ##"노"##이다. 배열을 반으로, 또 반으로 계속 반으로 쪼개야 O(log n)으로 풀 수 있겠지만 정렬되어 있지 않은 배열의 경우에는 그건 의미가 없다.
반으로 계속 쪼개는 건 배열이 이미 정렬이 되어 있어야 한다. 그리고 배열이 이미 정렬이 되어 있다면 첫번째와 마지막 요소를 선택하면 되기 때문에 복잡도는 O(1)이 된다.
* 위의 해결 코드에서 몇개의 요소를 탐색하게 되는가?, 즉 for loop안의 코드는 몇번을 반복하게 되는가? 대답은 당연하게도 모든 요소를 탐색하기 때문에 요소의 개수를 N이라고 하면 for loop는 N만큼 반복하게 된다.
* 가장 큰 수와 두번째로 큰 수를 찾을 수 있겠는가? 당연히 찾을 수 있고, 두번째로 큰 수를 찾는 것은 위의 과정과 거의 유사하다. 단 가장 작은 숫자 대신 두번째로 큰 수에 대한 변수와 비교 조건으로 바꾸면 된다.

###### Find the second largest number in array

```
public static void printSecondMaxNumbers(int[] numbers) {
  int largest = Integer.MIN_VALUE;
  int secondLargest = largest;
  for (int number: numbers) {
      if (number > largest) {
          secondLargest = largest;
          largest = number;
      } else if (number > secondLargest) {
          secondLargest = number;
      }
  }

  System.out.println(String.format("%d is the second largest number", secondLargest));
  System.out.println(String.format("%d is the largest number", largest));
}
```
