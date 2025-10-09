---
slug: Sharding and MSA 
title: About Sharding and MSA 
authors: ryukato
date: 2025-07-29 14:46:00
tags: [sharding, msa]
---


# 샤딩과 MSA 구조 설계에 대한 고민

## 🧭 서문

많은 팀과 조직이 데이터베이스의 성능 병목이나 대용량 처리 이슈에 직면했을 때, 가장 먼저 떠올리는 해결책 중 하나가 바로 **샤딩(Sharding)**입니다.  
샤딩은 분명히 강력한 수평 확장 전략이지만, 그만큼 도입과 운영에 따르는 복잡도와 위험성도 큽니다.

특히, 샤딩은 단순한 기술적 기능이 아니라 **전체 시스템 아키텍처에 영향을 주는 구조적 결정**이기 때문에, 도입을 서두르기보다는 **샤딩 없이 해결할 수 있는 방안들을 먼저 고려하고**, 샤딩이 필요한 시점과 범위를 명확히 판단한 후에 적용하는 것이 바람직합니다.

이 글에서는 샤딩 도입 전 고려할 수 있는 단계, 샤딩의 적용 원칙, MSA 및 vertical slicing과의 관계, 그리고 궁극적으로 나노 서비스 아키텍처와 BFF 구조로의 확장까지 폭넓게 다뤄봅니다.

---

<!-- truncate -->

## ✅ 샤딩 도입 전 고려 사항

### 1. MMM 구성

가장 먼저 고려할 수 있는 확장 방식은 **Master-Replica(MMM)** 구성입니다.  
하나의 Master DB에 여러 개의 Read Replica를 붙여서 **읽기 부하를 분산**할 수 있습니다.

- 쓰기는 오직 Master에서만 발생
- 읽기는 Replica에서 처리
- Spring Boot에서는 `AbstractRoutingDataSource` 등을 통해 read/write 분리를 쉽게 구현 가능
- Replica Lag 고려 필요

> 이 구조만으로도 대부분의 서비스는 **초당 수천 QPS 수준의 처리 성능**을 확보할 수 있습니다.

---

### 2. 테이블 파티셔닝

DBMS 차원에서 지원하는 **수평 파티셔닝**도 좋은 전략입니다.  
예를 들어 PostgreSQL의 `table partition`, MySQL의 `partition by range` 등을 활용해 대용량 테이블을 나눌 수 있습니다.

- 날짜 기준 파티션 (예: 월별 주문 테이블)
- 지역/국가 코드 기준 파티션
- 인덱스 및 I/O 최적화에 효과적

단점은:
- 파티션 간 조인이 어려움
- 파티션 관리 정책 필요 (drop/recreate)

> 파티셔닝만으로도 성능 병목이 완화되는 경우가 많으며, 샤딩 이전에 반드시 고려해야 할 단계입니다.

---

## ✅ 샤딩 구조의 핵심

샤딩의 기본 개념은 "하나의 테이블을 여러 DB 인스턴스로 나누어 저장"하는 것입니다.

### 1. 샤드 키 선정

샤드 키는 데이터를 어떤 기준으로 나눌지를 결정하는 핵심입니다.  
좋은 샤드 키는 다음 조건을 만족해야 합니다:

- 거의 모든 쿼리에 포함되어야 함
- 균등하게 분포되어야 함
- 변경되지 않아야 함

대표적인 키: `user_id`, `tenant_id`, `contract_id`, `region_id`

---

### 2. 샤드 결정 방식

- **Mod 방식**: `shardId = user_id % N`
- **Hash Slot 방식**: `slot = hash(user_id) % 1024 → slotToShardMap`
- **Range 방식**: `user_id` 값의 범위로 분기

샤드 결정은 **변하지 않도록** 고정된 알고리즘 또는 테이블 기반으로 관리해야 함

---

### 3. 라우팅 구현 방식

- **애플리케이션 레벨 라우팅**: `user_id` 기반으로 직접 커넥션 선택
- **미들웨어 기반**: ProxySQL, Vitess 등에서 쿼리를 해석하고 자동 분기
- **조합형**: 라우팅 테이블을 애플리케이션에서 동적으로 로딩 (`slot → shard` 맵핑)

---

## ✅ 샤딩이 필요한 시점

### 수치 기준

| 항목 | 기준 |
|------|------|
| QPS | 5,000~10,000 이상 |
| TPS | 초당 쓰기 1,000건 이상 |
| 테이블 사이즈 | 단일 테이블 100~200GB 이상 |
| 커넥션 수 | 500~1000 이상 상시 유지 |
| 인덱스 메모리 적재 실패 | 페이지 캐시 히트율 저하 |

---

### 샤딩 구성 예시와 Spring 기반 Kotlin 코드

### 📌 샤딩 구성 예시 (2개 샤드)

- 기준: `user_id % 2`
- 샤드:
  - `shard1`: user_id 짝수
  - `shard2`: user_id 홀수

```
        +--------------------+
        |   Application API  |
        +--------------------+
                |
            ShardRouter
                |
    +-------------+-------------+
    |                           |
shard1(DBClient)         shard2(DBClient)
```

---

### ✅ Kotlin + Coroutine 기반 샤딩 라우팅 예시

#### 🔹 Slot 기반 라우터

```kotlin
data class ShardInfo(val id: String, val client: DatabaseClient)

class ShardRouter(private val shards: List<ShardInfo>) {
    fun route(userId: Long): DatabaseClient {
        val shardIndex = (userId % shards.size).toInt()
        return shards[shardIndex].client
    }
}
```

---

#### 🔹 서비스에서 라우팅 적용

```kotlin
class UserService(private val router: ShardRouter) {
    suspend fun getUser(userId: Long): User? {
        val client = router.route(userId)
        return client.sql("SELECT * FROM users WHERE user_id = :id")
            .bind("id", userId)
            .map { row -> User.from(row) }
            .one()
            .awaitFirstOrNull()
    }
}
```

---

#### 🔹 CoroutineContext 기반 전달 예시

```kotlin
data class ShardContext(val userId: Long) : CoroutineContext.Element {
    companion object Key : CoroutineContext.Key<ShardContext>
    override val key = Key
}

suspend fun <T> withShard(userId: Long, block: suspend () -> T): T {
    return withContext(ShardContext(userId)) {
        block()
    }
}
```

→ 이후 `ShardRouter`에서 `coroutineContext[ShardContext]?.userId`로 추출 가능

---

### ✅ Spring + AbstractRoutingDataSource (JDBC 방식)

```kotlin
object ShardContextHolder {
    private val context = ThreadLocal<Long?>()
    fun setUserId(id: Long) = context.set(id)
    fun getUserId(): Long? = context.get()
    fun clear() = context.remove()
}
```

```kotlin
class ShardRoutingDataSource(...) : AbstractRoutingDataSource() {
    override fun determineCurrentLookupKey(): Any? {
        val userId = ShardContextHolder.getUserId() ?: return "default"
        return "shard${userId % 2}"
    }
}
```

→ AOP로 `userId` 값을 사전에 세팅하여 `@Transactional` 사용 가능하게 처리

---

## ☑️ 결론

- 샤딩 라우팅은 **Kotlin Coroutine** 환경에선 `CoroutineContext`를, Spring JDBC 환경에선 `AbstractRoutingDataSource`를 기반으로 설계 가능
- 샤딩 라우터는 가능한 범용 구조로 추상화하여 서비스에 유연하게 주입

---
## ✅ 샤딩 환경에서 트랜잭션

### 🔹 샤딩 환경에서 트랜잭션 처리 예제

샤딩 환경에서는 하나의 트랜잭션이 두 개 이상의 샤드에 걸쳐 발생하지 않도록 설계하는 것이 이상적입니다.  
하지만 필요한 경우, 샤드 단위 트랜잭션을 개별 수행하거나, **보상 트랜잭션** 구조로 대체할 수 있습니다.

#### ✅ Kotlin Coroutine 기반 샤드 트랜잭션 예시

```kotlin
suspend fun createOrder(userId: Long, order: Order): Boolean {
    val client = router.route(userId)

    return client.inTransaction { tx ->
        tx.sql("INSERT INTO orders (user_id, order_id, amount) VALUES (:uid, :oid, :amt)")
            .bind("uid", userId)
            .bind("oid", order.id)
            .bind("amt", order.amount)
            .then()
            .awaitFirstOrNull()

        tx.sql("UPDATE users SET order_count = order_count + 1 WHERE user_id = :uid")
            .bind("uid", userId)
            .then()
            .awaitFirstOrNull()

        true
    }
}
```

> 위 코드는 하나의 샤드 내에서만 실행되는 로컬 트랜잭션 구조입니다.

---

#### ✅ 두 샤드에 걸친 처리: 보상 트랜잭션 패턴 예시

```kotlin
suspend fun transferBalance(senderId: Long, receiverId: Long, amount: Long): Boolean {
    val senderClient = router.route(senderId)
    val receiverClient = router.route(receiverId)

    try {
        senderClient.inTransaction { tx ->
            tx.sql("UPDATE accounts SET balance = balance - :amt WHERE user_id = :sid")
                .bind("amt", amount)
                .bind("sid", senderId)
                .then()
                .awaitFirstOrNull()
        }

        receiverClient.inTransaction { tx ->
            tx.sql("UPDATE accounts SET balance = balance + :amt WHERE user_id = :rid")
                .bind("amt", amount)
                .bind("rid", receiverId)
                .then()
                .awaitFirstOrNull()
        }

        return true
    } catch (e: Exception) {
        // 보상 로직 수행 (예: sender에게 금액 복원 시도)
        senderClient.sql("UPDATE accounts SET balance = balance + :amt WHERE user_id = :sid")
            .bind("amt", amount)
            .bind("sid", senderId)
            .then()
            .awaitFirstOrNull()
        return false
    }
}
```

> 분산 트랜잭션이 필요한 경우, XA보다는 이런 **Try-Fail-Reverse 방식의 보상 처리**가 선호됩니다.


샤딩되면 로컬 트랜잭션이 **샤드 단위로 분리**됩니다.  
즉, 하나의 서비스 내에서 두 샤드에 동시에 쓰기를 수행할 경우, 단일 트랜잭션으로 묶을 수 없습니다.

### 해결 방안

- **JTA / 2PC**: XA 트랜잭션 기반, 무겁고 느림
- **Saga 패턴**: 보상 트랜잭션. 실패 시 취소 로직 수행
- **TCC 패턴**: Try → Confirm/Cancel 단계로 처리

> 보통은 **샤드 간 트랜잭션이 필요 없도록 설계**하거나, **Saga로 정합성 보장**을 합니다.

---

## ✅ MSA와 샤딩의 관계

MSA의 핵심은 **서비스 단위의 책임 분리(Bounded Context)**입니다.  
따라서, 하나의 큰 DB를 쪼개서 샤딩하는 것이 아니라,  
**서비스마다 독립적인 DB를 가지게 하고**, 각 서비스의 특성에 따라 **샤딩 적용 여부를 독립적으로 판단**하는 것이 원칙입니다.

### 예시

| 서비스 | 데이터 특성 | 샤딩 여부 |
|--------|--------------|-----------|
| 주문 서비스 | 쓰기 부하 높음 | ✅ 샤딩 |
| 유저 서비스 | 읽기 위주 | ❌ 단일 노드로 충분 |
| 결제 서비스 | 강한 정합성 요구 | ⚠ 파티셔닝 또는 NoSQL 고려 |

---

## ✅ Vertical Slicing + DB 연동 전략

서비스를 도메인 단위로 세분화(vertical slice)하면,  
각 slice마다 **샤딩용 DB 클라이언트**, **단일 DB 클라이언트**를 **유연하게 선택**할 수 있습니다.

- `base-db-client` → 단일 DB용
- `sharded-db-client` → 샤딩용 라우팅 포함
- 공통 인터페이스 `UserRepository`를 사용하여 DI로 분기

이 방식은 샤딩이 필요한 서비스만 복잡한 구조를 갖도록 만들 수 있으며,  
샤딩이 필요 없는 서비스는 단순한 구조를 유지할 수 있습니다.

---

## ✅ MSA를 넘어서: Nano Service + BFF 구조

MSA가 일정 규모 이상 되면,
- 서비스 수 증가 → 운영 복잡도 폭발
- 데이터 조합 로직 분산 → UI API가 느려짐

이를 해결하기 위한 방안 중 하나는 *Nano Service + BFF(Backend for Frontend)** 구조입니다.

### 구조

```
[Nano Service 1]    [Nano Service 2]    ...
        \               |               /
                 [BFF Layer]
                     |
               [Web/App UI]
```

- 각 Nano Service는 원자적인 책임만 담당 (예: user-profile, user-preference)
- BFF가 모든 서비스 호출을 조합하여 최적화된 응답 제공
- 서비스별 샤딩 여부는 숨겨짐 → 조합 책임만 분리

---

## ✅ 최종 정리

- 샤딩은 무조건 도입해야 하는 기능이 아니라, **마지막 선택지**
- **MMM 구성 + 파티셔닝 + 튜닝** 등 가능한 모든 확장을 먼저 시도
- 샤딩 도입 시에는 **샤드 키, 라우팅 전략, 트랜잭션 고려, 운영 자동화** 등을 철저히 설계
- **MSA에서는 서비스 단위로 샤딩 여부를 판단**
- Vertical Slice 구조를 활용하면 **복잡도와 확장성을 분리 적용 가능**
- 복잡한 데이터 조합은 **BFF 또는 클라이언트로 이관**하여 단순화

---

## 🔗 참고 자료

### 📘 샤딩 일반

- [Sharding - Wikipedia](https://en.wikipedia.org/wiki/Shard_(database))

### 📗 Spring 관련

- [AbstractRoutingDataSource - Spring Framework](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/datasource/lookup/AbstractRoutingDataSource.html)
- [Transaction Management in Spring](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction)
- [Spring Coroutine Transaction (with R2DBC)](https://docs.spring.io/spring-data/r2dbc/docs/current/reference/html/#transactions)

### 📙 Kotlin Coroutine

- [Kotlin CoroutineContext](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)
- [ReactorContext vs CoroutineContext in Spring](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-reactive-context)

### 📕 샤딩 플랫폼 및 오픈소스

- [Citus - PostgreSQL Horizontal Scaling](https://www.citusdata.com/)
- [Vitess - Cloud Native Sharding](https://vitess.io/)
- [ProxySQL Query Rules](https://proxysql.com/documentation/)
- [ShardingSphere - Apache Project](https://shardingsphere.apache.org/)
