---
slug: fine-tuning-domain-keywords
title: 도메인 키워드 추출을 위한 LLM Fine-Tuning 전략 정리
authors: ryukato
date: 2025-10-09 14:00:00
tags: [ai, ai-agent, fine-tuning, LoRA, Gemma, RAG, PEFT]
---

# Fine-Tuning Options for Domain Keyword Extraction

이 문서는 LLM(Gemma, Mistral 등)을 대상으로 도메인 키워드 인식 능력을 개선하기 위한 Fine-Tuning/적응 방법들을 **적용 난이도 순서로** 정리한 문서입니다.

---
<!-- truncate -->

## 1. Prompt Engineering (프롬프트 엔지니어링)
**난이도:** ★★★★★ (매우 쉬움)  
**설명:** 모델의 파라미터를 변경하지 않고, 프롬프트를 구조화하거나 예시를 추가해 성능을 개선함  
**예시 전략:**
- 개별 키워드에 대한 정의 삽입 (예: `"파스" refers to a medicated plaster`)
- 잘못된 응답에 대한 피드백 삽입 (`"You missed '임산부'. Please retry."`)
- few-shot examples 반복 삽입

**장점:**
- 가장 빠르고 쉬운 개선 방식  
- 사전 지식 없이 적용 가능

**단점:**
- LLM의 한계(불확실성)를 넘어설 수 없음  
- 문장 길이가 길어지면 오히려 성능 저하 가능

**예시:**
```text
You are a keyword extractor.
Input: "진통과 해열 효과가 있는 파스형 의약품은 임산부와 노인에게 적합합니다."
Expected Output: ["진통", "해열", "파스", "임산부", "노인"]
Note: "파스" refers to a medicated plaster and should be treated as a keyword.
```

---

## 2. RAG with Domain-Augmented Context (RAG 컨텍스트 주입)
**난이도:** ★★☆☆☆ (쉬움~중간)  
**설명:** 검색 기반 RAG 시스템에서 `"파스"`, `"정제"` 같은 용어 정의나 유사 사례를 미리 주입  
**방법:**
- 의약품 용어 사전, DUR, 성분 DB 등에서 context chunk 생성
- LLM 호출 시 해당 chunk와 함께 질문 입력

**장점:**
- 기존 모델 사용 가능  
- 문맥 내에서 키워드 이해도 향상

**단점:**
- RAG 시스템 구성 필요  
- 적절한 chunk retrieval logic이 중요

**예시:**
```python
# LangChain 예시: context chunk에 약물 제형 설명 포함
context = "‘파스’는 통증 완화를 위한 외용제로, 근육통 및 관절통 치료에 사용됩니다."
question = "임산부에게 적합한 파스형 진통제를 알려줘."
llm.invoke(f"{context}

{question}")
```

---

## 3. Instruction Tuning with Domain Examples (LoRA 가능)
**난이도:** ★★★☆☆ (중간)  
**설명:** `"다음 문장에서 의약품 키워드를 JSON 배열로 추출하라"` 같은 형태의 instruction-task dataset을 수천 건 생성하여 모델을 미세조정  
**방법:**
- `(instruction, input, output)` 세트를 구성 (예: `"extract keywords"`, `"임산부 대상의..."`, `["임산부", "진통"]`)  
- LoRA나 PEFT 활용 가능

**장점:**
- 비교적 적은 데이터 (~2,000 examples)로도 fine-tuning 효과  
- 추론 일관성이 높아짐

**단점:**
- 도메인 데이터셋 구축 필요  
- GPU 환경에서 미세조정 필요

**예시:**
```json
{
  "instruction": "다음 문장에서 의약품 키워드를 추출하세요.",
  "input": "진통·소염 작용이 있는 파스형 의약품은 신신제약이 제조한 타이레놀입니다.",
  "output": ["진통", "소염", "파스", "신신제약", "타이레놀"]
}
```

```python
from trl import SFTTrainer

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    args=TrainingArguments(
        per_device_train_batch_size=4,
        num_train_epochs=3,
        output_dir="./checkpoints"
    )
)
trainer.train()
```

---

## 4. Supervised Fine-Tuning (SFT, 완전 지도 학습)
**난이도:** ★★★★☆ (어려움)  
**설명:** 수천~수만 건의 문장에 정답 키워드를 직접 라벨링한 데이터를 사용해 모델 전체를 미세조정

**방법:**
- `"text"` → `["keywords"]` 형태의 데이터셋 생성
- 모델 전체를 재학습하거나 LoRA 방식으로 tuning

**장점:**
- 가장 강력한 성능 개선 가능  
- 도메인-specific 학습 가능

**단점:**
- 대규모 라벨링 작업 필요  
- compute 리소스 요구 (A100, RTX3090 등)

**예시:**
```bash
# datasets/train.jsonl 포맷:
# {"text": "진통·소염 효과가 있는 파스형 의약품은 임산부에게 사용됩니다.", "labels": ["진통", "소염", "파스", "임산부"]}

accelerate launch run_clm.py   --model_name_or_path google/gemma-2b   --train_file ./datasets/train.jsonl   --per_device_train_batch_size 2   --num_train_epochs 3   --learning_rate 5e-5   --output_dir ./gemma2b-sft
```

---

## 5. Tokenizer Customization (토크나이저 조정)
**난이도:** ★★★★★ (가장 어려움)  
**설명:** `"파스"`, `"연고"` 같은 단어가 subword로 잘게 쪼개지지 않도록 tokenizer에 직접 추가

**방법:**
- SentencePiece나 BPE vocab 수정
- `"파스"` → 하나의 token으로 인식되도록 학습

**장점:**
- 극단적인 OOV 문제 해결
- downstream task 안정성 증가

**단점:**
- tokenizer 재학습 필요
- 기존 모델과의 호환성 문제 발생 가능

**예시:**
```bash
# 사용자 정의 vocab에 '파스', '연고', '주사제' 등 추가 후 재학습
spm_train --input=corpus.txt --model_prefix=tokenizer --vocab_size=32000 --user_defined_symbols=파스,연고,주사제
```

---

## Gemma-2B 모델에서 LoRA 적용 요약

- Gemma-2B는 HuggingFace에서 지원되며 LoRA 적용 가능
- `transformers`, `peft` 조합 사용 가능
- 아래는 기본적인 적용 예시:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import get_peft_model, LoraConfig, TaskType

model = AutoModelForCausalLM.from_pretrained("google/gemma-2b", device_map="auto")
tokenizer = AutoTokenizer.from_pretrained("google/gemma-2b")

config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "k_proj", "v_proj"],
    lora_dropout=0.1,
    bias="none",
    task_type=TaskType.CAUSAL_LM,
)

model = get_peft_model(model, config)
```

- Ollama 등 ggml/gguf 기반 모델은 학습에는 부적합 → HuggingFace 모델로 학습 후 변환 필요

---

## 마무리 정리

| 단계 | 방법                          | 권장도 |
|------|-------------------------------|--------|
| 1    | Prompt Engineering            | 매우 추천 |
| 2    | RAG Context with Schema DB    | 추천 |
| 3    | Instruction Tuning (LoRA)     | 중장기 도입 고려 |
| 4    | SFT or Full Fine-Tuning       | 고비용 프로젝트에만 권장 |
| 5    | Tokenizer Customization       | 충분한 이유 있을 때만 |
