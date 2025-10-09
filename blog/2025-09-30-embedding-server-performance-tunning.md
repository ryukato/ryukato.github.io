---
slug: embedding-server-performance-tunning
title: 독립적인 Embedding 처리를 위한 서버의 성능 개선
authors: ryukato
date: 2025-09-30 14:00:00
tags: [embedding, python, uvicorn]
---

# 독립적인 Embedding 처리를 위한 서버의 성능 개선

이 문서는 FastAPI + sentence-transformers 기반의 embedding 처리 API 서버에서,
**멀티 프로세스와 비동기 워커 구조의 병렬성**을 활용하여 **성능을 개선**하는 방법을 정리한 문서입니다.

---
<!-- truncate -->

## 🔧 시스템 구성 개요

- `uvicorn` 기반 FastAPI ASGI 서버
- `/embed` 요청을 받으면:
  - 데이터를 `asyncio.Queue` 에 넣고
  - 백그라운드 `EmbeddingWorker` 가 소비
  - `sentence-transformers` 모델을 통해 embedding vector 생성
  - 생성된 벡터를 Qdrant에 저장

---

## ⚙️ 현재 구조의 주요 컴포넌트

### 1. `uvicorn --workers=N`
- `N`개의 **OS-level 프로세스**가 생성됨
- 각 프로세스는 FastAPI 앱 + 자체 queue + embedding_worker instance 포함
- 요청 분산은 **커널이 소켓을 fork한 워커에 라운드로빈 방식으로 전달**

### 2. `EmbeddingWorker(worker_count=M)`
- 각 프로세스 내부에 존재
- `M`개의 `asyncio.create_task()` 를 통해 event loop 기반 비동기 워커를 생성
- `asyncio.Queue(maxsize=K)` 를 공유하며, 큐의 작업을 병렬 소비

### 3. `sentence-transformers` 모델
- PyTorch 기반 embedding 모델
- 디바이스 설정은 `cpu`, `cuda`, 또는 `mps`
- 현재는 **Apple Silicon의 GPU 가속(MPS)** 를 사용하는 구조

---

## 🧠 병렬성 구조 요약

| 계층 | 단위 | 역할 |
|------|------|------|
| **프로세스** | uvicorn worker (N) | OS-level 멀티코어 활용 |
| **비동기 태스크** | embedding_worker (M) | event loop 내부의 경량 태스크 |
| **큐** | asyncio.Queue | 프로세스 내부에 존재. 공유되지 않음 |

예를 들어:
- `uvicorn --workers=4`, `worker_count=10`이면 → 총 **40개의 병렬 embedding 태스크** 실행
- 단, 이들은 모두 **각자의 프로세스와 큐에 속하며 서로 공유되지 않음**

---

## 🔥 주요 질문과 성능 고려 사항

### Q1. 워커 수(`--workers`)를 늘리면 속도가 개선될까?

**Yes, 대부분의 경우 그렇다.**

```python
# 측정 스크립트 예: FastAPI 요청 시간 측정
import httpx, time

start = time.perf_counter()
res = httpx.post("http://localhost:8080/embed", json={"text": "hello world"})
print("Status:", res.status_code)
print("Elapsed: {:.3f}s".format(time.perf_counter() - start))
```

---

### Q2. `EmbeddingWorker`의 worker_count를 늘리는 건 어떤 효과?

```python
# asyncio 기반 워커 처리량 측정 (queue 소비 속도 보기)
async def monitor_queue(worker):
    while True:
        logger.info(f"[{os.getpid()}] Queue size: {worker.queue.qsize()}")
        await asyncio.sleep(1)
```

---

### Q3. `Queue(maxsize=...)` 크기를 줄이면 어떤 일이 생기나?

- 요청량이 높고 큐가 작으면 `QueueFull` 예외 발생 가능
- FastAPI 로그에서 429 또는 처리 지연 확인

```python
# FastAPI에서 큐 길이 제한 확인 예
if queue.full():
    raise HTTPException(status_code=429, detail="Queue full")
```

---

### Q4. 여러 프로세스가 하나의 큐를 공유하려면?

```python
# Redis 큐 예시
import redis
r = redis.Redis()

# enqueue
r.rpush("embedding_tasks", json.dumps({"text": "hello"}))

# dequeue (blocking pop)
task = json.loads(r.blpop("embedding_tasks")[1])
```

---

## ⚡ 실험 가이드

- `uvicorn --workers=1, 2, 4, 8` 별로 요청 처리 시간 비교
- 각 프로세스에서 queue 상태 로그 출력
- CPU/MPS 사용률 추적: macOS Activity Monitor, `htop`, `powermetrics`

---

## ✅ 결론 요약

| 항목 | 요약 |
|------|------|
| `uvicorn --workers=N` | N개의 독립 프로세스. 병렬성 향상. 큐 공유 ❌ |
| `embedding_worker.worker_count=M` | 비동기 태스크 수. 프로세스 내 I/O 처리 성능 향상 |
| `queue size` | 처리 속도와 워커 수에 따라 적절히 조절 필요 |
| MPS 환경 | GPU-bound 처리이므로 CPU 멀티 워커 병렬성 효과는 제한적일 수 있음 |
| 공유 큐 도입 | Redis, RabbitMQ 등을 활용해야 프로세스 간 큐 공유 가능 |

---

## ✅ 추천 튜닝 전략

- 프로세스 수(`--workers`)는 **CPU 코어 수** 또는 **GPU 활용 상황**에 맞게 설정
- `embedding_worker.worker_count`는 **I/O 지연 또는 GPU 경합**을 고려하여 조절
- 큐 사이즈는 **과도한 backlog 방지용으로 제한**하면서도 **적절한 대기 허용**
- 장기적으로는 **Redis 큐 기반 구조로 이전**하여 스케일 아웃에 대비