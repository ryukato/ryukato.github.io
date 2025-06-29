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

### Sliding Window Log - Lua Script and some codes
#### Lua-Script
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
#### Kotlin code for lua-script

```kotlin
val now = System.currentTimeMillis()
val windowStart = now - WINDOW_SIZE_MS
val script = DefaultRedisScript<Int>()
script.scriptText = loadLuaScriptFromClasspath("scripts/sliding_window.lua")
script.resultType = Int::class.java

val allowed = redisTemplate.execute(
    script,
    listOf("rate:user:$userId"),
    now.toString(),
    windowStart.toString(),
    limit.toString()
)

if (allowed == 0) throw RateLimitExceededException()
```


### Token Bucket - Lua Script and some codes
#### Lua-Script

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
#### Kotlin code for lua-script

```kotlin
val now = System.currentTimeMillis()
val script = DefaultRedisScript<Int>()
script.scriptText = loadLuaScriptFromClasspath("scripts/token_bucket.lua")
script.resultType = Int::class.java

val allowed = redisTemplate.execute(
    script,
    listOf("bucket:user:$userId"),
    now.toString(),
    "10",      // refill rate
    "100",     // capacity
    "1"        // requested tokens
)

if (allowed == 0) throw RateLimitExceededException()
```

### Leaky Bucket - Lua Script
#### Lua-Script
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
#### Kotlin code for lua-script

```kotlin
val now = System.currentTimeMillis()
val script = DefaultRedisScript<Int>()
script.scriptText = loadLuaScriptFromClasspath("scripts/leaky_bucket.lua")
script.resultType = Int::class.java

val allowed = redisTemplate.execute(
    script,
    listOf("leaky:user:$userId"),
    now.toString(),
    "1000",  // leak rate (ms per request)
    "10"      // capacity
)

if (allowed == 0) throw RateLimitExceededException()
```

### Helper codes
#### Loading lua-script using class-loader
```kotlin
fun loadLuaScriptFromClasspath(path: String): String {
    val classLoader = Thread.currentThread().contextClassLoader
    val inputStream = classLoader.getResourceAsStream(path)
        ?: throw IllegalArgumentException("Script not found: $path")
    return inputStream.bufferedReader().use { it.readText() }
}
```

#### Load scripts on Redis
```shell
# 등록
SCRIPT LOAD "$(cat scripts/token_bucket.lua)"

# 반환된 SHA 값 사용
EVALSHA "<SHA1>" 1 bucket:user:123 <now> 10 100 1

```

## Applying using WebFilter
### How it works
* WebFilter: 모든 요청을 가로채어 rate-limit 검사
* Lua Script: Redis에서 원자적으로 rate-limit 로직 수행
* RedisTemplate: 스크립트 실행 및 결과 확인
* 적용 대상: 전체 요청 또는 특정 URL/헤더/사용자에 따라 유연하게 적용 가능

### How it results
* 사용자별 X-USER-ID 기준으로 초당 10개, 최대 100개의 토큰을 부여
* 초과 시 429 Too Many Requests 응답
* 정밀한 동시성 제어와 성능을 Lua + Redis로 처리

### Example
```kotlin
@Component
class RateLimitWebFilter(
    private val redisTemplate: StringRedisTemplate
) : WebFilter {

    private val scriptSha: String

    init { // fail-fast from instancing when application is booting-up
        val scriptText = loadLuaScriptFromClasspath("scripts/token_bucket.lua")
        val sha = redisTemplate.execute(RedisCallback { connection ->
            connection.serverCommands().scriptLoad(scriptText.toByteArray())
        })?.toHexString()

        this.scriptSha = sha ?: throw IllegalStateException("Failed to register Lua script with Redis")
    }

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val request = exchange.request
        val userId = request.headers.getFirst("X-USER-ID") ?: "anonymous"
        val now = System.currentTimeMillis()

        val passed = redisTemplate.execute(RedisCallback { connection ->
            connection.evalSha(
                scriptSha,
                ReturnType.INTEGER,
                1,
                "bucket:user:$userId".toByteArray(),
                now.toString().toByteArray(),
                "10".toByteArray(),   // refill rate (tokens/sec)
                "100".toByteArray(),  // capacity
                "1".toByteArray()     // tokens required
            )
        }) as? Long

        return if (passed == 1L) {
            chain.filter(exchange)
        } else {
            exchange.response.statusCode = HttpStatus.TOO_MANY_REQUESTS
            exchange.response.setComplete()
        }
    }

    private fun loadLuaScriptFromClasspath(path: String): String {
        val stream = Thread.currentThread().contextClassLoader.getResourceAsStream(path)
            ?: throw IllegalArgumentException("Lua script not found: $path")
        return stream.bufferedReader().use { it.readText() }
    }

    private fun ByteArray.toHexString(): String =
        joinToString("") { "%02x".format(it) }
}
```
> Note
>
> 위의 예제는 인입되는 모든 요청에 대해 rate-limit을 적용합니다. 상황에 따라 적용 대상을 분리하여 적용할 수 있는데요. 그런 경우,request의 header, method 그리고 path등을 이용하여 처리할 수 있습니다.

## 마무리

Rate Limit은 시스템 안정성과 사용자 공정성을 동시에 만족시키기 위한 필수 전략입니다. 단순한 구현으로 시작하더라도 실제 서비스 환경에서는 **정밀한 제어와 동시성 문제 해결**이 중요해집니다. 

이번 글에서는 대표적인 4가지 알고리즘(Fixed, Sliding, Token, Leaky)의 원리와 구현, 그리고 Redis를 통한 Lua Script 기반의 **원자적 처리 방식**까지 살펴보았습니다.

적절한 전략을 선택하고, 필요에 따라 `WebFilter` 또는 API Gateway 레벨에서 적용한다면 여러분의 서비스는 더욱 강력하고 유연하게 확장될 수 있습니다. 🙂

