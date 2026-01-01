---
slug: application-exception-design
title: API 애플리케이션의 예외 설계 — Server/Client, ErrorCode, Resolver 기반 구조
authors: ryukato
date: 2025-11-29 12:10:00
tags: [backend, architecture, exception-handling, api-design, errorcode, domain-driven-design]
---

# Application의 예외 설계에 대한 생각

API 애플리케이션을 개발하다 보면, 예외 설계는 항상 뒤로 미루기 쉬운 주제다.  
하지만 한 번 잘못 설계되기 시작하면, 이후 기능이 늘어날수록 예외 구조는 걷잡을 수 없게 복잡해지고,  
결국 API의 응답 구조 · 로깅 · 모니터링까지 모두 영향을 받게 된다.

이 글에서는 먼저 _자주 범하는 예외 설계 패턴_을 살펴보고,  
그 다음에 **Server / Client 축과 ErrorCode enum, Resolver, Factory Method**를 활용한  
좀 더 견고한 예외 설계 방식을 정리해본다.

<!-- truncate -->

---

## 자주 범하는 예외 구조

실제 코드베이스에서 자주 볼 수 있는 구조는 대략 이런 모습이다.

```java
// 모든 API 예외의 상위라고 주장하는 추상 클래스
public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }
}

// Auth 관련 예외
public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}

// User 관련 예외
public class UserException extends RuntimeException {
    public UserException(String message) {
        super(message);
    }
}
```

처음에는 나쁘지 않아 보인다.  
하지만 실제 구현이 진행되면 이런 식으로 세분화되기 쉽다.

```java
public class InvalidLoginAccountException extends AuthException {
    public InvalidLoginAccountException() {
        super("invalid login account");
    }
}

public class DeactivatedUserException extends AuthException {
    public DeactivatedUserException() {
        super("deactivated user");
    }
}

public class NoUserException extends UserException {
    public NoUserException(Long userId) {
        super("no user. id=" + userId);
    }
}
```

### 1) 예외가 도메인별로만 분기되어 있다

`AuthException`, `UserException`, `OrderException`처럼  
“어느 도메인에서 발생했는지”에 따라 예외를 나누는 구조는 한눈에 보기에는 이해하기 쉽다.  

하지만 **HTTP 응답** 관점에서는 곧 문제가 드러난다.

- 어떤 `AuthException`은 401(Unauthorized)로 내려가야 하고  
- 어떤 `AuthException`은 403(Forbidden)일 수도 있고  
- `UserException` 중 어떤 것은 400(Bad Request)이고  
- 어떤 것은 404(Not Found)일 수 있다.

즉, **도메인별 예외 구조만으로는 HTTP Status를 일관성 있게 매핑하기 어렵다.**  
글로벌 예외 핸들러에는 `instanceof`와 `if/else`가 쌓이기 시작한다.

### 2) 예외가 너무 세분화되어 관리가 어렵다

상황별로 클래스를 나누다 보면:

- `InvalidLoginAccountException`
- `DeactivatedUserException`
- `InvalidPhoneNumberException`
- `UserNotActiveException`
- `UserAlreadyRegisteredException`
- ...

예외 클래스 개수가 금방 수십~수백 개가 되어버린다.

문제는:

- **전반적인 일관성 상실** (메시지/필드/로깅 정책이 제각각)
- 실제 어떤 예외가 있는지 한눈에 파악하기 어려움
- 신규 팀원이 진입했을 때 학습 비용 증가
- 중복/의미가 비슷한 예외가 생기기 시작함

### 3) 반대로 예외가 지나치게 추상적이다

다른 극단으로, 모든 예외를 다음과 같이 처리하는 경우도 있다.

```java
public class ApiException extends RuntimeException {

    private final int httpStatus;

    public ApiException(String message, int httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
```

여기에 모든 예외를 몰아 넣으면:

- 이게 클라이언트의 잘못인지, 서버의 잘못인지 구분하기 어렵고
- ErrorCode의 체계도 잡기 어려우며
- 도메인 레이어에서 `httpStatus`를 직접 알고 사용하는 구조가 된다.

결국 **프레젠테이션 계층(HTTP)**에 대한 지식이 도메인 레이어로 침범하는 문제가 발생한다.

### 4) 도메인 레이어가 HTTP를 직접 알게 되는 구조

위의 `ApiException`처럼 도메인에서 HTTP 상태 코드를 직접 들고 있게 되면,

- 나중에 gRPC, 메시지 큐, CLI 등 다른 인터페이스를 붙이기 어렵고
- Hexagonal Architecture / Clean Architecture에서 말하는 레이어 분리가 깨진다.

정리하자면, 자주 보이는 예외 구조들은

- 도메인별로만 쪼개져 있거나
- 지나치게 세분화되어 있거나
- 너무 추상적이거나
- 도메인과 HTTP가 뒤섞여 있거나

하는 문제를 가진 경우가 많다.

---

## 제안 구조: Server / Client 중심 + ErrorCode 기반 설계

위의 문제를 해결하기 위한 핵심 방향은 다음과 같다.

1. **예외의 큰 축은 Client / Server 두 가지로만 나눈다.**  
2. **발생 가능한 예외는 ErrorCode enum으로 모두 나열한다.**  
3. **도메인 레이어는 HTTP를 전혀 모르고, 프레젠테이션 레이어에서만 HTTP를 매핑한다.**  
4. **예외 생성은 Factory Method로 일관성 있게 만든다.**

아래는 이를 Java 코드로 정리한 예시들이다.

---

### 1) 도메인 레이어: ErrorKind, ErrorCode, DomainException

먼저 예외의 종류를 크게 나누는 `ErrorKind`와  
실제 에러 코드를 정의하는 `ErrorCode` enum을 만든다.

```java
package com.example.domain.error;

public enum ErrorKind {
    CLIENT,   // 요청자(클라이언트) 잘못 - validation, 권한, not found 등
    SERVER    // 서버 내부 또는 외부 시스템 문제
}
```

```java
package com.example.domain.error;

public enum ErrorCode {

    // 공통/기본
    INVALID_ARGUMENT,
    VALIDATION_FAILED,

    // 인증/인가
    UNAUTHORIZED,
    FORBIDDEN,

    // 유저 도메인
    USER_NOT_FOUND,

    // 시스템/외부 의존성
    EXTERNAL_API_FAILURE,
    DB_FAILURE;

    // 필요하다면 별도의 code 문자열 필드를 둘 수도 있다.
}
```

`DomainException`은 도메인 레이어에서 사용할 공통 예외 베이스 클래스다.

```java
package com.example.domain.error;

import java.util.Collections;
import java.util.Map;

public class DomainException extends RuntimeException {

    private final ErrorCode code;
    private final ErrorKind kind;
    private final Map<String, Object> metadata;

    public DomainException(
            ErrorCode code,
            ErrorKind kind,
            String message
    ) {
        this(code, kind, message, Collections.emptyMap(), null);
    }

    public DomainException(
            ErrorCode code,
            ErrorKind kind,
            String message,
            Map<String, Object> metadata
    ) {
        this(code, kind, message, metadata, null);
    }

    public DomainException(
            ErrorCode code,
            ErrorKind kind,
            String message,
            Map<String, Object> metadata,
            Throwable cause
    ) {
        super(message, cause);
        this.code = code;
        this.kind = kind;
        this.metadata = metadata != null ? metadata : Collections.emptyMap();
    }

    public ErrorCode getCode() {
        return code;
    }

    public ErrorKind getKind() {
        return kind;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }
}
```

여기서 주목해야 할 점은:

- **HTTP 상태 코드가 전혀 등장하지 않는다**는 것  
- 도메인은 오직 error의 _종류(kind)_와 _코드(code)_만 표현한다는 것

---

### 2) ClientException / ServerException 두 개만 둔다

이제 `DomainException`을 상속하는 두 종류의 예외만 둔다.

```java
package com.example.domain.error;

import java.util.Map;

public class ClientException extends DomainException {

    public ClientException(ErrorCode code, String message) {
        super(code, ErrorKind.CLIENT, message);
    }

    public ClientException(ErrorCode code, String message, Map<String, Object> metadata) {
        super(code, ErrorKind.CLIENT, message, metadata);
    }
}
```

```java
package com.example.domain.error;

import java.util.Map;

public class ServerException extends DomainException {

    public ServerException(ErrorCode code, String message) {
        super(code, ErrorKind.SERVER, message);
    }

    public ServerException(ErrorCode code, String message, Map<String, Object> metadata) {
        super(code, ErrorKind.SERVER, message, metadata);
    }

    public ServerException(ErrorCode code, String message, Map<String, Object> metadata, Throwable cause) {
        super(code, ErrorKind.SERVER, message, metadata, cause);
    }
}
```

예외 클래스를 “종류(성격)” 기준으로 두 개만 두고,  
실제 의미는 `ErrorCode`로 풀어내는 방식이다.

---

### 3) ErrorCode + Factory Method 패턴

실제 도메인 코드에서는 직접 `new ClientException(...)`을 호출하기보다는,  
**도메인별 Factory 클래스를 두고 그 안에서만 예외를 생성**하는 것을 추천한다.

#### 3-1. User 도메인용 팩토리: UserErrors

```java
package com.example.domain.user;

import com.example.domain.error.ClientException;
import com.example.domain.error.ErrorCode;

import java.util.HashMap;
import java.util.Map;

public final class UserErrors {

    private UserErrors() {
    }

    public static ClientException userNotFound(long userId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("userId", userId);

        return new ClientException(
                ErrorCode.USER_NOT_FOUND,
                "user not found: id=" + userId,
                metadata
        );
    }

    public static ClientException invalidAgeRange(int min, int max) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("min", min);
        metadata.put("max", max);

        return new ClientException(
                ErrorCode.INVALID_ARGUMENT,
                "invalid age range: [" + min + ", " + max + "]",
                metadata
        );
    }
}
```

사용 예시는 다음과 같다.

```java
User user = userRepository.findById(userId)
        .orElseThrow(() -> UserErrors.userNotFound(userId));

if (age < 0 || age > 150) {
    throw UserErrors.invalidAgeRange(0, 150);
}
```

#### 3-2. 공통 시스템 예외용 팩토리: DomainExceptions

```java
package com.example.domain.error;

import java.util.Collections;
import java.util.Map;

public final class DomainExceptions {

    private DomainExceptions() {
    }

    public static ClientException invalidArgument(String message) {
        return new ClientException(
                ErrorCode.INVALID_ARGUMENT,
                message,
                Collections.emptyMap()
        );
    }

    public static ServerException dbFailure(String message, Throwable cause) {
        return new ServerException(
                ErrorCode.DB_FAILURE,
                message,
                Collections.emptyMap(),
                cause
        );
    }

    public static ServerException externalApiFailure(String provider, Throwable cause) {
        Map<String, Object> metadata = Map.of("provider", provider);

        return new ServerException(
                ErrorCode.EXTERNAL_API_FAILURE,
                "external api failure: provider=" + provider,
                metadata,
                cause
        );
    }
}
```

사용 예시는 다음과 같다.

```java
if (!isValid(request)) {
    throw DomainExceptions.invalidArgument("request is invalid");
}

try {
    externalClient.call(...);
} catch (Exception e) {
    throw DomainExceptions.externalApiFailure("PAYMENT_GATEWAY", e);
}
```

이렇게 하면:

- ErrorCode–메시지–metadata의 조합이 한 곳에 모이고
- 서비스 코드에서는 **의도만 읽으면 된다.**

---

### 4) Presentation 레이어: ErrorResponse와 HttpErrorResponseResolver

이제 도메인 예외를 HTTP 응답으로 바꾸는 레이어를 살펴보자.  
이 부분은 Spring MVC 기준으로 설명하지만, WebFlux/gRPC 등에서도 동일한 개념으로 적용 가능하다.

#### 4-1. ErrorResponse DTO

```java
package com.example.api.error;

import java.util.Map;

public class ErrorResponse {

    private final String code;
    private final int httpStatus;
    private final String description;
    private final String resourceUri;

    private final String traceId;
    private final String timestamp;
    private final Map<String, Object> details;
    private final Boolean retryable;

    public ErrorResponse(
            String code,
            int httpStatus,
            String description,
            String resourceUri,
            String traceId,
            String timestamp,
            Map<String, Object> details,
            Boolean retryable
    ) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.description = description;
        this.resourceUri = resourceUri;
        this.traceId = traceId;
        this.timestamp = timestamp;
        this.details = details;
        this.retryable = retryable;
    }

    public String getCode() {
        return code;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public String getDescription() {
        return description;
    }

    public String getResourceUri() {
        return resourceUri;
    }

    public String getTraceId() {
        return traceId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public Boolean getRetryable() {
        return retryable;
    }
}
```

- `code` : ErrorCode.name (또는 별도의 문자열 코드)
- `httpStatus` : HTTP 상태 코드 숫자
- `description` : 클라이언트에게 보여줄 메시지
- `resourceUri` : 요청 URI (`/api/users/123` 등)
- `traceId` : 로그/트레이싱 연동용 식별자
- `timestamp` : 에러 발생 시각
- `details` : validation error 등 상세 정보
- `retryable` : 재시도 여부 (서버/외부 시스템 에러 등에 유용)

#### 4-2. HttpErrorResponseResolver

```java
package com.example.api.error;

import com.example.domain.error.DomainException;
import com.example.domain.error.ErrorCode;
import com.example.domain.error.ErrorKind;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Map;

public final class HttpErrorResponseResolver {

    private HttpErrorResponseResolver() {
    }

    public static ErrorResponse resolve(
            DomainException ex,
            String resourceUri,
            String traceId
    ) {
        HttpStatus status = resolveStatus(ex);
        String description = resolveDescription(ex);
        Map<String, Object> details = buildDetails(ex);
        Boolean retryable = resolveRetryable(ex);

        String timestamp = Instant.now().toString();

        return new ErrorResponse(
                ex.getCode().name(),   // 필요하다면 별도 코드 문자열로 매핑 가능
                status.value(),
                description,
                resourceUri,
                traceId,
                timestamp,
                details,
                retryable
        );
    }

    private static HttpStatus resolveStatus(DomainException ex) {
        ErrorKind kind = ex.getKind();
        ErrorCode code = ex.getCode();

        if (kind == ErrorKind.CLIENT) {
            return resolveClientStatus(code);
        } else {
            return resolveServerStatus(code);
        }
    }

    private static HttpStatus resolveClientStatus(ErrorCode code) {
        switch (code) {
            case USER_NOT_FOUND:
                return HttpStatus.NOT_FOUND;
            case INVALID_ARGUMENT:
            case VALIDATION_FAILED:
                return HttpStatus.BAD_REQUEST;
            case UNAUTHORIZED:
                return HttpStatus.UNAUTHORIZED;
            case FORBIDDEN:
                return HttpStatus.FORBIDDEN;
            default:
                return HttpStatus.BAD_REQUEST;
        }
    }

    private static HttpStatus resolveServerStatus(ErrorCode code) {
        switch (code) {
            case EXTERNAL_API_FAILURE:
                return HttpStatus.BAD_GATEWAY;
            case DB_FAILURE:
                return HttpStatus.SERVICE_UNAVAILABLE;
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    private static String resolveDescription(DomainException ex) {
        // 기본은 ex.getMessage(), 필요하다면 i18n 리소스를 사용할 수도 있다.
        return ex.getMessage();
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> buildDetails(DomainException ex) {
        // 예: INVALID_ARGUMENT일 때 metadata에 fieldErrors가 있으면 details로 노출
        if (ex.getCode() == ErrorCode.INVALID_ARGUMENT) {
            Object fieldErrors = ex.getMetadata().get("fieldErrors");
            if (fieldErrors instanceof Map) {
                return (Map<String, Object>) fieldErrors;
            }
        }
        return null;
    }

    private static Boolean resolveRetryable(DomainException ex) {
        switch (ex.getCode()) {
            case EXTERNAL_API_FAILURE:
            case DB_FAILURE:
                return Boolean.TRUE;
            default:
                return null;
        }
    }
}
```

---

### 5) Spring 글로벌 예외 핸들러

마지막으로, Spring의 `@RestControllerAdvice`에서  
위의 Resolver를 사용해 `ErrorResponse`를 만들어 반환한다.

```java
package com.example.api.error;

import com.example.domain.error.DomainException;
import com.example.domain.error.ErrorKind;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponse> handleDomainException(
            DomainException ex,
            HttpServletRequest request
    ) {
        String resourceUri = request.getRequestURI();
        String traceId = MDC.get("traceId"); // 로깅 필터에서 넣어두었다고 가정

        ErrorResponse errorResponse = HttpErrorResponseResolver.resolve(
                ex,
                resourceUri,
                traceId
        );

        // kind에 따라 로그 레벨을 분리할 수도 있다.
        if (ex.getKind() == ErrorKind.CLIENT) {
            // logger.warn("client error: {} - {}", ex.getCode(), ex.getMessage());
        } else {
            // logger.error("server error: {} - {}", ex.getCode(), ex.getMessage(), ex);
        }

        return ResponseEntity
                .status(errorResponse.getHttpStatus())
                .body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception ex,
            HttpServletRequest request
    ) {
        String resourceUri = request.getRequestURI();
        String traceId = MDC.get("traceId");

        ErrorResponse errorResponse = new ErrorResponse(
                "UNEXPECTED_ERROR",
                500,
                "internal server error",
                resourceUri,
                traceId,
                java.time.Instant.now().toString(),
                null,
                null
        );

        // logger.error("unexpected error", ex);

        return ResponseEntity
                .status(errorResponse.getHttpStatus())
                .body(errorResponse);
    }
}
```

---

## 전체 예외 처리 흐름 요약

위 구조를 한 번에 정리하면 다음과 같다.

1. **도메인 레이어**
   - `DomainException` + `ClientException` / `ServerException`
   - `ErrorCode` enum으로 발생 가능한 모든 예외 유형 정의
   - HTTP, gRPC 등 프로토콜은 전혀 모른다.

2. **Factory Method (UserErrors, DomainExceptions 등)**
   - ErrorCode, 메시지, metadata, kind를 한 곳에서 캡슐화
   - 서비스 코드에서는 `throw UserErrors.userNotFound(id);`처럼 의도만 표현

3. **Presentation 레이어**
   - `HttpErrorResponseResolver`가 `DomainException` → `ErrorResponse`로 변환
   - HTTP Status, description, traceId, timestamp, details, retryable 등을 결정

4. **글로벌 예외 핸들러**
   - `@RestControllerAdvice`에서 DomainException과 일반 Exception을 처리
   - 모든 API에서 일관된 JSON 에러 응답을 반환

5. **클라이언트**
   - 항상 동일한 구조의 ErrorResponse를 받고
   - `code` / `httpStatus` / `description` / `details` / `retryable`를 기준으로 UI, 재시도 정책, 로깅 등을 구현

---

## 정리

이 글에서 제안한 예외 설계의 핵심은 다음과 같다.

- **도메인은 Client/Server + ErrorCode만 알고, HTTP를 모른다.**
- **예외 클래스는 ClientException / ServerException 두 개로 최소화한다.**
- **ErrorCode enum + Factory Method로 예외 생성 규칙을 일관되게 유지한다.**
- **Presentation 레이어는 Resolver를 통해 ErrorResponse를 만들고, HTTP Status를 결정한다.**

이 구조는 단순하지만 확장성이 높고,  
서비스가 커질수록 “예외 설계의 빚”을 줄여주는 효과가 크다.

이미 운영 중인 시스템이라도,  
먼저 새로운 모듈이나 신규 API부터 이 패턴을 적용해 보고  
점진적으로 나머지 코드베이스로 확장해 나가면  
예외 처리의 일관성과 유지보수성이 크게 개선될 것이다.
