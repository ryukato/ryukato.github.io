---
slug: PyTorch_on_m2_mac 
title: PyTorch on m2 mac 
authors: ryukato
date: 2025-06-23 12:13:00
tags: [PyTorch, MPS, M2]
---

<!-- truncate -->
# Apple Silicon(M1/M2)에서 PyTorch MPS 사용 시 torch_dtype 설정 주의사항

Apple Silicon(M1, M2, M3 등)을 사용하는 macOS 환경에서는 PyTorch의 `cuda` 대신 **Metal Performance Shaders(MPS)** 백엔드를 사용해야 합니다. 하지만 이때 주의해야 할 점 중 하나가 바로 **`torch_dtype` 설정**입니다.

---

## ✅ MPS란?

- MPS는 Apple에서 제공하는 GPU 가속 프레임워크입니다.
- PyTorch는 1.12 버전부터 MPS 백엔드를 지원합니다.
- Apple Silicon에서는 `torch.cuda` 대신 `torch.mps`를 사용해야 합니다.

```python
import torch

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
```

> Note
> 실행 환경의 조건에 따라 다음과 같이 torch device를 검사 및 설정할 수 있습니다.

```python
def get_device():
    device = torch.device("cpu")
    if torch.cuda.is_available():
            print("cuda is available")
            device = torch.device("cuda"))
        else:
            if torch.backends.mps.is_available():
                print("mps is available")
            device = torch.device("mps")
            else:
                print("cuda and mps are not available, so cpu will be used.")

    return device
```

---

## ✅ MPS에서 권장되는 torch_dtype

| dtype               | 지원 여부 | 설명                              |
|--------------------|-----------|-----------------------------------|
| `torch.float32`     | ✅ 지원   | 가장 안정적이며 기본적으로 사용됨 |
| `torch.float16`     | ⚠️ 제한적 | 일부 연산에서 오류 발생 가능       |
| `torch.bfloat16`    | ❌ 미지원 | 현재 MPS에서는 사용 불가           |
| `torch.int32/int64` | ⚠️ 제한적 | 연산 종류에 따라 오류 발생 가능    |

### 추천 설정 예시

```python
x = torch.ones((2, 2), device=device, dtype=torch.float32)  # ✅ 안전
```

---

## ⚠️ float16 사용 시 주의사항

```python
x = torch.ones((2, 2), device=device, dtype=torch.float16)
```

- 실행은 되지만, 다음과 같은 문제 발생 가능:
  - 연산 중 오류 (`RuntimeError: Float16 is not supported on MPS`)
  - 부정확한 결과
  - 연산 성능 저하 또는 자동 CPU fallback

**float16이 꼭 필요한 경우**, CUDA가 지원되는 환경을 사용하는 것이 더 안정적입니다.

---

## ✅ MPS와 torch_dtype 사용 시 안전한 패턴

```python
import torch

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
dtype = torch.float32  # MPS에서 안정적으로 지원되는 dtype

x = torch.randn((3, 3), device=device, dtype=dtype)
model = MyModel().to(device=device, dtype=dtype)
```

---

## 🧠 결론

- macOS에서는 CUDA 대신 `MPS`를 사용해야 함.
- MPS에서는 **`torch.float32`를 기본 dtype으로 사용하는 것이 가장 안전**.
- `float16`, `bfloat16`은 지원이 제한적이거나 미지원 상태이므로 사용 시 주의가 필요함.
- MPS는 아직 CUDA에 비해 일부 기능이 제한적이므로, 모델 학습보다는 추론(inference)에 더 적합함.

---

> ✅ 참고: PyTorch 공식 MPS 문서  
> https://pytorch.org/docs/stable/notes/mps.html
---

## 🚀 MPS 환경에서 PyTorch 성능을 최대한 활용하는 팁

Apple Silicon(M1/M2/M3) 환경에서 MPS를 사용할 때, GPU 자원을 최대한 활용하려면 다음과 같은 방법들을 고려해야 합니다:

### ✅ 최신 PyTorch 사용
- 최소 PyTorch 1.12 이상, 추천 버전은 2.1+
- 최신 버전에서는 MPS 백엔드의 연산 지원이 크게 향상됨

### ✅ float32 사용 권장
- MPS는 float32에서 가장 안정적으로 작동
- float16, bfloat16은 제한적이거나 미지원

### ✅ 배치 사이즈 조절
- GPU 메모리가 제한적이므로 작은 batch size 사용 추천 (예: 4~32)

### ✅ 입력 크기 축소
- 음성, 이미지 등 입력 길이나 해상도 줄이기 (예: Whisper의 chunk_length_s를 10~20초로 설정)

### ✅ 캐시 및 메모리 정리

```python
import gc
import torch

del model
gc.collect()
if torch.backends.mps.is_available():
    torch.mps.empty_cache()
```

### ✅ MPS 연산 지원 여부 확인

```python
if torch.backends.mps.is_available():
    print("MPS available:", torch.backends.mps.is_built())
```

### ✅ MPS 성능 분석 도구
- macOS Activity Monitor → GPU 탭
- Instruments.app → Metal 성능 분석
- torch.profiler (PyTorch 2.1 이상 일부 지원)

---

## 💡 추가 제안: CoreML 추론 고려
- PyTorch 모델을 ONNX 또는 CoreML로 변환 후 추론 시 더 나은 성능
- `optimum` Transformers + CoreML runtime으로 효율적인 추론 가능