---
slug: Find missing numbers in array.
title: Find missing numbers in array.
authors: ryukato
date: 2018-10-23 09:36:55
tags: [Algorithm, find-missing-numbers]
---

### 1부터 100(혹은 더 큰 범위)에서 빠진 숫자들을 찾아라
예) 1부터 10까지의 범위에서 빠진 숫자를 찾으라는 문제로 1부터 10까지의 수, 1, 2,3 4, 5, 6, 7, 8, 9, 10 중에 빠진 숫자를 찾으라는 것이다.

이 문제는 빠진 숫자가 하나인지 혹은 하나 이상인지에 따라 푸는 방식과 복잡도가 달라지게 된다. 그리고 주어진 숫자들이 정렬이 되어 있는지는 크게 중요하지 않다.

따라서 이런 질문을 받는다면, 먼제 빠진 숫자가 하나 인지 혹은 하나 이상인지를 먼저 물어봐야 한다.

빠진 숫자가 하나인 경우라면, 답은 굉장히 쉽다. 아래의 공식만 알면 되기 때문이다. 주어진 범위내의 숫자들의 합은 다음의 공식으로 구할 수 있다.

`n * (n+1)/2`

위의 공식으로 전체 합(expectedSum)을 구하고, 주어진 배열에 포함된 숫자들의 합(actualSum)을 구해서 전체 합에서 빼면 빠진 숫자가 나오게 된다. 이때 배열에 포함된 숫자들의 합을 구하려면 포함된 숫자의 개수 만큼 반복해서 합을 구해야 한다. 따라서 복잡도는 `O(n)`이 된다.

해당 알고리즘에 대한 코드는 다음과 같을 수 있다.

###### Java8 이전 버전
```
private static int findMissingNumber(int[] numbers, int totalCount) {
	int expectedSum = totalCount * (totalCount + 1) /2;
	int actualSum = 0;
	for(int i : numbers) {
		actualSum += i;
	}
	return expectedSum - actualSum;
}
```

###### Java8이후 버전
```
private static int findMissingNumber(int[] numbers, int totalCount) {
	int expectedSum = totalCount * (totalCount + 1) /2;
	int actualSum = Arrays.stream(numbers).reduce(Integer::sum).getAsInt()

	return expectedSum - actualSum;
}
```

위와 같이 누락된 숫자가 하나인 경우는 해답을 찾는 것이 그렇게 어렵진 않지만 하나 이상의 경우에는 해답을 찾는 것이 좀 더 어려울 수 있다. 그리고 찾는 방법 또한 여러가지 방법이 있을 수 있다.  

여러 방법 중, 아래의 해답은 BitSet을 이용한 방법으로, BitSet의 특징과 사용법을 알아야 한다. BitSet에 대한 사용 예제는 [BitSet class 예제](http://hochulshin.com/java-bitset/)를 참고하면 될 것 같다.

true, false의 boolean element로 이루어진 배열 객체인 BitSet의 특성을 이용하여 특정 범위내의 누락된 숫자를 찾는 알고리즘은 전체 주어진 숫자들을 순환(N)하면서 BitSet객체에 true값을 설정한 이후에 누락된 숫자의 개수(K)만큼 반복하여 BitSet 객체에 설정된 false 값의 인덱스(누락된 숫자)를 취하여 누락된 숫자들을 찾아내는 것이다. 코드는 다음과 같으며 복잡도는 O(2n)으로 생각된다.

> Note
>
> N은 주어진 숫자의 개수

> K는 누락된 숫자의 개수, 즉, K = 범위내의 전체 숫자(T) - N. 최악의 경우 K = N이 될 수 있다.

```
private static int[] findMissingNumbers(int[] numbers, int totalCount) {
    int missingCount = totalCount - numbers.length;
    BitSet bitSet = new BitSet(totalCount);
    for (int number: numbers) {  // N번 만큼 반복
        bitSet.set(number-1, true);
    }
    int lastMissingIndex = numbers[0];
    int[] missingNumbers = new int[missingCount];
    for (int i = 0; i < missingCount; i++) {  // K번만큼 반복
    	// 주어진 index 값으로부터 첫번째 false 값을 찾고 index 값을 증가.
        lastMissingIndex = bitSet.nextClearBit(lastMissingIndex);
        missingNumbers[i] = ++lastMissingIndex;
    }
    return missingNumbers;
}
```
