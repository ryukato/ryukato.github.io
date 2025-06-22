---
slug: jvm-gc-simple-guide 
title: simple JVM GC guide 
authors: ryukato
date: 2025-06-22 16:53:00
tags: [JVM, GC]
---

<!-- truncate -->
# JVM 메모리 구조와 GC 최적화 전략 완전 정리 (JDK 17 기준)

## 📌 1. JVM 메모리 구조 이해

JVM은 실행 중 다음과 같은 주요 메모리 영역을 사용합니다:

* Metaspace (클래스 메타정보)
* Heap (객체 인스턴스 저장)
* Stack (지역 변수, 프레임 등)
* Code Cache (JIT 결과 저장)

---
- **Heap**: 대부분의 `new` 객체가 이곳에 생성됨
- **Metaspace**: static 필드, 클래스 구조, 메서드 정보 등 클래스 로딩 시 저장
- **Stack**: 각 스레드마다 존재, 지역 변수 및 호출 컨텍스트 저장

---

## ♻️ 2. GC(Garbage Collection) 기본 처리 단계

1. **객체 생성** → Eden 영역에 할당
2. **Mark** → GC Root로부터 도달 가능한 객체 추적
3. **Sweep/Copy/Compact**
   - Young GC: 살아남은 객체를 Survivor 또는 Old로 복사
   - Old GC: Mark-Compact로 단편화 해소
4. **Promotion** → 일정 생존 횟수 이상 객체는 Old 영역으로 승격

---

## ⚙️ 3. G1 GC 구조 요약 (JDK 17 기본 GC)

- 전체 힙을 고정 크기 Region으로 나눔 (Eden, Survivor, Old, Humongous)
- GC 유형:
  - **Young GC**: Eden → Survivor
  - **Mixed GC**: 일부 Old도 수집
  - **Full GC**: 전체 힙 수집 (가능한 회피)

### 🔍 G1 GC 로그 예시

```text
[2.303s][info][gc,metaspace] GC(12) Metaspace: 60293K(60736K)->60293K(60736K)
                             NonClass: 52643K(52864K)->52643K(52864K)
                             Class:    7650K(7872K)->7650K(7872K)
```

- Metaspace는 클래스 메타데이터
- NonClass: 메서드, 심볼 등
- Class: 클래스 구조 정보

---

## 🧠 4. Metaspace 관리 팁

- Metaspace는 힙이 아닌 **네이티브 메모리**에서 사용됨
- 기본적으로 무제한 → `-XX:MaxMetaspaceSize`로 제한 가능
- 동적 ClassLoader, SPI 사용 시 메타스페이스 누수 위험 ↑

```bash
-XX:MetaspaceSize=64m
-XX:MaxMetaspaceSize=256m
```

---

## 📦 5. GC에 유리한 객체 관리 전략

| 전략 | 설명 |
|------|------|
| 참조 해제 | `obj = null` 등으로 명시적 해제 |
| 스코프 축소 | 메서드 지역 변수, 블록 사용 |
| Escape Analysis 유도 | 외부로 노출되지 않으면 Stack 할당 |
| WeakReference 사용 | 캐시 등에서 유용하게 사용 |
| ThreadLocal 관리 | 사용 후 반드시 `.remove()` 호출 |

---

## ⚠️ 주의: 람다 캡처와 ThreadLocal

- 람다 캡처 시 캡처된 객체는 내부적으로 **필드로 저장**됨 → Executor 등에서 참조가 남아 있으면 GC 안 됨
- `ThreadLocal`은 Thread가 종료되기 전까지 참조 유지 → ThreadPool에서 주의 필요

```java
try {
    threadLocal.set(value);
    ...
} finally {
    threadLocal.remove();
}
```

---

## 🔍 추천 툴 & 명령어

- `jcmd <pid> VM.native_memory summary`
- `jcmd <pid> GC.class_stats`
- `-XX:+PrintGCDetails -Xlog:gc*` → GC 로그 확인
- [GCViewer](https://github.com/chewiebug/GCViewer), [GCEasy.io](https://gceasy.io/)

---

## 📚 참고 자료

- [Oracle GC Tuning Guide (JDK17)](https://docs.oracle.com/en/java/javase/17/gctuning/index.html)
- [JEP 122: Remove the Permanent Generation](https://openjdk.org/jeps/122)
- [Java Metaspace Explained - Baeldung](https://www.baeldung.com/java-metaspace)
- [GCViewer](https://github.com/chewiebug/GCViewer)
- *Java Performance* by Scott Oaks

---

> 💡 JVM의 메모리 구조와 GC 동작을 이해하면, **예기치 못한 메모리 이슈를 사전에 방지**하고,  
> 성능 최적화와 운영 안정성을 높일 수 있습니다.
