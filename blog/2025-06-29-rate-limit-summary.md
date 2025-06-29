---
slug: rate-limit 
title: Rate-Limit 종류 및 구현 방법 
authors: ryukato
date: 2025-06-29 12:14:00
tags: [Rate-limit, lua-script, redis]
---

<!-- truncate -->

## Rate Limit이란

### Rate Limit에 대한 설명
Rate Limit은 클라이언트가 일정 시간 동안 수행할 수 있는 요청 수를 제한하는 기법입니다. API 서버, 웹 애플리케이션, 캐시 시스템 등에서 **서버 자원 보호**, **공정한 서비스 제공**, **악의적 공격 방어(DDoS)** 등의 목적으로 활용됩니다.

### Rate Limit의 필요성
- **시스템 과부하 방지**: 갑작스러운 요청 폭주로 인한 서버 다운을 예방
- **서비스 품질 유지**: 공정한 자원 분배를 통해 전체 사용자에게 일관된 응답 품질 제공
- **비용 절감**: 클라우드 환경에서는 호출량에 따른 과금이 발생하는 경우가 많아 제한이 필요

### Client에서의 처리 방안
- 서버로부터 `429 Too Many Requests` 응답을 받을 경우, **재시도 딜레이(backoff)** 적용
- 헤더 정보(`Retry-After`)를 활용한 재요청 시점 조정
- 클라이언트 측 로컬 캐시로 서버 요청 자체를 최소화


## Rate Limit의 종류

### 1. Fixed Window
**특징**: 고정된 시간 단위(예: 1분) 동안의 요청 수 제한 
**단점**: 윈도우 경계에서 트래픽 버스트가 가능함

![fixed-window](/assets/redis/rate-limit-fixed-window.png)

```kotlin
val WINDOW_SIZE_MS = 60000L
val windowKey = "rate:user:${userId}:${System.currentTimeMillis() / WINDOW_SIZE_MS}"
val count = redisTemplate.opsForValue().increment(windowKey)
redisTemplate.expire(windowKey, Duration.ofMillis(WINDOW_SIZE_MS))
if (count != null && count > limit) {
    throw RateLimitExceededException("Too many requests")
}
```

### 2. Sliding Window Log
**특징**: 타임스탬프를 Redis Sorted Set에 저장하여 최근 윈도우 범위 내 요청 수를 검사 
**단점**: ZSET 명령어 조합으로 인해 원자성이 부족함

![sliding-window](/assets/redis/rate-limit-sliding-window.png)

```kotlin
val WINDOW_SIZE_MS = 60000L
val now = System.currentTimeMillis()
val key = "rate:user:$userId"
val windowStart = now - WINDOW_SIZE_MS
redisTemplate.opsForZSet().add(key, now.toString(), now.toDouble())
redisTemplate.opsForZSet().removeRangeByScore(key, 0.0, windowStart.toDouble())
val count = redisTemplate.opsForZSet().size(key) ?: 0
if (count > limit) throw RateLimitExceededException()
```

### 3. Token Bucket
**특징**: 일정 주기로 토큰을 생성하고 요청 시 토큰을 소모
**단점**: 갱신/소비 로직이 분리되어 있어 race condition 발생 가능

![token-bucket](/assets/redis/rate-limit-token-bucket.png)

```kotlin
val now = System.currentTimeMillis()
val bucketKey = "bucket:user:$userId"
val tokens = redisTemplate.opsForHash<String, String>().get(bucketKey, "tokens")?.toIntOrNull() ?: 10
if (tokens <= 0) throw RateLimitExceededException()
redisTemplate.opsForHash<String, String>().put(bucketKey, "tokens", (tokens - 1).toString())
```

### 4. Leaky Bucket
**특징**: 일정 속도로 요청을 처리 (누수 방식 큐)
**단점**: 현재 상태와 누수량 계산을 동시에 해야 하므로 다중 요청 시 충돌 가능

![leaky-bucket](/assets/redis/rate-limit-leaky-bucket.png)

```kotlin
val key = "leaky:user:$userId"
val now = System.currentTimeMillis()
val last = redisTemplate.opsForValue().get(key)?.toLongOrNull() ?: now
val leaked = ((now - last) / 1000).toInt()
val current = maxOf(0, redisTemplate.opsForValue().increment(key, -leaked.toLong()) ?: 0)
if (current >= capacity) throw RateLimitExceededException()
redisTemplate.opsForValue().increment(key)
```


## 개선점

### 위에서 제시된 코드를 원자적으로 개선

### Sliding Window Log - Lua Script
```lua
redis.call("ZADD", KEYS[1], ARGV[1], ARGV[1])
redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, ARGV[2])
local count = redis.call("ZCARD", KEYS[1])
if tonumber(count) > tonumber(ARGV[3]) then
  return 0
else
  return 1
end
```

### Token Bucket - Lua Script
```lua
local bucket = redis.call("HMGET", KEYS[1], "tokens", "last_refill")
local tokens = tonumber(bucket[1]) or tonumber(ARGV[3])
local last_refill = tonumber(bucket[2]) or tonumber(ARGV[1])
local now = tonumber(ARGV[1])

local refill = math.floor((now - last_refill) / 1000 * tonumber(ARGV[2]))
tokens = math.min(tokens + refill, tonumber(ARGV[3]))
last_refill = now

if tokens < tonumber(ARGV[4]) then
  return 0
else
  tokens = tokens - tonumber(ARGV[4])
  redis.call("HMSET", KEYS[1], "tokens", tokens, "last_refill", last_refill)
  redis.call("EXPIRE", KEYS[1], 60)
  return 1
end
```

### Leaky Bucket - Lua Script
```lua
local state = redis.call("HMGET", KEYS[1], "count", "last_leak")
local count = tonumber(state[1]) or 0
local last_leak = tonumber(state[2]) or tonumber(ARGV[1])
local now = tonumber(ARGV[1])

local leaked = math.floor((now - last_leak) / tonumber(ARGV[2]))
count = math.max(0, count - leaked)
last_leak = last_leak + leaked * tonumber(ARGV[2])

if count + 1 > tonumber(ARGV[3]) then
  return 0
else
  count = count + 1
  redis.call("HMSET", KEYS[1], "count", count, "last_leak", last_leak)
  redis.call("EXPIRE", KEYS[1], 60)
  return 1
end
```


## 마무리

Rate Limit은 시스템 안정성과 사용자 공정성을 동시에 만족시키기 위한 필수 전략입니다. 단순한 구현으로 시작하더라도 실제 서비스 환경에서는 **정밀한 제어와 동시성 문제 해결**이 중요해집니다. 

이번 글에서는 대표적인 4가지 알고리즘(Fixed, Sliding, Token, Leaky)의 원리와 구현, 그리고 Redis를 통한 Lua Script 기반의 **원자적 처리 방식**까지 살펴보았습니다.

적절한 전략을 선택하고, 필요에 따라 `WebFilter` 또는 API Gateway 레벨에서 적용한다면 여러분의 서비스는 더욱 강력하고 유연하게 확장될 수 있습니다. 🙂

