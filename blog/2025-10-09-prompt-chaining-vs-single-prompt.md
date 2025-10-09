---
slug: prompt-chaining-vs-single-prompt
title: 프롬프트 체이닝은 항상 정답일까?
authors: ryukato
date: 2025-10-09 15:31:00
tags: [llm, prompt-engineering, langchain, keyword-extraction]
---

# 프롬프트 체이닝은 모든 상황에서 최적일까?

LLM을 활용하여 텍스트에서 키워드를 추출하거나 정보를 구조화할 때, 막연히 **프롬프트 체이닝(Prompt Chaining)**이 더 좋은 결과를 만들어줄 것이라 기대보다는 테스트를 통해 **단일 프롬프트(single prompt)** 방식과 비교 분석하여 어떤 방법이 자신의 상황에 더 적합한지 선택하는 것이 좋을 것으로 생각됩니다.

---

<!-- truncate -->

## ✅ 핵심 요약

- **Prompt Chaining은 항상 더 좋은 결과를 보장하지 않는다.**
- **단일 Prompt와 Chaining 구조를 반드시 실험적으로 비교해야 한다.**
- 특히 문맥이 복합적인 경우, 체이닝은 정보 손실을 유발할 수 있다.

---

## 1️⃣ 프롬프트 체이닝 방식 예시 (LangChain)

> Note
>
> 아래의 코드는 프롬프트 체이닝(Prompt Chaining)의 동작 원리와 구조를 이해하기 위한 간단한 예시일 뿐입니다. 실제 환경에서는 사용하는 모델의 성능, 처리 대상 데이터의 복잡도, 실시간 응답 요구 수준 등에 따라 구조와 적용 방식이 달라질 수 있습니다. 특히 체이닝 방식은 상황에 따라 기대한 만큼의 품질 향상을 보장하지 않거나, 오히려 성능 저하를 유발할 수 있습니다. 따라서 아래 코드를 그대로 사용하는 것보다는, 각자의 목적과 환경에 맞게 테스트 및 조정하는 것이 중요합니다.

아래는 LangChain 기반의 **3단계 Prompt Chaining 구조** 예시이다.  
1단계에서 텍스트를 정제(cleaning)하고,  
2단계에서 키워드를 추출하며,  
3단계에서 후처리를 수행한다.

```python
# pip install langchain langchain-core langchain-community langchain-ollama
from langchain_core.prompts import PromptTemplate
from langchain_ollama import OllamaLLM
import json, re

llm = OllamaLLM(model="gemma2:2b", temperature=0)

# Step 1. 텍스트 정제
clean_prompt = PromptTemplate.from_template("""
You are a preprocessor for drug keyword extraction.
Clean the input text by:
- Removing parentheses and explanations (e.g., (항염))
- Splitting joined words like 진통·소염
- Removing suffixes such as 들, 형, 제형, 의약품
- Normalizing plurals to singular

Input:
{text}

Cleaned:
""")
clean_chain = clean_prompt | llm

# Step 2. 키워드 추출
extract_prompt = PromptTemplate.from_template("""
You are a keyword extractor for drug efficacy and medication-related descriptions.
Extract the most relevant and searchable **keywords** from the input text.

Focus on:
- Treatment effects (진통, 소염, 해열)
- Symptoms (근육통, 피부가려움)
- Patient groups (임산부, 노인)
- Product names (타이레놀)
- Manufacturer (신신제약)
- Ingredients (아세트아미노펜)
- Dosage forms (파스, 정제, 연고)
Return a JSON array only.
Input:
{text}
Output:
""")
extract_chain = extract_prompt | llm

# Step 3. 후처리
def parse_json_array(output: str):
    try:
        return json.loads(output.strip())
    except Exception:
        match = re.search(r"\[(.*?)\]", output, re.DOTALL)
        return json.loads("[" + match.group(1) + "]") if match else []

def normalize_keywords(keywords: list[str]):
    result = []
    for kw in keywords:
        kw = re.sub(r"(들|형|제형|의약품)$", "", kw.strip())
        if kw and kw not in result:
            result.append(kw)
    return result

def extract_drug_keywords(text: str):
    cleaned = clean_chain.invoke({"text": text})
    raw = extract_chain.invoke({"text": cleaned})
    keywords = normalize_keywords(parse_json_array(raw))
    return sorted(set([kw for kw in keywords if kw in text]))

# 테스트 실행
if __name__ == "__main__":
    query = """임산부와 노인들을 대상으로, 진통·소염 작용이 있는 파스형 의약품으로,
    신신제약이 제조한 타이레놀 제품은 아세트아미노펜을 주성분으로 함.
    근육통, 관절통, 요통, 어깨결림 등의 증상에 사용됨."""
    print("체이닝 방식 결과:", extract_drug_keywords(query))
```

---

## 2️⃣ 단일 프롬프트 방식 예시 (Ollama API)

```python
from string import Template
import json, ollama, re

MODEL_NAME = "gemma2:2b"
prompt_template = """
You are a keyword extractor for drug efficacy and medication-related descriptions.

1. **Keyword Extraction Focus:**  
   My goal is to extract only the most relevant and searchable **keywords** from drug-related text.  
   These include:
   - Treatment effects (e.g., 진통, 소염, 해열)
   - Disease or symptom names (e.g., 근육통, 피부가려움)
   - Intended patient groups (e.g., 임산부, 노인, 영유아)
   - Product names (e.g., 타이레놀)
   - Manufacturer names (e.g., 신신제약)
   - Active ingredients (e.g., 아세트아미노펜, 이부프로펜)
   - Dosage forms / drug formulations (e.g., 연고, 정제, 파스)
   - Pharmacological classifications (e.g., 해열진통제, 항히스타민제)

   These keywords will be used for drug search and classification, so completeness and precision are important.

   Note:  
   Some dosage forms may appear as common Korean words, but in the context of drug descriptions, they must be treated as searchable keywords.  
   Please always extract the following as keywords when mentioned:

   - "파스": A medicated plaster for muscle and joint pain.
   - "연고": Ointment or topical cream.
   - "정제": Tablet form medication.
   - "주사제": Injectable formulation.
   - "캡슐": Capsule-type formulation.
   - "시럽": Liquid formulation often for children.

   Similar terms that describe drug delivery methods (e.g., topical, oral, injection) are also valid dosage form keywords.

2. **Output Format:**  
   Return a JSON array containing only the extracted keywords, without any explanation or additional formatting:
   ["keyword1", "keyword2", "keyword3", ...]

3. **Rules & Context:**
   - Always include all mentioned patient groups, product names, manufacturer names, and active ingredients.
   - Extract only short and specific terms related to symptoms, effects, ingredients, dosage forms(drug formulations), or pharmacological classification.
   - Do not include dosage units (e.g., mg, %, ml), filler phrases, or general descriptions.
   - Avoid vague, overly broad, or repetitive terms.
   - Output must be deduplicated and clean.

4. **Short Terms:**  
   Normalize terms to short, domain-specific Korean forms where appropriate:
   - "fever" → "해열"  
   - "pain relief" → "진통"  
   - "muscle pain" → "근육통"  
   - "Tylenol" → "타이레놀"  
   - "Shinshin Pharm" → "신신제약"

---

**Example Input:**
임산부와 노인들을 대상으로, 진통·소염 작용이 있는 파스형 의약품으로, 신신제약이 제조한 타이레놀 제품은 아세트아미노펜을 주성분으로 함. 근육통, 관절통, 요통, 어깨결림 등의 증상에 사용됨.

**Expected Output:**
["임산부", "노인", "진통", "소염", "파스", "신신제약", "타이레놀", "아세트아미노펜", "근육통", "관절통", "요통", "어깨결림"]

Now process this:
$user_input
"""

def generate_llm_output(_user_input: str):
    prompt = Template(prompt_template).substitute(user_input=_user_input)
    response = ollama.generate(model=MODEL_NAME, prompt=prompt)
    return response["response"]

def parse_json_array(output: str):
    try:
        return json.loads(output.strip())
    except Exception:
        match = re.search(r"\[(.*?)\]", output, re.DOTALL)
        return json.loads("[" + match.group(1) + "]") if match else []

def normalize_keywords(keywords: list[str]):
    result = []
    for kw in keywords:
        kw = re.sub(r"(들|형|제형|의약품)$", "", kw.strip())
        if kw and kw not in result:
            result.append(kw)
    return result

def extract_keywords(user_input: str):
    raw = generate_llm_output(user_input)
    keywords = normalize_keywords(parse_json_array(raw))
    return sorted(set([kw for kw in keywords if kw in user_input]))

if __name__ == "__main__":
    query = """임산부와 노인들을 대상으로, 진통·소염 작용이 있는 파스형 의약품으로,
    신신제약이 제조한 타이레놀 제품은 아세트아미노펜을 주성분으로 함.
    근육통, 관절통, 요통, 어깨결림 등의 증상에 사용됨."""
    print("단일 프롬프트 결과:", extract_keywords(query))
```

---


### 📌 참고: 텍스트 정제 없이 키워드 추출 단계만 분리할 경우

예를 들어, "텍스트 정제" 단계를 생략하고 아래와 같이 키워드 추출을 
`환자군(patient_prompt)`, `증상(symptom_prompt)`, `효능(effect_prompt)`, `제품(product_prompt)` 등으로 
분리하여 실행하는 구조도 생각해볼 수 있다.

이 경우,
- 개별 추출 정확도는 향상될 수 있다.
- 하지만 **LLM 호출이 4회 이상**으로 늘어나기 때문에 **API 응답 시간 증가**, **비용 상승**, **서버 부하 증가** 등의 성능 이슈로 이어질 수 있다.

따라서 실시간 질의 시스템에서는 성능과 품질 간의 **Trade-off**를 고려해야 하며, 분산 처리 혹은 비동기 호출 등의 성능 최적화 기법과 함께 사용될 것을 권장한다.


## 3️⃣ 비교 요약

| 항목 | 프롬프트 체이닝 | 단일 프롬프트 |
|------|------------------|----------------|
| 문맥 유지 | ❌ 약화 가능 | ✅ 유지됨 |
| 키워드 누락 | 높음 (예: 제조사, 제형) | 낮음 |
| 유연성 | ✅ 단계 조정 용이 | ❌ 통합 프롬프트 |
| 품질 | 중간 수준 | 우수 |
| 디버깅 난이도a | 복잡 | 단순 |

---

## 결론

Prompt chaining은 많은 경우에 유용하지만, **한국어 약학 질의**처럼 문맥을 보존하는 것이 중요한 도메인에서는 **단일 프롬프트가 오히려 더 효과적**이다.

> 중요한 것은 **실험과 검증**이다.

---

## 🔗 참고 자료

- [Prompt Chaining Prompt Engineering Guide (Google Doc)](https://docs.google.com/document/d/1flxKGrbnF2g8yh3F-oVD5Xx7ZumId56HbFpIiPdkqLI/edit?tab=t.0)