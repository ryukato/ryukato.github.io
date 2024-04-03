---
slug: Gateway Explained
title: Gateway Explained
authors: ryukato
date: 2018-02-01 09:36:55
tags: [ripple, 리플, 번역]
---

# Gateways Explained
(source: https://ripple.com/build/gateway-guide/#gateways-explained)

## BECOMING AN XRP LEDGER GATEWAY
### Gateways Explained
게이트웨이(Gateway)는 XRP 원장(Ledger)를 통해 들어오고 나가는 금전 그리고 다른 형태의 가치를 제공하는 사업적 모델이다. Issuing Gateway, Private Exchange 그리고 Merchants와 같이 게이트 웨이가 취할 수 있는 대표적인 3가지의 모델은 아래와 같으며 각각 다른 목적과 수행 기능이 다르다.

* Issuing Gateway는 XRP 원장외부에서 금전 혹은 다른 가치 자산을 받아 그에 상응하는 발행(Issuance)를 XRP 원장에 생성한다. 이와 같은 방식을 통해 고객들은 XRP 원장에 금전을 수납 및 출납할 수 있다. XRP를 제외한, XRP 원장내의 모든 통화들은 특정 Issuing Gateway에 묶인 발행(Issuance)의 형태를 가진다.
* Private Exchange는 XRP(Base Coin)를 보유하고 있으며, 자신의 고객들이 XRP를 사고 팔 수 있는 시스템을 가지고 있다. 대부분의 암호화폐들은 해당 암호화폐에 대한 시장을 제공하기 위해 사설 교환소에 의존한다. 하지만 XRP 원장은 통화 교환 기능을 가지고 있으며, 이를 위한 자체 프로토콜을 가지고 있다.
* Merchants는  상품과 서비스에 대한 대가를 XRP 원장을 통해 지불 받습니다. 현재, 리플(Ripple, 회사)는 XRP원장을 사용한 상품 및 서비스에 대한 판매 작업들을 지원합니다.

본 문서는 Issuing Gateway를 운영하는 것에 초점을 맞추어 설명합니다.

#### Trust Lines and Issuances
네이티브 암호화폐인XRP를 제외한, XRP 원장내의 모든 자산은 발행 자산으로 나타낼 수 있습니다. 발행 자산은 통화 혹은 자산 가치로 표현되는 디지털 잔액(balance)입니다. XRP 원장 상에서,  거래 상대방은 발급자의 개입없이 발행 자산을 보내고 거래할 수 있습니다. 일반적으로, 게이트웨이는 고객들로부터 XRP 원장 외부의 시스템과 원장을 통해 발생 자산에 상응하는 금전을 받게되면, 발생 자산들을 고객들에게 보냅니다. 그리고 XRP 원장내의 발행 자산의 상환에 대해 외부 시스템상에서 고객에게 금전을 보냅니다. 발행 자산은 발행 자산이 나타내는 약정에 대한 협약을 통해 가치를 인정 받습니다. 어떤 컴퓨터 시스템도 XRP 원장 게이트웨이가 그러한 의무를 이행하도록 강제 할 수는 없습니다.

XRP 원장은 *trust line*이라는 사용자가 신뢰할 수 있는 거래 상대방의 발행 자산만을 보유할 수 있도록 하는 방향성을 가진 회계적 관계를 가지는 시스템이 있습니다.

"trust line"은 XRP 원장상의 두 주소들 간의 연결이며, 게이트웨이와의 부채 채무를 가지는 명시적인 명세를 나타냅니다. 고객이 게이트웨이로 금전을 보내면, 게이트웨이는 Ripple외부 자산을 보관하며, 금전에 대한 XRP 원장상의 발행 자산을 고객의 주소(account 주소)로 보냅니다. 고객이 XRP 원장 시스템 외부에서 금전을 보내면, 그녀(그)는 게이트웨이로 XRP 원장 지불을 한것이며, 게이트웨이는 고객이 보낸 금전을 자체 시스템 혹은 다른 계정 시스템에 예금처리(대변에 기입) 합니다.

#### XRP
XRP는 XRP 원장의 네이티브 암호화폐입니다. 발행 자산처럼, XRP는 XRP 원장 주소간에 자유롭게 보내고 교환할 수 있습니다. 하지만 발행 자산과 다르게, XRP는 특정 회계적 관계를 가지지 않습니다. XRP는 게이트웨이 혹은 유동성 제공자를 통하지 않고 XRP 원장 주소를 사용하여 한 주소에서 다른 주소로 직접 전송할 수 있습니다. 이런 특성으로, XRP는 중간에서 다른 통화들을 연결 시켜 주는 역활을 하는 통화로 사용할 수 있습니다. 더 자세한 사항은 [XRP Portal](https://ripple.com/xrp-portal/)을 참고해 주세요.

XRP는 또한 XRP 원장상에서 다른 목적으로도 사용됩니다. 네트워크를 대상으로한 spamming 공격을 방어하는 수단으로 사용될 수 있습니다. 모든 XRP 원장 주소들은 XRP 원장을 유지하기 위한 비용으로 사용되는  적은 양의 XRP를 필요로 합니다. 거래비용(transaction cost)와 준비금(reserve)들은 XRP로 표시되며, 어느 당사자에게도 지급되지 않는 중립적인 수수료입니다.

Issuing gateway들은 XRP를 보유하거나 교환할 필요가 없습니다. Issuing gateway들은 네트워크를 통해 거래 전송을 위해 필요한 적은 양의 XRP를 보유 하기만 하면 됩니다. 거래가 많은 게이트웨이에서 적어도 1년치 거래 비용을 충당할 수 있는10 달러 가치의 XRP만을 가지고 있어도 충분합니다.

사설 거래서와 유동성 제공자들은 거래를 위한 추가적인 XRP를 보여할 수 도 있습니다. Ripple (회사)은 XRP를 투기 적 도구로 홍보하지 않습니다.

#### Liquidity and Currency Exchange (유동성과 통화 교환)
XRP 원장에는 사용자가 임의의 조합으로 XRP 및 발급을 교환 할 수있는 입찰을 수행하고 이행 할 수있는 환전이 포함되어 있습니다. 통화간 지불은 거래가 실행될때, 통화를 변환하기 위해 자동으로 통화 교환을 사용합니다. 이러한 방식으로 분산 교환에서 오퍼를 선택하는 사용자는 XRP 원장을 유용하게 만드는 유동성을 제공합니다.(??)

게이트웨이의 발행을 보유한 통화 거래자는 게이트웨이가 다양한 대상 통화로 큰 준비금을 유동시킬 필요없이 다른 대중적인 통화에 유동성을 제공 할 수 있습니다. 게이트웨이는 또한 금전적인 교환에서 발생하는 위험을 감수할 필요가 없습니다. 그러나, 게이트웨이가  XRP 혹은 다른 대중적인 통화에 대한 기본 비율의 유동성을 제공하기를 원할 수 있습니다. 특히 게이트웨이가 교환에 처음인 경우가 그렇습니다. 만약 유동성을 제공한다면, 발생 주소와는 다른 주소를 거래용으로 사용해야 합니다.

제 3의 유동성 제공자들은 분산 거래소(distributed exchange) 에 접근하기 위해 [rippled API](https://ripple.com/build/rippled-apis/), [RippleAPI JavaScript Library](https://ripple.com/build/rippleapi/) 사용할 수 있거나, 제 3자가 제공하는 클라이언트 애플리케이션을 사용할 수 있습니다. 일부 클라이언트 응용 프로그램은 ripple.txt를 사용하여 게이트웨이와 연결된 주소를 조회하므로 좋은 ripple.txt를 게시하는 것이 좋습니다.

게이트웨이와 다른 사람들 사이에 유동성을 확립하는 데 도움이 필요하면 partners@ripple.com에 문의하십시오.

### Suggested Business Practices
XRP 원장에서 게이트웨이의 발행 자산의 가치는 고객이 필요에 의해 게이트웨이를 통해  발행 자산을 구매할 수 있다는 신뢰에서 직접 나온 것입니다. 비즈니스 중단 위험을 줄이려면 다음의 주의 사항을 따르세요.

* 네트워크상에서 위험을 줄이기 위해, 발행과 거래 주소를 분리하여 사용하세요.
* KYC 정보를 수집하기 위한 필요 사항을 포함하는 법규(조례)등을 지키세요.
* Read and stay up-to-date with Gateway Bulletins, which provide news and suggestions for XRP Ledger gateways.
* Publicize all your policies and fees.

#### Hot and Cold Wallets
XRP 원장에서 금융 기관은 일반적으로 손상된 비밀 키와 관련된 위험을 최소화하기 위해 여러 개의 XRP 원장 주소를 사용합니다. 리플은 다음과 같은 역할 분리를 강력하게 권장합니다.

* "cold wallet"이라고도 불리는 하나의 발행 주소를 사용하세요. 해당 주소는 금융기관과의 회계적 관계의 허브 역활을 합니다. 하지만, 가능한 최소한의 거래만을 전송합니다.
* "hot wallet"이라고 불리는 하나 혹은 그 이상의 거래(operational) 주소를 사용하세요. 자동화된, 인터넷에 연결된 시스템들은 이런 주소들에 고객들과 파트너들간의 거래와 같은 매일 매일의 비지니스를 수행하기 위해 비밀키를 사용합니다.
* 선택적으로, "warm wallet"이라고 불리는 대기(standby) 주소를 사용할 수 있습니다. 신뢰할 수 있는 작업자는 이 주소를 사용하여 다른 거래 주소로 돈을 이체할 수 있습니다.

더 많은 정보를 원하면, [Issuing and Operational Addresses](https://ripple.com/build/issuing-operational-addresses/)를 참고하세요.

### Fees and Revenue Sources
XPR 원장 통합을 통해 게이트웨이가 수익을 낼 수 있는 여러 방법이 있으며, 해당 방법들은 아래와 같습니다.

* 출금 및 입금 수수료: 게이트웨이는 일반적으로 XRP 원장에 돈을 추가하고 삭제하기 위한 서비스 제공에 대한 적은 양(예. 1%)의 수수료를 부과합니다. 게이트웨이를 통해 XRP 원장에 돈을 입/출금하는데에 대한 수수료율은 게이트웨이를 구축 및 운영하는 주체가 정할 수 있습니다.
* 이체 수수료: 고객들이 게이트웨이의 발행 자산을 이체할때 자동으로 부과되는 수수료율을 설정할 수 있습니다. 해당 수수료는 XRP 원장 상의 차변(자산의 증가와 비용의 발생, 부채와 자본의 감소)에 해당하며,  발행 자산의 변경이 발생할때 마다 채무를 감소 시킵니다.(?) 자세한 사항은 [TransferRate](https://ripple.com/build/gateway-guide/#transferrate)를 참고하세요.

#### Choosing Fee Rates
게이트웨이는 선택적으로 수수료를 부과할 수 있습니다. 게이트웨이의 서비스가 사용됨에 따라 높은 수수료를 통해 더 많은 수익을 낼 수 있습니다. 반면, 높은 수수료를 부과하게 되면, 게이트웨이의 서비스 이용률이 떨어 질 수 있습니다. 다른 게이트웨이가 부과하는 수수료를 참고하고, 특히 비슷한 통화에 대한 수수료를 참고해야 합니다. 특히 XRP 원장 외부 시스템의 인터넷 송금에 대한 수수료를 참고하세요. 적절한 수수료 구조를 잡는 것이 중요합니다.

### Gateway Compliance
게이트웨이는 현지 규정을 준수하고 적절한 대행사에보고 할 책임이 있습니다. 규정은 국가 및 주마다 다르지만 다음 섹션에서 설명하는보고 및 준수 요구 사항을 포함 할 수 있습니다.

#### Know Your Customer (KYC)
[Know Your Customer (KYC)](https://ripple.com/build/gateway-guide/#liquidity-and-currency-exchange/#know-your-customer-kyc) 참조
#### Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT)
[Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT)](https://ripple.com/build/gateway-guide/#anti-money-laundering-aml-and-combating-the-financing-of-terrorism-cft) 참조
#### Source of Funds
[Source of Funds](https://ripple.com/build/gateway-guide/#source-of-funds) 참조
#### Suspicious Activity Reporting
[Suspicious Activity Reporting](https://ripple.com/build/gateway-guide/#suspicious-activity-reporting) 참조
#### Travel Rule
[Travel Rule](https://ripple.com/build/gateway-guide/#travel-rule) 참조
#### Fee Disclosure and Tracing Funds
[Fee Disclosure and Tracing Funds](https://ripple.com/build/gateway-guide/#fee-disclosure-and-tracing-funds) 참조
#### Office of Foreign Assets Control (OFAC)
[Office of Foreign Assets Control (OFAC)](https://ripple.com/build/gateway-guide/#office-of-foreign-assets-control-ofac) 참조
#### Guidance on Virtual Currency and Money Service Business
[Guidance on Virtual Currency and Money Service Business](https://ripple.com/build/gateway-guide/#guidance-on-virtual-currency-and-money-service-business) 참조



## 참고
### 원장
#### 차변/대변
* 위키디피아 정의: [차변/대변](https://ko.wikipedia.org/wiki/%EB%8C%80%EB%B3%80%EC%B0%A8%EB%B3%80)
