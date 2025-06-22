---
slug: circuit-breaker-with-redis 
title: CircuitBreaker Using Redis 
authors: ryukato
date: 2025-06-22 15:01:00
tags: [CircuitBreaker, Redis, Redisson]
---

<!-- truncate -->
# Redis 기반 분산 Circuit Breaker 설계 및 구현

현대 분산 시스템에서 외부 API 호출이나 타 시스템 연동이 빈번해지면서, 장애 전파를 방지하기 위한 **Circuit Breaker** 패턴의 중요성이 점점 커지고 있다. 특히 여러 인스턴스가 동시에 운영되는 환경에서는 **분산 상태 공유**가 가능한 구조가 필수다. 본 포스팅에서는 **Redis 기반 분산 Circuit Breaker 구현**을 중심으로, Kotlin + Coroutine 환경에서 안전하게 사용하는 방식을 소개한다.

---

## 📌 Circuit Breaker란?

Circuit Breaker는 시스템에서 반복적인 실패가 발생할 경우, 일정 시간 동안 요청을 차단하여 추가적인 리소스 낭비 및 장애 확산을 막기 위한 보호 패턴이다.

### 상태 전이

* **CLOSED**: 정상 상태, 모든 요청 허용
* **OPEN**: 차단 상태, 모든 요청 거절 (TTL 후 상태 만료)
* **HALF\_OPEN**: 일부 요청 허용 → 복구 테스트 중

```plaintext
CLOSED ──(연속 실패)──▶ OPEN ──(TTL 만료)──▶ HALF_OPEN ──(성공)──▶ CLOSED
                                                └────(실패)────┘
```

---

## ✅ Redis 기반 구현

### Redis 구조

| Redis 키                | 설명                                         |
| ---------------------- | ------------------------------------------ |
| `cb:state` (RMapCache) | key별 상태 (`CLOSED`, `OPEN`, `HALF_OPEN`) 저장 |
| `cb:{key}:failures`    | 실패 횟수 저장용 (RAtomicLong)                    |
| `cb:{key}:success`     | HALF\_OPEN 성공 횟수 저장용 (RAtomicLong)         |

### 기본 알고리즘

* 실패 횟수가 임계치를 넘으면 `OPEN` 상태로 전이, TTL 설정
* TTL 만료 후 상태 키가 사라지면 `HALF_OPEN`으로 간주
* `HALF_OPEN` 상태에서 일부 요청 허용 후 성공 누적 → `CLOSED` 복귀
* `HALF_OPEN`에서 다시 실패 시 → 즉시 `OPEN`

---

## 🔧 Kotlin Coroutine + Redisson 통합 구현

Redisson은 비동기 API (`.tryLockAsync()`, `.incrementAndGetAsync()`)를 제공하며, 이를 Coroutine에서 `await()`으로 사용하면 안전한 비동기 처리가 가능하다.

```kotlin
suspend fun <T> execute(key: String, supplier: suspend () -> T): T {
    if (!isCallPermitted(key)) throw CircuitOpenException("Circuit is OPEN")

    return try {
        val result = supplier()
        onSuccess(key)
        result
    } catch (ex: Exception) {
        if (classifier.shouldTrip(ex)) {
            onFailure(key)
        }
        throw ex
    }
}
```

> 🔍 상태 관리는 RMapCache, 실패/성공 카운팅은 RAtomicLong 사용

---

## 🧠 예외 분류 전략: 도메인 침투 방지

도메인 예외에 기술 정책 인터페이스(`ShouldTripCircuitBreaker`)를 붙이는 대신, 예외 분류 책임을 외부로 분리한다.

```kotlin
interface ExceptionClassifier {
    fun shouldTrip(ex: Throwable): Boolean
}
```

```kotlin
class DefaultExceptionClassifier : ExceptionClassifier {
    override fun shouldTrip(ex: Throwable): Boolean = when (ex) {
        is ClientErrorException -> false
        is TimeoutException, is UpstreamServerException -> true
        else -> true
    }
}
```

> 이 방식은 도메인의 순수성을 지키면서도 유연한 정책 분리를 가능하게 한다.

---

## ⚠️ 구현 시 주의 사항

* `HALF_OPEN` 상태로의 전이는 `OPEN` 상태의 TTL 만료로 간주하거나, 명시적으로 관리
* `onSuccess`는 `HALF_OPEN`일 때만 상태 전이에 관여 (CLOSED는 무시)
* `onFailure`는 트립 대상 예외만 처리 (클라이언트 오류 제외)
* `await()`를 활용한 Redisson 비동기 API 사용으로 Coroutine thread-safe 보장

---

## ✅ 마무리

Redis 기반의 Circuit Breaker는 단일 인스턴스 구조를 넘어서 **분산 환경에서도 상태를 공유하며 보호 로직을 일관되게 적용**할 수 있게 해준다.
Redisson + Kotlin Coroutine을 조합하면 **비동기 환경에서 안정적인 구현**이 가능하며, 예외 분류기를 통해 **도메인의 책임과 기술 정책을 깔끔하게 분리**할 수 있다.

향후에는 상태 모니터링, Metrics 노출, Retry 조합 등을 포함한 확장 전략도 함께 고려할 수 있다.

구현 샘플
* https://github.com/ryukato/practice/commit/9d6260cd5be2eab1cdee5b2862da7eea1996517e
