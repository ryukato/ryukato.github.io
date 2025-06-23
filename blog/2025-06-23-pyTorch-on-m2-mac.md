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