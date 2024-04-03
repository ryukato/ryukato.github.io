---
slug: CURRENCY FORMATS
title: CURRENCY FORMATS
authors: ryukato
date: 2018-02-01 09:36:55
tags: [ripple, 리플, 번역]
---

<!-- truncate -->

# CURRENCY FORMATS
(source: https://ripple.com/build/currency-format/)

XRP 원장은 두 종류의 금전을 가지고 있습니다. 하나는 XRP이며 나머지는 발행 통화입니다. XRP 원장에서, XRP와 발행 통화는 서로 다른 형태를 띄지만 두 종류 모두 높은 정확성을 가집니다.

## String Formatting
XRP 원장 API들은 일반적으로 XRP와 발행통화의 수량을 나타내는 숫자값에 대해 네이티브 JSON 숫자 타입보다 **문자열(string)**을 사용합니다. **문자열(string)**을 사용하면 JSON 파서를 사용할 때 정밀도가 떨어지는 것을 방지할 수 있습니다. JSON 파서는 자동으로 모든 JSON 번호를 부동 소수점 형식으로 나타낼 수 있습니다. String 값 내에서 숫자는 기본 JSON 숫자와 같은 방식으로 직렬화됩니다.

* Base-10, 기본 10진수
* Non-zero-prefaced. 0으로 시작하지 않는 숫자.
* 소수점을 포함할 수 있습니다. 예를 들어 1/2은 0.5로 표현할 수 있습니다. (어메리칸 스타일이지만 유럽 스타일은 아닙니다.)
* 10의 제곱근의 표현으로 "E" 혹은 "e"를 포함할 수 있습니다. 예를 들어 "1.2E5"는 1.2 * 10^5 혹은 120000과 동일합니다.
* 콤마는 사용되지 않습니다.

## XRP Precision
XRP는 64-bit 부호없는 정수만큼의 정확도를 가지며, 개별 단위는 0.000001 XRP입니다. 속성은 아래와 같습니다.

* 최소값은 ```0```
* 최대값은 ```100000000000``` (10^11) XRP
	* ```100000000000000000``` (10^17) XRP 드랍(drop)
* ```0.000001```(10^-6) XRP에 가장 가까운 정확도
	* ```1``` XRP 드랍(drop)

## Issued Currency Precision
XRP 원장상의 발행 통화들은 다음의 정확도 형식으로 표현됩니다.

* 최소 0이 아닌 절대값: ```1000000000000000e-96```
* 최대값: ```9999999999999999e80```
* 최소값: ```-9999999999999999e80```
* 15 소수자리의 정확도

## Issued Currency Math
[소스코드](https://github.com/ripple/rippled/blob/35fa20a110e3d43ffc1e9e664fc9017b6f2747ae/src/ripple/protocol/impl/STAmount.cpp)
![](https://cdn.ripple.com/wp-content/uploads/2017/11/currency-number-format.png)

내부적으로, ```rippled```는 사용자 정의 숫자 형식으로 발행된 통화의 수를 나타냅니다. 이 형식은 일반적으로 매우 작은 또는 매우 큰 단위로 측정되는 것을 포함하여 다양한 자산을 저장할 수 있습니다. 일반적인 부동 소수점 표현과 달리, 이 형식은 모든 계산에 정수 수학을 사용하므로 십진수 15자리의 정밀도를 유지합니다. "임의 정밀도" 숫자 형식과 달리 사용자 지정 형식은 항상 64 비트 고정 크기로 저장 할 수 있습니다.

해당 내부 형식은 부호 비트(sign bit),  significant digits 그리고 지수부 이렇게 세개의 부분으로 구성되어 있습니다. 부호 비트를 통해 금액이 양수 인지 음수 인지를 구분합니다. significant digits는 ```1000000000000000```부터 ```9999999999999999```까지(```9999999999999999``` 포함)의 범위 내의 정수를 사용하여 표현됩니다. 단, 값이 ```0```일 경우에는 ```0```으로 표기 됩니다. 지수는 -96에서 +80까지의 범위에서 유효 자릿수 (10의 유효 자릿수를 곱해야하는)의 크기를 나타냅니다. 어떤 양을 기록 하기전에, ```rippled```은 해당 값을 정규화 하여  significant digits과 지수값이 범위내에 있도록 합니다. 예를 들어 1 단위 값의 정규화된 표현식은 ```1000000000000000e-15```입니다. 내부적인 계산에서 사용하는 값은 일반적으로 정수를 사용하여 항상 15자리의 digit의 정확한 결과가 나오도록 되어 있습니다. 곱셈과 나눗셈은 최하위 자리에서 오버런을 보상하기위한 조정을합니다.

네트웍을 통해 XRP가 아닌 자산을 전송하거나 원장에 기록할때, 해당 양(금액)은 64비트 형식으로 변환됩니다. 가장 중요한 비트인 첫번째 비트를 통해 해당 금액이 XRP인지 발행 통화인지를 구분합니다. 1이면 XRP가 아닌 발행 통화입니다. 다음 비트는 부호 비트로, 1은 양수 0은 음수를 나타냅니다. (*주의 : 이것은 대부분의 다른 숫자 표현에서 부호 비트가 작동하는 것과 반대입니다!*) 다음의 8자리 비트는 지수부이며, 나머지 54 비트는 significant digits를 나타냅니다.

## Currency Codes
모든 XRP가 아닌 발행 통화는 XRP원장상에서 160 비트의 통화 코드를 가집니다. ```rippled```[API](https://ripple.com/build/rippled-apis/)들은 표준 매핑을 사용하여 ASCII문자열인 3 문자를 160 비트의 통화 코드로 매핑합니다. ```XRP``` 통화 코드는 발행 통화에서는 사용할 수 없습니다. 동일한 통화코드를 사용하는 통화는 연결된 trustline들을 통해 ```rippled```될 수 있습니다. 통화 코드에는 XRP 원장에 내장 된 다른 동작이 없습니다.

### Standard Currency Codes
표준 통화는 아래와 같은 비트 구조를 가집니다.
![](https://cdn.ripple.com/wp-content/uploads/2017/11/currency-code-format.png)

1. 첫번째 8비트들은 반드시 ```0x00```이어야 합니다.
2. 다음의 96 비트들은 예약된 비트들이며, ```0```으로 채워져야 합니다.
3. 다음의 24 비트들은 ASCII 문자인 3개의 문자를 나타냅니다. [ISO 4217](http://www.xe.com/iso4217.php) 코드들을 사용할 것을 권장합니다. 혹은 "BTC"와 같은 대중적인 pseudo-ISO 4217를 사용할 것을 권장합니다. 그런데, 다음의 문자들을 사용한 모든 조합들을 허용하며, 모든 대문자, 소문자 숫자 그리고 ```?```, ```!```, ```@```, ```#```, ```$```, ```%```, ```^```, ```&```, ```*```, ```<```, ```>```, ```(```, ```)```, ```{```, ```}```, ```[```, ```]``` 그리고 ```|``` 문자들을 사용할 수 있습니다.
4. 다음의 8비트는 통화의 버전을 나타냅니다. 만약 동일한 통화가 다른 값으로 재 발행된 경우에는, 해당 값을 증가 시켜 현재의 통화들을 분리시켜 보관하도록 해야 합니다.
5. 다음의 24비트들은 예약된 비트들로 ```0```으로 채워야 합니다.

### Nonstandard Currency Codes
통화 코드로 015841551A748AD2C1F76FF6ECB0CCCD00000000과 같은 160 비트 (40 자) 16 진수 문자열을 사용하여 다른 유형의 통화를 발행 할 수도 있습니다. 다른 통화 코드 유형으로 분류되는 것을 방지하기 위해, 첫번째 8 비트들은 반드시 ```0x00```으로 설정하면 안됩니다.

> Deprecated
> 이자 보상(interest bearing)혹은 지연 보상(demurraging) 통화 코드 유형을 지원하는 [ripple-lib](https://github.com/ripple/ripple-lib)의 몇몇 이전 버전. 해당 통화들은 첫 8 비트가 ```0x01```을 가집니다. 이자 보상(interest bearing)혹은 지연 보상(demurraging) 통화 코드 유형은 더 이상 지원되지 않지만, 원장 데이터에서 발견될 수 있습니다. 상세 내용은 [지연 보상](https://ripple.com/build/demurrage/)을 참고하세요.