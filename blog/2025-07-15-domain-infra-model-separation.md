---
slug: domain_infra_model_separation 
title: Domain & Infra model separation
authors: ryukato
date: 2025-07-15 10:21:00
tags: [port_adapter, domain_model, infra_model]
---

<!-- truncate -->

# 도메인 모델과 인프라 모델 분리 과정 정리

이 문서는 `TestDomainItem`을 예시로 하여, 도메인 모델과 MongoDB용 인프라 모델을 분리하는 과정을 단계별로 정리한 것입니다.  
각 단계에서는 선택된 구조의 장단점 및 고려할 트레이드오프도 함께 포함되어 있습니다.

---

## ✅ Step 1: 도메인 모델에 MongoDB 어노테이션 직접 사용

```kotlin
import org.springframework.data.annotation.Id
import org.bson.types.ObjectId

data class TestDomainItem(
    @Id val id: ObjectId? = null,
    val itemSequence: String,
    val itemName: String
)
```

### 장점
- 가장 간단하고 빠르게 개발 가능
- Spring Data MongoDB의 자동 매핑 지원

### 단점 및 고려사항
- 도메인 모델이 `spring-data-mongodb`, `bson` 등에 직접 의존
- 테스트, 비즈니스 로직에서 순수 모델로 보기 어려움
- 향후 DB 마이그레이션(R2DBC, JPA 등) 시 강하게 coupling 됨

---

## ✅ Step 2: `@Id` 제거 후 `_id` 필드만 선언

```kotlin
data class TestDomainItem(
    val _id: ObjectId? = null,
    val itemSequence: String,
    val itemName: String
)
```

### 장점
- 어노테이션 제거로 약간의 순수성 향상
- MongoDB `_id` 필드에 자동 매핑됨

### 단점 및 고려사항
- `_id`는 여전히 DB 특화된 필드명
- 도메인 모델이 Mongo 구조에 간접적으로 종속
- 다른 DB 타입으로 전환 시 더러운 필드로 작용

---

## ✅ Step 3: 도메인 모델과 Mongo 모델 분리

### 도메인 모델

```kotlin
data class TestDomainItem(
    val itemSequence: String,
    val itemName: String
)
```

### 인프라 모델

```kotlin
@Document(collection = "transformed_items")
data class TestDomainItemDocument(
    @Id val id: ObjectId? = null,
    val itemSequence: String,
    val itemName: String
)
```

### 장점
- 도메인 모델 완전한 순수성 확보
- Mongo 의존성은 인프라 계층에만 존재
- 변환 계층 (`toDomain`, `fromDomain`)으로 책임 명확화

### 단점 및 고려사항
- 필드가 많을 경우 변환 코드 반복 발생
- 도메인 , Infra 간 매핑 테스트 필요

---

## ✅ Step 4: Infra 모델을 nested 구조로 단순화

```kotlin
@Document(collection = "transformed_items")
data class MongoTestDomainItem(
    @Id val id: ObjectId? = null,
    val item: TestDomainItem
)
```

### 장점
- Infra ↔ 도메인 간 변환 코드가 단순해짐
- 도메인 객체 자체를 포함시켜 중복 제거

### 단점 및 고려사항
- 저장 구조가 nested document 형태 (e.g., `{ item: {...}, _id: ... }`)
- Mongo 쿼리 작성 시 `"item.itemSequence"` 처럼 경로가 깊어짐
- index 작성 등에서 추가 경로 고려 필요

---

## ✅ 최종 권장 전략

- **도메인 모델은 순수하게 유지**
- **Mongo 저장용 모델은 별도로 두고, `@Document`, `@Id`는 infra 쪽에만**
- **간단한 변환은 extension function 또는 mapper로 구현**
- **Infra → 도메인 매핑은 읽기/쓰기 테스트로 보장**