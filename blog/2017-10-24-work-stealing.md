---
slug: work-stealing
title: work-stealing
authors: ryukato
date: 2017-10-24 16:57:29
tags: [parallel-computing, work-stealing]
---

<!-- truncate -->


원본: https://en.wikipedia.org/wiki/Work_stealing

# Work stealing
[패러랠 컴퓨팅(parallel computing)](https://en.wikipedia.org/wiki/Parallel_computing) 환경에서, working stealing은 다중 쓰레드를 활용한 컴퓨터 프로그램을 위한 스케쥴링(scheduling) 전략이다. working stealing은 동적인 다중 쓰레드 계산 실행상의 문제를 해결하는데, 그중 하나는 고정된 갯수의 프로세서(혹은 코어)를 가진, 정적인 다중 쓰레드 기반의 컴퓨터 상에서 새로운 실행 쓰레드를 생성하는 것이다. Working stealing은 실행 시간, 메모리 사용량 그리고 프로세서간 통신 측면에서 굉장히 효율적이다.

Working stealing 스케쥴러상에서, 컴퓨터 시스템의 개별 프로세서는 계산 작업 그리고 쓰레드와 같은 작업 항목을 위한 큐(queue)를 가지고 있다. 개별 작업 항목은 순차적으로 실행되어야 할 일련의 작업 지시 사항들로 이루어져 있는데, 실제 실행 과정에서 하나의 작업 항목은 동시에 처리 될 수 있는 새로운 작업 항목을 생성할 수도 있다. 이런 새로운 작업 항목들은 생성된 초기엔 해당 작업 항목을 처리할 프로세서의 큐에 포함된다. 특정 프로세서가 자신의 모든 작업 항목 처리를 완료 하였을때, 다른 프로세서의 큐를 살펴보고 처리 되지 않은 작업 항목이 있으면 그 작업 항목을 "훔쳐"와서 처리한다.  사실 work stealing은 모든 프로세서가 유휴 상태에 빠지지 않고 스케쥴링(scheduling)의 과부하가 발생하지 않는 선에서 유휴 상태(놀고 있는) 프로세서에게 작업 계획을 재 분배한다.

Work stealing은 동적 쓰레딩처리를 위한 또 다른 접근 방법인 work sharing과는 대조 되는데, work stealing의 경우 프로세서간 프로세스 이관(migration) 처리량을 줄 일 수 있다. 그 이유는 모든 프로세서가 해야 할 일을 가지고 있다면 프로세서간 프로세스 이관은 발생하지 않기때문이다.

*work sharing은 새로운 작업 항목 생성 시, 특정 프로세서에서 실행되도록 스케쥴링 된다.*

Work stealing의 아이디어(idea)는 1980년대의 [Multilisp](https://en.wikipedia.org/wiki/Multilisp) 프로그래밍 언어의 구현과 [함수형 프로그래밍언어](https://en.wikipedia.org/wiki/Functional_programming)의 병렬처리를 위한 작업으로 거슬러 올라갑니다. Work stealing은 [Cilk](https://en.wikipedia.org/wiki/Cilk) 프로그래밍 언어를 위한 스케쥴러, 자바(Java)의 fork/join 프레임워크 그리고 .NET의 Task Parallel Libary에 채용되었습니다.

## Execution model
Work stealing은 병렬 처리 기법의 "엄격한" fork/join model을 위해 설계 되었습니다. Work stealing을 통해 처리되는 계산은 계산 처리의 시작을 나타내는 단일 소스(source)와 계산의 종료를 나타내는 단일 싱크(sink)를 가지는 비순환 방향 그래프([Directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph))로 표현 할 수 있습니다. 그래프에서 각 노드(node)는 fork혹은 join을 나타냅니다. Fork들은 다중의 논리적인 쓰레드 혹은 스트랜드로 불리는 병렬처리를 생산합니다. 노드를 이어주는 선(edge)은 연속적인 계산을 의미합니다.

예를 들어 아래의 Cilk 언어 형식으로 작성된 예제를 보겠습니다.

```
function f(a, b):
    c ← fork g(a)
    d ← h(b)
    join
    return c + d

function g(a):
    return a × 2

function h(a):
    b ← fork g(a)
    c ← a + 1
    join
    return b + c
```
f(1, 2) 함수 호출은 아래와 같은 계산 그래프로 나타낼 수 있습니다.
![](https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Fork-join_computation.svg/1806px-Fork-join_computation.svg.png)

*출처: [Wikipedia Work_stealing](https://en.wikipedia.org/wiki/Work_stealing)*

위의 그래프를 보면, 두개의 선(edge)가 하나의 노드로부터 시작될때, 계산 처리들은 선위의 표기(label)로 표기되며 논리적인 병렬 처리를 말합니다. 그 두개의 선으로 표시된 계산 처리들은 병렬 혹은 순차적으로 처리될 수 있습니다. 계산 처리는 join 노드로 들어오는 선으로 표시되는 계산이 완료되면 해당 join노드에서 진행될 수 도 있습니다. 이제 스케쥴러가 해야 할 일은 전체 계산이 정확한 순서(join 노드들로 제약된)로 실행 될 수 있는 최대한 빨리 완료할 수 있는 방법으로 계산 처리들(edges)을 프로세서에 할당 하는 것입니다.
