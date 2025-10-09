---
slug: mTLS_Overview 
title: mTLS Overview 
authors: ryukato
date: 2025-07-03 12:39:00
tags: [mTLS]
---

# 🔐 mTLS (Mutual TLS) 개요 및 실전 정리

`mTLS`는 mutual TLS의 약자로, **서버와 클라이언트가 서로를 인증하는 TLS 통신 방식**입니다.  
일반 HTTPS보다 더 높은 수준의 보안 통신이 요구되는 **핀테크, 헬스케어, 마이크로서비스** 환경에서 널리 사용됩니다.

---
<!-- truncate -->

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
  │ ←— 인증 완료 후 암호화 세션       │  ← 세션 키 협상 완료
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

---

# 🔐 Kubernetes 내 mTLS 사용 여부와 성능 영향

Kubernetes 클러스터 내 서비스 간 통신에서 **mTLS(Mutual TLS)**를 사용할지 여부는 보안성과 성능의 균형을 고려해 결정해야 합니다. 아래는 그에 대한 상세 설명입니다.

---

## ✅ 1. mTLS 도입 시 성능 손실은 있는가?

예, 있습니다. 주요 원인은 다음과 같습니다:

| 성능 영향 요소 | 설명 |
|----------------|------|
| **TLS 핸드셰이크 비용** | 연결마다 RSA/ECDSA 기반 핸드셰이크 발생 → CPU 부하 |
| **암호화/복호화 연산** | 대칭키 기반 암복호화도 일부 CPU 부담 유발 |
| **인증서 검증 비용** | 클라이언트/서버 모두 인증서 체인 검증 |
| **네트워크 지연** | 1-RTT 추가 (TLS 핸드셰이크 지연) |

📌 일반적인 K8s 환경에서는 **5~15% 수준의 latency overhead**,  
CPU 사용량은 mTLS 사용 시 **최대 30%까지 증가할 수 있음** (서비스에 따라 다름)

---

## ✅ 2. 그렇다면 내부 DNS로 호출하면 mTLS 없이도 안전한가?

**그렇지 않습니다. 이유는 다음과 같습니다:**

| 위험 요소 | 설명 |
|-----------|------|
| **Flat Network 구조** | 기본적으로 모든 Pod 간 통신 허용 (네트워크 정책 없음) |
| **악성 코드 유입 가능성** | 하나의 compromised pod가 다른 pod로 접근 가능 |
| **네임스페이스 격리 불충분** | 네트워크 단위 격리는 별도 정책 필요 |
| **DNS 스푸핑 가능성** | Pod DNS를 악의적으로 조작할 수 있음 |

즉, **"같은 클러스터 안이라서 안전하다"는 가정은 위험**합니다.

---

## ✅ 3. 보통 어떻게 설계하나?

| 구분 | 권장 방안 |
|------|----------|
| 민감 서비스 (인증/결제 등) | ✅ **mTLS 적용 (STRICT 모드)** |
| 내부 비중요 서비스 | ❌ mTLS 선택적 적용 또는 PERMISSIVE |
| Sidecar 기반 Istio 사용 시 | ✅ `PeerAuthentication`으로 namespace 단위 적용 |
| 고성능 서비스 | ✅ gRPC + HTTP/2 + connection reuse + mTLS 적용 |
| 성능 최적화 | ✅ TLS 세션 재사용, Keep-Alive, Envoy 튜닝 등 고려 |

---

## ✅ 4. Istio 기반 구성 예시

### PERMISSIVE (선택적 mTLS 허용)

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: internal-namespace
spec:
  mtls:
    mode: PERMISSIVE
```

### STRICT (강제 mTLS)

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: secure-services
  namespace: payment
spec:
  mtls:
    mode: STRICT
```

---

## ✅ 결론 요약

| 항목 | 요약 |
|------|------|
| 🔐 mTLS 사용 시 | 보안 강력해지지만 성능 손실 있음 (CPU/Latency ↑) |
| 🌐 내부 DNS 호출만으로는 | DNS Spoofing/Pod 침해에 취약 |
| 🛠️ 권장 전략 | 중요 서비스만 mTLS 적용 + NetworkPolicy 병행 |
| 💡 대안 기술 | eBPF 기반 Cilium, SPIRE, mTLS offloading 등 고려 가능 |

---

## 📌 참고

- 클러스터 보안은 네트워크 정책, 서비스 인증, 접근 통제 등이 **복합적으로 구성**되어야 안전합니다.
- mTLS는 중요한 보안 레이어 중 하나이며, 반드시 전체 성능과 운영 전략 속에서 판단해야 합니다.
---


# 🔐 mTLS Offloading 구성 가이드 (Kubernetes + Service Mesh)

`mTLS Offloading`은 mTLS 통신의 암복호화 및 인증을 애플리케이션이 아닌 별도의 계층(프록시/사이드카/Gateway)에서 수행하도록 하는 아키텍처입니다. 이 구성은 성능 최적화와 보안 관리를 동시에 만족시킬 수 있습니다.

---

## ✅ mTLS Offloading이란?

> TLS 통신의 인증서 검증, 핸드셰이크, 암복호화 작업을 애플리케이션 외부에서 처리하는 구조

```
[Client] ⇄ [Sidecar / Proxy (mTLS 처리)] ⇄ [Application (HTTP/plain gRPC)]
```

---

## 🔧 오프로드 구성 방식들

### 1️⃣ Istio + Envoy 기반 (Sidecar 방식)

- Envoy Sidecar가 mTLS 처리
- App은 내부적으로 평문 HTTP로 Envoy와 통신

```
[Pod A]
  ├── [App Container]   ←→  localhost HTTP
  └── [Envoy Sidecar]   ⇄⇄⇄⇄  mTLS ⇄⇄⇄⇄   [Envoy Sidecar]
                                    ↑
[Pod B]                        [App Container]
```

---

### 2️⃣ Ingress Gateway에서 TLS 종료 + 내부는 mTLS (반오프로드)

```
[External Client]
     ⇄ TLS
[Ingress Gateway (Envoy)] ⇄ mTLS ⇄ [Internal Services]
```

---

### 3️⃣ 외부 프록시 또는 Node Local Sidecar

- Linkerd, Consul Connect, Cilium 등 Mesh가 mTLS 전담
- 앱은 일반 HTTP만 사용

---

## ⚙️ Istio 기반 실전 예시

### `DestinationRule` (mTLS 적용 대상 설정)

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: ratings
spec:
  host: ratings.default.svc.cluster.local
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
```

### `PeerAuthentication` (서비스 간 mTLS 강제)

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: default
spec:
  mtls:
    mode: STRICT
```

---

## ✅ 오프로드 방식의 장점

| 장점 | 설명 |
|------|------|
| ✅ 성능 향상 | TLS 핸드셰이크/암복호화 부담 감소 |
| ✅ 앱 코드 단순화 | 인증서 로딩/갱신 코드 필요 없음 |
| ✅ 정책 표준화 | 보안 정책 통합 관리 가능 (Mesh 단위) |
| ✅ 운영 자동화 | 인증서 회전 자동화 (e.g. SDS, cert-manager) |

---

## ⚠️ 고려 사항

| 주의점 | 설명 |
|--------|------|
| 🔐 프록시 공격 벡터 주의 | Sidecar 프록시가 공격 대상 가능성 |
| 🐞 디버깅 복잡 | TLS 오류 원인이 프록시에 있을 수 있음 |
| 📦 리소스 사용량 | 프록시가 모든 트래픽 처리 → CPU/RAM 증가 |
| 🔑 인증 체계 설계 필요 | CA, 인증서 수명, 신뢰 체계 명확화 필요 |

---

## 📌 요약

| 상황 | 권장 오프로드 방식 |
|------|--------------------|
| 일반 서비스 | Istio Sidecar 기반 mTLS 처리 |
| 외부 연동 | Ingress Gateway에서 TLS 종료 + 내부는 mTLS |
| 고성능 환경 | TLS 세션 재사용, Envoy tuning 병행 |
| CA 관리 필요 | Vault, cert-manager, SPIFFE 도입 고려 |

---

## 🔗 참고 기술

- Istio / Envoy / Linkerd
- cert-manager / HashiCorp Vault
- SPIFFE / SPIRE
- Cilium (eBPF 기반 mTLS 인증)