---
slug: mTLS_Overview 
title: mTLS Overview 
authors: ryukato
date: 2025-07-03 12:39:00
tags: [mTLS]
---

<!-- truncate -->
# 🔐 mTLS (Mutual TLS) 개요 및 실전 정리

`mTLS`는 mutual TLS의 약자로, **서버와 클라이언트가 서로를 인증하는 TLS 통신 방식**입니다.  
일반 HTTPS보다 더 높은 수준의 보안 통신이 요구되는 **핀테크, 헬스케어, 마이크로서비스** 환경에서 널리 사용됩니다.

---

## ✅ TLS vs mTLS 비교

| 항목 | TLS (일반 HTTPS) | mTLS (mutual TLS) |
|------|------------------|-------------------|
| 인증 방향 | 서버만 인증 | **서버 ↔ 클라이언트 상호 인증** |
| 사용 사례 | 웹사이트 접속 | 금융 API, 서비스 간 통신 |
| 클라이언트 인증서 | 없음 | **필수** |
| 보안 수준 | 기본 보안 | **강력한 보안 (양방향 신뢰)** |

---

## 🔐 mTLS 통신 흐름

```
Client                        Server
  │                             │
  │ —— Client Hello ———→        │  ← TLS 시작
  │ ←— Server Certificate ——    │  ← 서버 인증서 검증
  │ —— Client Certificate —→    │  ← 클라이언트 인증서 제공
  │ ←— 인증 완료 후 암호화 세션 │  ← 세션 키 협상 완료
  │ ←—— Encrypted Data ——→      │  ← 양방향 암호화 통신
```

---

## 📦 구성 요소

| 구성 요소 | 설명 |
|-----------|------|
| **CA (Certificate Authority)** | 인증서 발급자 |
| **Server Certificate** | 서버 인증서 |
| **Client Certificate** | 클라이언트 인증서 |
| **Private Key** | 인증서에 대응하는 개인 키 |
| **Root / Intermediate CA** | 신뢰 체계 구성

---

## 🎯 mTLS를 사용하는 이유

### 🔐 보안 강화
- 중간자 공격(MITM) 방지
- 데이터 위/변조 방지

### 🧩 마이크로서비스 보안
- Kubernetes + Istio 환경에서 Pod 간 mTLS 통신
- 서비스 간 ID 기반 신뢰 모델 제공

### 🏦 금융/핀테크 API
- PG사, 은행, KYC 연동 시 mTLS 필수
- 인증 기관 요구 조건 충족

---

## 🧪 실전 예시

### Istio에서 mTLS 활성화 예

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: my-service
spec:
  mtls:
    mode: STRICT
```

- 해당 네임스페이스 내 서비스 간 통신을 **mTLS로 강제**함

---
### Spring web-client mTLS 구성 예

```kotlin title="MtlsHttpClientConfig"
import io.netty.handler.ssl.SslContextBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import reactor.netty.http.client.HttpClient
import java.io.FileInputStream
import java.security.KeyStore
import javax.net.ssl.KeyManagerFactory
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManagerFactory
import java.security.SecureRandom

@Configuration
class MtlsHttpClientConfig {

    @Bean
    fun mtlsHttpClient(): HttpClient {
        val keyStorePath = "client.p12"
        val keyStorePassword = "changeit".toCharArray()

        // Load client certificate
        val keyStore = KeyStore.getInstance("PKCS12")
        FileInputStream(keyStorePath).use {
            keyStore.load(it, keyStorePassword)
        }

        val kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm())
        kmf.init(keyStore, keyStorePassword)

        val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
        tmf.init(keyStore)

        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(kmf.keyManagers, tmf.trustManagers, SecureRandom())

        return HttpClient.create().secure { spec ->
            spec.sslContext(sslContext)
        }
    }
}
```

```kotlin title="WebClientConfig"
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient

@Configuration
class WebClientConfig {

    @Bean
    fun mtlsWebClient(mtlsHttpClient: HttpClient): WebClient {
        return WebClient.builder()
            .baseUrl("https://secure.api.example.com")
            .clientConnector(ReactorClientHttpConnector(mtlsHttpClient))
            .build()
    }
}
```

#### web-client 사용 예시
```kotlin title="MtlsSecureService"
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.time.Duration

@Service
class MtlsSecureService(
    private val mtlsWebClient: WebClient
) {
    fun fetchSecureData(): Mono<String> {
        return mtlsWebClient.get()
            .uri("/secure-data")
            .retrieve()
            .bodyToMono(String::class.java)
            .timeout(Duration.ofSeconds(5))
    }
}
```

#### web-client 사용 예시 (coroutine version)
##### Dependencies
```kotlin
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
}
```

##### 사용 예시 
```kotlin
import kotlinx.coroutines.reactor.awaitSingle
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class MtlsSecureService(
    private val mtlsWebClient: WebClient
) {
    suspend fun fetchSecureData(): String {
        return mtlsWebClient.get()
            .uri("/secure-data")
            .retrieve()
            .bodyToMono(String::class.java)
            .awaitSingle() // 코루틴으로 변환
    }
}
```
---

### Node.js 클라이언트 mTLS 구성 예

```js
const fs = require('fs');
const https = require('https');

const options = {
  hostname: 'secure.api.example',
  port: 443,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('client-key.pem'),
  cert: fs.readFileSync('client-cert.pem'),
  ca: fs.readFileSync('ca-cert.pem'),
};

const req = https.request(options, res => {
  console.log('status:', res.statusCode);
});
req.end();
```

---

## ⚠️ 도입 시 유의사항

| 항목 | 유의사항 |
|------|----------|
| 인증서 만료 관리 | cert-manager, Vault 등을 통한 자동 갱신 필요 |
| 클라이언트 키 관리 | 인증서 유출 위험 대비 필요 (e.g. HSM, Vault 사용) |
| 성능 이슈 | 최초 TLS Handshake 비용 발생, 세션 재사용 고려 |
| 디버깅 난이도 | 인증 오류 시 로그 확인 및 추적이 어려울 수 있음 |

---

## 🔧 관련 도구

| 목적 | 도구 |
|------|------|
| 인증서 발급/갱신 | cert-manager, Let's Encrypt, HashiCorp Vault |
| 서비스 간 인증 | Istio, Linkerd (Service Mesh) |
| 클라이언트 인증 관리 | PKCS#11, AWS IoT X.509 인증 |

---

## 📌 요약

- `mTLS`는 **TLS 기반의 양방향 인증 방식**으로, 클라이언트와 서버가 모두 자신을 증명해야 통신이 가능함
- 마이크로서비스, 핀테크, 인증 API 환경에서 보안 강화에 탁월
- 인증서 관리 자동화와 운영 안정성이 관건