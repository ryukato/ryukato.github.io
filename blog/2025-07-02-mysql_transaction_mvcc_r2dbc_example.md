---
slug: mysql_transaction_mvcc 
title: MySQL Transaction 정리 (+ 예제) 
authors: ryukato
date: 2025-07-02 18:34:00
tags: [MySQL, Transaction-isolation]
---


# MySQL 트랜잭션 격리 수준과 R2DBC 실전 예제

## 🔒 트랜잭션 격리 수준이란?

트랜잭션 간의 **동시성 처리 중 정합성 문제를 얼마나 허용할 것인지**를 정하는 기준입니다.

<!-- truncate -->

### 📌 발생 가능한 문제

| 문제 | 설명 |
|------|------|
| **Dirty Read** | 아직 커밋되지 않은 데이터를 읽는 경우 |
| **Non-Repeatable Read** | 같은 데이터를 반복해서 읽을 때 값이 바뀌는 경우 |
| **Phantom Read** | 같은 조건으로 조회했는데 행 개수가 달라지는 경우 |

---

## 📊 트랜잭션 격리 수준 4단계 비교

| 수준 | Dirty Read | Non-Repeatable Read | Phantom Read | 특징 |
|------|------------|----------------------|---------------|------|
| **READ UNCOMMITTED** | 허용 | 허용 | 허용 | 성능은 좋지만 정합성 낮음 |
| **READ COMMITTED** | ❌ | 허용 | 허용 | 대부분의 DBMS 기본값 |
| **REPEATABLE READ** | ❌ | ❌ | 허용 | MySQL 기본값, 스냅샷 일관성 |
| **SERIALIZABLE** | ❌ | ❌ | ❌ | 가장 강력하지만 성능 저하 |

---

## 🔄 MVCC란?

**Multi-Version Concurrency Control**  
→ 트랜잭션마다 **스냅샷 버전**을 읽게 하여 **락 없이도 일관성 유지** 가능

- MySQL InnoDB, PostgreSQL 등에서 기본적으로 활성화되어 있음
- MVCC는 `REPEATABLE READ` 이상에서 스냅샷 기반 읽기를 보장

---

## 🔐 FOR UPDATE란?

트랜잭션 안에서 `SELECT ... FOR UPDATE`를 실행하면  
해당 row에 **배타적 락(X-Lock)**을 걸어 다른 트랜잭션의 수정을 막습니다.

### 사용 예시
```sql
BEGIN;
SELECT stock FROM product WHERE id = 1 FOR UPDATE;
UPDATE product SET stock = stock - 1 WHERE id = 1;
COMMIT;
```

---

## ✅ R2DBC + MySQL 실전 예제

### 1. MySQL 격리 수준 확인
```sql
-- 세션 격리 수준 확인
SELECT @@tx_isolation;
-- 설정 (REPEATABLE READ)
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

### 2. 테이블 정의
```sql
CREATE TABLE product (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  stock INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

### 3. Kotlin Repository (FOR UPDATE 사용)
```kotlin
@Repository
class ProductRepositoryImpl(private val client: DatabaseClient) : ProductRepository {
    override fun findWithLock(productId: Long): Mono<Product> {
        return client.sql("SELECT * FROM product WHERE id = :id FOR UPDATE")
            .bind("id", productId)
            .map { row ->
                Product(
                    id = row.get("id", Long::class.java)!!,
                    name = row.get("name", String::class.java)!!,
                    stock = row.get("stock", Int::class.java)!!
                )
            }.one()
    }

    override fun updateStock(productId: Long, newStock: Int): Mono<Void> {
        return client.sql("UPDATE product SET stock = :stock WHERE id = :id")
            .bind("stock", newStock)
            .bind("id", productId)
            .then()
    }
}
```

### 4. 트랜잭션 처리 with `TransactionalOperator`
```kotlin
@Service
class ProductService(
    private val productRepository: ProductRepository,
    private val tx: TransactionalOperator,
) {
    fun purchase(productId: Long): Mono<Void> {
        return tx.execute {
            productRepository.findWithLock(productId)
                .flatMap { product ->
                    if (product.stock <= 0) {
                        return@flatMap Mono.error(IllegalStateException("Sold out"))
                    }
                    productRepository.updateStock(product.id, product.stock - 1)
                }
        }.then()
    }
}
```

### 5. 트랜잭션 격리 수준 명시 (선택)
```kotlin
@Bean
fun transactionalOperator(connectionFactory: ConnectionFactory): TransactionalOperator {
    val txDefinition = DefaultTransactionDefinition().apply {
        isolationLevel = IsolationLevel.REPEATABLE_READ
    }
    return TransactionalOperator.create(TransactionManager(connectionFactory), txDefinition)
}
```

---

## ✅ 정리

| 항목 | 내용 |
|------|------|
| 격리 수준 | `REPEATABLE READ` (기본) |
| 일관성 처리 | MVCC 기반 스냅샷 읽기 |
| 충돌 방지 | `FOR UPDATE`로 배타적 락 확보 |
| 기술 조합 | MySQL + Spring WebFlux + R2DBC |
