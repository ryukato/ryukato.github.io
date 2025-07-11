---
slug: saga_pattern 
title: About SAGA Pattern
authors: ryukato
date: 2025-07-11 10:24:00
tags: [SAGA-Pattern, 분산트랜잭션, 보상트랜잭션]
---

<!-- truncate -->

# 🌐 Saga 패턴 정리 (Spring Boot + Kafka 기반)

## ✅ Saga 패턴이란?

마이크로서비스 아키텍처(MSA) 환경에서 분산된 서비스 간의 트랜잭션 정합성을 보장하기 위해  
**각 서비스의 로컬 트랜잭션 + 보상 트랜잭션**을 결합하여  
**전체 트랜잭션의 일관성을 유지하는 패턴**이다.

---

## 📌 왜 필요한가?

- MSA에서는 서비스마다 DB가 분리되어 있어 **전통적인 분산 트랜잭션(2PC)**을 사용하기 어려움
- 외부 시스템 호출 등은 트랜잭션 롤백이 불가능
- 이 문제를 해결하기 위해, **각 단계가 실패하면 보상 트랜잭션을 수행**하는 구조 필요

---

## 🧩 구성 요소

| 구성 요소 | 설명 |
|------------|---------------------------------------------------|
| SagaInstance | 전체 Saga 트랜잭션의 상태를 관리하는 객체 |
| SagaStep     | 각 단계(로컬 트랜잭션)의 상태를 관리하는 객체 |
| SagaService  | 상태의 전이 및 정합성 판단을 수행하는 도메인 서비스 |
| SagaOrchestrator | 이벤트 기반으로 흐름을 전개하고 상태를 갱신하는 중앙 조정자 |
| Kafka        | 서비스 간 이벤트 전달을 위한 메시지 브로커 |
| EventPublisher/EventHandler | 도메인 이벤트를 발행하고 Kafka로 전달하는 중개 계층 |

---

## 🔁 전체 흐름 정리

```plaintext
[도메인 서비스] (예: PaymentService)
   → 로컬 트랜잭션 처리
   → 성공/실패 여부에 따라 도메인 이벤트 발행

[Spring EventPublisher]
   → 내부 이벤트 시스템으로 이벤트 전달

[이벤트 핸들러] (예: PaymentEventHandler)
   → 이벤트 수신
   → Kafka로 메시지 전송

[Kafka 브로커]
   → 이벤트 전파

[SagaOrchestrator] (예: OrderSagaOrchestrator)
   → Kafka 메시지 수신
   → Saga 상태 객체(SagaInstance/SagaStep) 갱신
   → 다음 단계로 명령 전파 or 보상 명령 실행

[SagaService]
   → Saga 상태 정합성 판단, 전이 처리, 완료 여부 판단
```

---

## 📦 Saga 상태 추적용 테이블 설계

### `saga_instance` 테이블

| 컬럼명 | 설명 |
|--------|------|
| `saga_id` | Saga 고유 ID (UUID) |
| `saga_type` | 어떤 Saga인지 (예: OrderSaga) |
| `status` | 전체 Saga 상태 (STARTED, IN_PROGRESS, COMPLETED, FAILED, COMPENSATED 등) |
| `created_at` / `updated_at` | 타임스탬프 |

### `saga_step` 테이블

| 컬럼명 | 설명 |
|--------|------|
| `step_id` | 고유 ID |
| `saga_id` | 상위 Saga 참조 |
| `step_name` | 단계명 (예: ProcessPayment) |
| `status` | 단계 상태 (PENDING, COMPLETED, FAILED, COMPENSATED) |
| `order_index` | 실행 순서 |
| `last_error` | 실패 사유 |
| `compensated_at` | 보상 완료 시간 |

---

## 🧱 코드 예제: 도메인 이벤트 → Kafka → Orchestrator

### PaymentService.java

```java
@Service
public class PaymentService {

    private final ApplicationEventPublisher publisher;

    public PaymentService(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void processPayment(String orderId, UUID sagaId) {
        boolean success = tryCharge(orderId);

        if (!success) {
            publisher.publishEvent(new PaymentFailedEvent(orderId, sagaId, "카드 한도 초과"));
        } else {
            publisher.publishEvent(new PaymentCompletedEvent(orderId, sagaId));
        }
    }
}
```

---

### PaymentEventHandler.java

```java
@Component
public class PaymentEventHandler {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @EventListener
    public void on(PaymentFailedEvent event) {
        kafkaTemplate.send("payment.failed", event);
    }

    @EventListener
    public void on(PaymentCompletedEvent event) {
        kafkaTemplate.send("payment.completed", event);
    }
}
```

---

### OrderSagaOrchestrator.java

```java
@Component
public class OrderSagaOrchestrator {

    private final SagaService sagaService;
    private final KafkaTemplate<String, Object> kafka;

    @KafkaListener(topics = "payment.failed")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        sagaService.markStepFailed(event.getSagaId(), "ProcessPayment", event.getReason());
        kafka.send("order.cancel", new CancelOrderCommand(event.getOrderId()));
    }

    @KafkaListener(topics = "payment.completed")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        sagaService.markStepCompleted(event.getSagaId(), "ProcessPayment");
        kafka.send("inventory.reserve", new ReserveInventoryCommand(event.getOrderId()));
    }
}
```

---

### SagaService.java

```java
public class SagaService {

    private final SagaRepository sagaRepository;

    public void markStepCompleted(UUID sagaId, String stepName) {
        SagaInstance saga = sagaRepository.findByIdWithSteps(sagaId);
        SagaStep step = saga.getStep(stepName);
        step.markCompleted();
        saga.updateStatusIfNeeded();
        sagaRepository.save(saga);
    }

    public void markStepFailed(UUID sagaId, String stepName, String reason) {
        SagaInstance saga = sagaRepository.findByIdWithSteps(sagaId);
        SagaStep step = saga.getStep(stepName);
        step.markFailed(reason);
        saga.markFailed();
        sagaRepository.save(saga);
    }
}
```

---

## 🔄 재시도 및 지연 처리 흐름

- 재처리가 필요한 경우 `PaymentService` 내부에서 자체 재시도 수행
- 최종적으로 **성공 or 실패가 확정되었을 때 이벤트 발행**
- SagaOrchestrator는 **해당 이벤트를 수신한 시점 기준으로 흐름 전개**

---

## ❓ Q&A 요약

### Q1. 결제 재시도가 오래 걸리면 Saga 흐름에 문제가 생기나요?

> **A:** 아니요. SagaOrchestrator는 **도착한 이벤트의 의미**만 기준으로 처리하기 때문에,  
> 재시도나 지연과 무관하게 흐름이 이어질 수 있습니다.

---

### Q2. 도메인 서비스가 Kafka를 직접 호출하지 않는 이유는?

> **A:** 메시징 책임은 인프라 계층에 위임하고, 도메인 로직은 **오직 이벤트 발행**만 하도록  
> **관심사를 분리**하면 테스트, 유지보수, 확장성이 좋아집니다.

---

### Q3. 보상 트랜잭션은 어떻게 실행되나요?

> **A:** 실패한 단계가 감지되면 SagaOrchestrator가 보상 명령을 Kafka로 전송하여  
> 해당 서비스가 보상 작업(예: 환불, 재고 복원)을 수행합니다.

---

## 🔐 Kafka 메시지 순서 보장과 Partition Key 설계

Kafka는 **같은 파티션에서는 메시지 순서를 보장**하지만, **토픽 전체에서는 보장하지 않음**.

### ✅ 왜 순서가 중요한가?

Saga 이벤트 흐름에서 다음과 같은 순서 문제가 생길 수 있음:

```plaintext
[PaymentCompletedEvent] → 재고 차감 진행
[PaymentFailedEvent]    → 주문 취소 및 환불

❌ 순서가 뒤바뀌면 취소된 주문에 재고가 차감되는 문제 발생
```

### ✅ 해결 방법: Kafka 메시지에 key 지정

Kafka는 메시지를 보낼 때 key를 기준으로 파티션을 선택함:

```java
kafkaTemplate.send("payment.failed", sagaId.toString(), event);
```

- **동일 sagaId를 key로 지정**하면 항상 동일 파티션으로 전송됨
- Kafka는 같은 파티션 내에서는 **절대적인 순서**를 보장함

### 🔑 추천 Partition Key

| 처리 단위 | 추천 키 |
|-----------|---------|
| 주문 기반 Saga | `orderId` |
| Saga 인스턴스 중심 | `sagaId` |
| 사용자 단위 트랜잭션 (주의) | `userId` |

> 대부분의 경우 `sagaId` 또는 `orderId`를 사용하는 것이 가장 안전함

### ⚠️ 주의사항

| 항목 | 설명 |
|------|------|
| 병렬성 감소 가능성 | 같은 key → 같은 파티션 → 같은 Consumer → 처리 병목 가능성 |
| skew(偏り) 주의 | 특정 ID가 과도하게 집중될 경우 일부 Consumer만 과부하될 수 있음 |
| DLQ 전파 시 파티션 전략 유지 | Dead Letter Queue도 동일한 key 전략을 따라야 순서 유지 가능 |

### ✅ KafkaListener와 순서 보장

```java
@KafkaListener(topics = "payment.result", concurrency = "3")
public void handlePaymentEvents(PaymentEvent event) {
    // 같은 파티션이면 같은 쓰레드에서 순서대로 처리됨
}
```

- Kafka는 **파티션 단위로 순차 처리**하므로, 동일 key를 가진 이벤트는 정확한 순서를 유지함

---

## ✅ 정리 요약

- Saga 패턴은 **분산 트랜잭션 대체 수단**으로서 상태 전이와 보상을 통해 일관성을 유지함
- 이벤트 기반 구조로 설계되며 **도메인 서비스 ↔ Kafka ↔ Orchestrator** 간의 연결이 핵심
- 상태 추적 테이블을 통해 중단 시 재시작, 모니터링, 실패 이력 분석이 가능
- 지연 처리/재시도도 구조적으로 유연하게 대응할 수 있음
---
