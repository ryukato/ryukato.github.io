---
slug: Money in the XRP Ledger
title: Money in the XRP Ledger
authors: ryukato
date: 2018-02-01 09:36:55
tags: [ripple, 리플, 번역]
---

# Money in the XRP Ledger
(source: https://ripple.com/build/money-xrp-ledger/)

## XRP
XRP 원장 시스템에서 사용 가능한 **XRP**는 네이티브 통화입니다. XRP 원장상의 모든 계정(account)들은 XRP를 다른 계정으로 보낼 수 있습니다. 그리고 리저브(reserve)라는 최소한의 XRP를 보유하고 있어야 합니다. XRP를 하나의 XRP 원장 주소에서 다른 XRP 원장 주소로 보내 수 있으며, 이때 게이트웨이나 유동성 제공자들은 필요가 없습니다. XRP를 연결 통화로 사용할 수 있습니다.

Escrow와 Payment channel같은 XRP 원장 시스템의 몇몇 고급 기술들은 XRP로만 사용할 수 있습니다.  주문서 자동 할당(autobridging)은 발행 된 두 통화의 주문서를 XRP 주문서와 병합하여 합성 결합 주문서를 작성함으로써 분산 형 교환의 유동성을 높이기 위해 XRP를 사용합니다. (예를 들어, 자동 할당(autobridging)은  USD:XRP와 XRP:EUR 주문들을 USD:EUR 주문서로 일치 시킵니다.)

XRP는 네트워크 스패밍(spamming)에 대한 보호 수단으로도 사용됩니다. 모든 XRP 원장 주소들은 XRP 원장의 유지비용을 지불하기 위한 적은 양의 XRP를 필요로 합니다.  [거래](트랜잭션) 비용과 [준비금](reserve)은 XRP로 정한 중립 수수료이며 어느 당사자에게도 지급되지 않습니다. 원장의 데이터 형식에 맞춰서, XRP는 [최상위계정 객체](AccountRoot objects)로 저장이 됩니다.

### XRP 속성들
최초의 원장은 1000억 XRP를 가지고 있고, 새로운 XRP는 생성되지 않습니다. XRP는 [거래 비용](https://ripple.com/build/transaction-cost/) 혹은 누구도 소유하고 있지 않은 주소로 전송됨으로 인해 소멸되는 선천적으로 [디플레이션](https://en.wikipedia.org/wiki/Deflation)의 성질을 가지고 있습니다. 하지만 고갈되지는 않을까 하는 걱정은 하지 않아도 됩니다. 현재의 소멸율을 보았을때, 모든 XRP가 소멸되는데는 7만년이 걸리며, XRP의 가격과 수수료는 총 공급량에 따라 조정됩니다. [참고](https://ripple.com/build/fee-voting/ )

기술적으로, 0.000001 XRP에 가장 가깝게 정확히 측정된 XRP를 "드랍(drop)"이라고 합니다. [```rippled``` APIs](https://ripple.com/build/rippled-apis/)들은 드랍으로 표시된 XRP를 필요로 합니다. 예를 들어 1 XRP는 1000,000 드랍으로 표현할 수 있습니다. 보다 자세한 내용은 [currency format reference](https://ripple.com/build/currency-format/)를 참고하세요.

## Issued Currencies 발생 통화
XRP를 제외한 모든 다른 통화들은 발행 통화(issued currency)입니다. 때로 "issuances" 혹은 "IOU"라고 불리는 이런 디지털 자산들은 회계 관계로 추적되며, 이를 계정(?) 주소들간의 "**trust line**"들이라고 합니다. 발행 통화는 일반적으로 한쪽의 부채 그리고 다른쪽의 자산이며, trust line의 균형은 어느 관점에서 보느냐에 따라 음수 혹은 양수일 수 있습니다. 모든 주소(address)들은 XRP가 아닌 다른 통화를 발행할 수 있지만, 다른 주소들이 얼마를 보유할지에 대한 의사에 따라서만 제한이 됩니다.

발행자와 보유자들이 동일한 통화 코드를 사용한다면, 발행된 통화들은 발행자와 보유자들을 통해 "ripple" 될 수 있습니다. 몇몇의 경우에는 이를 잘 활용할 수 있겠지만,  다른 경우에 기대하지 못했던 혹은 원치않는 결과를 초래할 수 있습니다.  trust line간의 "rippling"을 방지하기 위해서 [NoRipple flag](https://ripple.com/build/understanding-the-noripple-flag/)를 사용할 수 있습니다.

발행 통화들은 XRP와 함께 거래될 수 있거나 XRP 원장의 분산된 교환을  통해 서로 거래될 수 있습니다.

일반적인 모델의 경우, 하나의 발행 통화는  XRP 원장 시스템 외부의 다른 자산 혹은 통화의 보유량을 나타냅니다. 해당 통화의 발행자를 *gateway*라고 부르며, XRP 원장내에서 발행된 통화와 동일한 잔액에 대한 XRP 원장 외부의 통화를 교환하기 위한 예금 및 인출을  처리합니다. (??) gateway 운영에 대한 자세한 내용은 [Gateway Guide](https://ripple.com/build/gateway-guide/)를 참고하세요.

XRP 원장에는 발행 된 통화에 대한 다른 사용 사례가 있습니다. 예를 들어, 보조 주소로 고정 금액의 통화를 발행 한 다음 발급자에게 "키를 버리는"방법으로 "초기 코인 제공"(ICO)을 생성 할 수 있습니다. (?? 이게 무슨 의미일까?)

### Issued Currency Properties
XRP 원장에서의 모든 발행 통화는 trust line내에 존재하며, [RippleState objects](https://ripple.com/build/ledger-format/#ripplestate)로서의 원장의 데이터로 표현됩니다. 발행 통화를 생성하려면, 발행 주소를 가진 주체는 발행자와 trust line을 가지고 있는 주소로 해당 통화에 대한 0이 아닌 제한과 함께 [Payment transaction](https://ripple.com/build/transactions/#payment)을 보내야 합니다. (trust line을 "통한" rippling을 하여 발생 통화를 생성할 수 있습니다.) 발행자에게 발행 통화를 되돌려 보내 발행 통화를 상쇄할 수 있습니다.

통화의 발행자는 두 단체가 발행 통화로 거래를 할때 공제할 만큼의 이체 수수료 비율을 정의 할 수 있습니다.

주소자들(Addresses)은 관할 지역의 금융 규제를 준수하기 위해 발행 통화를 [동결](https://ripple.com/build/freeze/) 시킬 수도 있습니다. 동결 기능을 원치 않거나, 통화를 동결 시키는 것을 원하지 않을 경우, 개별 trust line을 동결 시키고 전역(global) 동결을 취소할 수 있는 본인의 주소의 능력을 사용하지 않을 수 있습니다. XRP는 동결 될 수 없습니다.

발행 통화는 모든 종류의 통화나 자산을 표현하기 위한 용도로 설계되었습니다. 표현 가능한 통화나 자산은 아주 적은 혹은 아주 큰 명목적인 값을 가질 수 있습니다. 통화 코드와 발행 통화의 제한에 대한 보다 상세한 기술적인 내용은 [currency format reference](https://ripple.com/build/currency-format/)를 참조하세요.
