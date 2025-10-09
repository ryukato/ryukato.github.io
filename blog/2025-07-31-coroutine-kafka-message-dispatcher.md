---
slug: coroutine_kafka_message_dispatcher
title: Coroutine base Kafka message dispatcher
authors: ryukato
date: 2025-07-31 13:46:00
tags: [Kafka, coroutine, message-dispatcher]
---

# Kafka Coroutine 기반 Message Dispatcher 개선 단계별 코드 정리

이 문서는 Kafka 기반 비동기 메시지 처리 구조에서 Kotlin Coroutines를 이용한 Message Dispatcher의 개선 과정을 **단계별 코드 예제와 함께** 정리한 문서입니다.

---
<!-- truncate -->

## ✅ Step 1: 기본 Dispatcher

### 기능
- 채널을 통해 메시지를 받아 핸들러에 전달
- 예외 발생 시 로그만 출력

### 기본 구조
- Kafka Consumer → Coroutine Channel → Message Dispatcher → Message Handler

### 문제점
- 예외 발생 시 아무런 후속 조치 없음
- 메시지 반복 소비 또는 유실 가능성 있음

```kotlin
class MessageDispatcher(
    private val channel: ReceiveChannel<DomainMessage>,
    private val handler: MessageHandler
) {
    suspend fun start() {
        for (message in channel) {
            try {
                handler.handle(message)
            } catch (e: Exception) {
                println("❌ Error: ${e.message}")
            }
        }
    }
}
```

---

## ✅ Step 2: 예외 처리 정책 추가

### 기능
- `shouldRetry(e)`, `shouldStopConsuming(e)`을 통해 예외 분류
- 일시적 오류 vs 치명적 오류 구분 가능

```kotlin
interface ExceptionHandlingPolicy {
    fun shouldRetry(e: Throwable): Boolean
    fun shouldStopConsuming(e: Throwable): Boolean
}

class BasicPolicy : ExceptionHandlingPolicy {
    override fun shouldRetry(e: Throwable) = false
    override fun shouldStopConsuming(e: Throwable) = e is IllegalStateException
}
```

Dispatcher 내부:

```kotlin
if (policy.shouldStopConsuming(e)) {
    scope.cancel("Fatal", e)
}
```

---

## ✅ Step 3: RetryQueue / DLQ 도입

### 기능
- `IOException` 같은 일시적 예외는 재시도 대상으로 `RetryQueue`에 저장
- 치명적이지 않지만 재시도 대상도 아닌 예외는 `DeadLetterQueue`에 저장

```kotlin
interface RetryQueue {
    suspend fun enqueue(message: DomainMessage, reason: Throwable)
}
interface DeadLetterQueue {
    suspend fun publish(message: DomainMessage, reason: Throwable)
}
```

---

## ✅ Step 4: Retry 시 offset commit 추가

### 기능
- 재시도 대상 메시지는 retryQueue에 저장한 후 Kafka에 offset을 commit
- Kafka에 동일 메시지가 다시 소비되지 않도록 함

```kotlin
if (policy.shouldRetry(e)) {
    retryQueue.enqueue(message, e)
    commitOffset(message.offset)
}
```

---

## ✅ Step 5: DLQ 중복 방지 및 skip 처리

### 기능
- DLQ에 이미 저장된 메시지는 다시 기록하지 않음
- Dispatcher는 DLQ에 있는 메시지를 건너뛰고 바로 offset commit

```kotlin
class InMemoryDeadLetterQueue : DeadLetterQueue {
    private val recorded = ConcurrentHashMap.newKeySet<Long>()
    override suspend fun publish(message: DomainMessage, reason: Throwable) {
        if (recorded.add(message.offset)) {
            println("DLQ: offset=${message.offset}")
        }
    }

    override fun isRecorded(offset: Long): Boolean = recorded.contains(offset)
}
```

Dispatcher 내에서:

```kotlin
if (deadLetterQueue.isRecorded(message.offset)) {
    commitOffset(message.offset)
    continue
}
```

---

## ✅ Step 6: 최종 통합 예외 처리 구조

Dispatcher 내부 launch 블록 내 예외 처리 예시:

```kotlin
launch {
    val result = retryHandler.withRetry(message) {
        handler.handle(message)
    }

    result.onSuccess {
        commitOffset(message.offset)
    }.onFailure { e ->
        when {
            policy.shouldRetry(e) -> {
                retryQueue.enqueue(message, e)
                commitOffset(message.offset)
            }
            policy.shouldStopConsuming(e) -> {
                scope.cancel("Stopping consumer due to fatal error", e)
            }
            else -> {
                deadLetterQueue.publish(message, e)
                commitOffset(message.offset)
            }
        }
    }
}
```

---

## 📦 Dispatcher 구조 요약

- `Coroutine Channel`을 통해 Kafka 메시지 수신
- 예외 정책 기반 분기 처리 (`shouldRetry`, `shouldStopConsuming`)
- DLQ 메시지 건너뛰기 및 중복 기록 방지
- 재시도 메시지와 DLQ 메시지에 대해 offset commit 명확화

---

## 📌 메시지 처리 흐름 요약

1. **정상 처리 성공** → `commitOffset`
2. **일시적 예외 (재시도 가능)** → `RetryQueue.enqueue` + `commitOffset`
3. **중단 대상 예외** → `scope.cancel(...)`
4. **기타 실패 (복구 불가)** → `DeadLetterQueue.publish` + `commitOffset`

---

## 🎯 설계 원칙 요약

- 메시지 중복 소비 방지 (at-least-once 대응)
- Kafka 오프셋 제어를 통한 흐름 안정성 확보
- 비동기 백프레셔 제어 (Semaphore)
- Retry / DLQ 정책 기반 확장 가능성 확보

---

## 🔄 향후 확장 가능

- DLQ, RetryQueue → Kafka Topic 연동
- RetryHandler → 지수 백오프 전략 확장
- Micrometer, Prometheus 연동으로 모니터링 강화
- Spring Integration/WebFlux와의 통합

---

## 💡 사용 시 필요한 의존성 예시

```kotlin
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core")
    testImplementation("org.junit.jupiter:junit-jupiter")
}
```

## 전체 코드
```kotlin title=DomainMessage
data class DomainMessage(
    val key: String,
    val value: String,
    val offset: Long
)
```

```kotlin title=MessageHandler
interface MessageHandler {
    suspend fun handle(message: DomainMessage)
}
```

```kotlin title=ExceptionHandlingPolicy
interface ExceptionHandlingPolicy {
    fun shouldRetry(e: Throwable): Boolean
    fun shouldStopConsuming(e: Throwable): Boolean
}

```

```kotlin title=SeverityBasedPolicy
class SeverityBasedPolicy : ExceptionHandlingPolicy {
    override fun shouldRetry(e: Throwable) =
        e is IOException || e is TimeoutCancellationException

    override fun shouldStopConsuming(e: Throwable) =
        e is IllegalStateException || e is OutOfMemoryError
}
```

```kotlin title=RetryQueue
interface RetryQueue {
    suspend fun enqueue(message: DomainMessage, reason: Throwable)
}
```

```kotlin title=InMemoryRetryQueue
class InMemoryRetryQueue : RetryQueue {
    private val retried = mutableListOf<Pair<DomainMessage, Throwable>>()
    override suspend fun enqueue(message: DomainMessage, reason: Throwable) {
        println("🔁 RETRY: offset=${message.offset}, reason=${reason.message}")
        retried.add(message to reason)
    }
}

```

```kotlin title=DeadLetterQueue
interface DeadLetterQueue {
    suspend fun publish(message: DomainMessage, reason: Throwable)
    fun isRecorded(offset: Long): Boolean
}
```

```kotlin title=InMemoryDeadLetterQueue

import java.util.concurrent.ConcurrentHashMap

class InMemoryDeadLetterQueue : DeadLetterQueue {
    private val deadSet = ConcurrentHashMap.newKeySet<Long>()
    private val messages = mutableListOf<Pair<DomainMessage, Throwable>>()

    override suspend fun publish(message: DomainMessage, reason: Throwable) {
        if (deadSet.add(message.offset)) {
            println("🔴 DLQ: offset=${message.offset}, reason=${reason.message}")
            messages.add(message to reason)
        } else {
           println("Ignore adding since already in: offset=${message.offset}")
        }
    }

    override fun isRecorded(offset: Long): Boolean = deadSet.contains(offset)
}
```

```kotlin title=RetryHandler
interface RetryHandler {
    suspend fun <T> withRetry(
        message: DomainMessage,
        block: suspend () -> T
    ): Result<T>
}
```

```kotlin title=FixedDelayIntervalRetryHandler
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.delay

class FixedDelayIntervalRetryHandler(
    private val maxAttempts: Int,
    private val delayMillis: Long
) : RetryHandler {
    private val retryCounts = ConcurrentHashMap<String, Int>()

    override suspend fun <T> withRetry(
        message: DomainMessage,
        block: suspend () -> T
    ): Result<T> {
        val key = message.offset.toString()
        val attempts = retryCounts.getOrDefault(key, 0)

        return try {
            val result = block()
            retryCounts.remove(key)
            Result.success(result)
        } catch (e: Throwable) {
            if (attempts + 1 >= maxAttempts) {
                retryCounts.remove(key)
                Result.failure(e)
            } else {
                retryCounts[key] = attempts + 1
                delay(delayMillis)
                Result.failure(e)
            }
        }
    }
}
```

```kotlin title=CoroutineMessageDispatcher
interface CoroutineMessageDispatcher {
    suspend fun start(scope: CoroutineScope)
}
```

```kotlin title=DefaultCoroutineMessageDispatcher
class DefaultCoroutineMessageDispatcher(
    private val channel: ReceiveChannel<DomainMessage>,
    private val handlers: List<MessageHandler>,
    private val policy: ExceptionHandlingPolicy,
    private val commitOffset: suspend (Long) -> Unit,
    private val retryHandler: RetryHandler,
    private val deadLetterQueue: DeadLetterQueue,
    private val retryQueue: RetryQueue
) : CoroutineMessageDispatcher {
    private val lastCommittedOffset = AtomicLong(-1L)

    override suspend fun start(scope: CoroutineScope) {
        val semaphore = Semaphore(handlers.size)

        for (handler in handlers) {
            scope.launch {
                for (message in channel) {
                    if (deadLetterQueue.isRecorded(message.offset)) {
                        println("Skip DLQ’d message at offset=${message.offset}")
                        commitOffset(message.offset)
                        lastCommittedOffset.set(message.offset)
                        continue
                    }

                    semaphore.acquire()
                    launch {
                        try {
                            val result = retryHandler.withRetry(message) {
                                println("Handling message: $message")
                                handler.handle(message)
                            }

                            result.onSuccess {
                                commitOffset(message.offset)
                                lastCommittedOffset.set(message.offset)
                            }.onFailure { e ->
                                when {
                                    policy.shouldRetry(e) -> {
                                        retryQueue.enqueue(message, e)
                                        commitOffset(message.offset)
                                        lastCommittedOffset.set(message.offset)
                                    }

                                    policy.shouldStopConsuming(e) -> {
                                        println("Fatal error - stop consuming")
                                        scope.cancel("Fatal exception. Stopping dispatcher.", e)
                                    }

                                    else -> {
                                        deadLetterQueue.publish(message, e)
                                        commitOffset(message.offset)
                                        lastCommittedOffset.set(message.offset)
                                    }
                                }
                            }
                        } catch (e: Throwable) {
                            println("Dispatcher error: ${e.message}")
                            scope.cancel("Dispatcher failed", e)
                        } finally {
                            semaphore.release()
                        }
                    }
                }
            }
        }
    }
}
```

```kotlin title=MessageDispatcherTest
import java.io.IOException
import kotlin.time.Duration.Companion.seconds
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test

class MessageDispatcherTest {
    @Test
    fun `dispatcher processes messages and handles exceptions`() = runBlocking {
        val channel = Channel<DomainMessage>(capacity = 100)

        val dispatcher = DefaultCoroutineMessageDispatcher(
            channel = channel,
            handlers = listOf(object : MessageHandler {
                override suspend fun handle(message: DomainMessage) {
                    when {
                        message.offset % 5 == 0L -> throw IOException("Temporary error")
                        message.offset % 6 == 0L -> throw RuntimeException("To dead-letter-queue")
                        message.offset % 7 == 0L -> throw IllegalStateException("Fatal error")
                        else -> println("✅ handled offset=${message.offset}")
                    }
                }
            }),
            policy = SeverityBasedPolicy(),
            commitOffset = { offset -> println("☑️ commit offset=$offset") },
            retryHandler = FixedDelayIntervalRetryHandler(3, 100),
            deadLetterQueue = InMemoryDeadLetterQueue(),
            retryQueue = InMemoryRetryQueue()
        )

        val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

        scope.launch {
            var offset = 0L
            while (isActive) {
                delay(10)
                channel.send(DomainMessage("key-$offset", "value-$offset", offset++))
            }
        }

        dispatcher.start(scope)

        delay(5.seconds)
        scope.cancel()
    }
}
```

## 참고 자료

- [Apache Kafka Consumer Configuration](https://kafka.apache.org/documentation/#consumerconfigs)
- [Understanding Kafka Transactions](https://www.confluent.io/blog/transactions-apache-kafka/)
- [Kotlin Coroutine Channels](https://kotlinlang.org/docs/channels.html)
- [Enterprise Integration Patterns - Message Dispatcher](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageDispatcher.html)
- [Retry Design with Resilience4j](https://resilience4j.readme.io/docs/retry)