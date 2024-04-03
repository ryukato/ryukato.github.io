---
slug: XRP Ledger Integration
title: XRP Ledger Integration
authors: ryukato
date: 2018-02-22 09:36:55
tags: [ripple, 리플, 번역]
---

#  XRP LEDGER INTEGRATION
(source: https://ripple.com/build/gateway-guide/#xrp-ledger-integration)


## Before Integration
이후 예제에서 사용될 거래소인 ACME는 이미 출금과 예금을 할 수 있는 시스템을 갖추고 있으며 이런 서비스를 고객에게 제공하고 있다. 그리고 개별 고객의 잔고를 추적하고 기록하는 시스템을 가지고 있다. 이런 시스템은 대차 대조표(이후 장부)와 개별 고객의 보유 통화량을 추적하는 것으로 표현할 수 있다.

다음의 다이어그램을 보면, ACME 거래소는 처음 €5를  수중에 가지고 있다.  €5 중 €1는 밥에게, €2는 찰리에게 속해있으며, €2의 ACME의 순자산이다. 앨리스가 €5를 저금하여 ACME는 대차 대조표(이후 장부)에 앨리스와 앨리스가 저금한 금액을 기재한다. 따라서 총 금액은 €10이 된다.

![](https://ripple.com/wp-content/themes/ripple-beta/assets/img/e2g-01.png)

>
> **가정**:  XRP 원장과 통합을 하기 위해선, ACME과 같은 거래소는 아래와 같은 가정을 만족하는 것으로 본다.
>
> * ACME는 이미 예금/출금을 위한 시스템을 갖추고 있다.
> * ACME는 자신의 원장 시스템에 기록하기 전에 예금을 받아야 한다.
> * ACME는 계약 조건에 따라 필요할 때 인출에 대한 지불을 할 수 있는 충분한 자금을 항상 보유한다.
> 	*  ACME는 비지니스 모델에 따라 예금 인출에 대한 수수료, 최소 인출 및 지연 시간을 설정할 수 있다.

## Sending from Gateway to the XRP Ledger
XRP 원장 지불은 다른 통화들을 자동으로 연결 시킬 수 있지만, 발행 자산을 가질 수 있는 게이트웨이는 보통 고객에게 지급될 수 있는 단일 통화만을 보낸다. 이것은  고객의 현재 잔액을 차변으로 시스템상에 기록한 후에, 차변된 금액과 동일한 양의 발행 자산을 XRP 원장 시스템을  통해 고객의 XRP 원장 주소로 보내는 것을 말한다.

XRP 원장으로의 지금에 대한 예제는 아래와 같다.
1. 앨리스는  그녀의 ACME 잔액인 €3를 XRP 원장으로 보내라고 요청한다.
2. ACME는 시스템상에 앨리스의 잔액 €3를 차감한다. (차변에 기입한다.)
3. 앨리스는  €3를 그녀의XRP 원장 주소로 보냄으로써 ACME XRP 원장 거래를 전송한다. 송금된 €3는 XRP 원장에 ACME에 의해 "발행"된 것으로 표시된다. (3 EUR.ACME)

>
> **가정**
>  
> * 앨리스는 이미 ACME 계좌와는 별개의 XRP원장 주소를 가지고 있다.  앨리스는 제 3자 애플리케이션을 통해 그녀의 XRP 원장 주소를 관리한다.

![](https://ripple.com/wp-content/themes/ripple-beta/assets/img/e2g-02.png)

### Requirements for Sending to XRP Ledger
ACME는 위와 같은 거래를 하기 위해선 다음과 같은 필요조건을 만족해야 한다.

* ACME는 XRP 원장에서 발행 한 돈을 별도로 보관한다. ACME는 발행 자산을 누가 얼마나 보유하고 있는지를 보기 위해 언제든 XRP 원장을 조회할 수 있다. 이를 위한 방법들은 아래와 같다.
	* ACME는 ACME의 기록 시스템에 XRP Ledger 담보 계좌를 만들 수 있다.
	* ACME는 XRP 원장에 할당 된 자금을 별도의 은행 계좌에 저장할 수 있다.
	* ACME가 암호화폐 거래소라면, ACME는 별도의 지갑(wallet)을 생성하여 XRP 원장에 할당된 자금을  보관할 수 있다. 생성된 지갑(wallet)은 ACME(gateway)가 지불 능력이 있다는 것을 고객에게 공개적으로 입증할 수 있는 증거로 사용할 수 있다.
* ACME는 XRP 원장의 주소를 반드시 통제해야한다. 별도의 발급 주소와 운영 주소를 사용하는 것을 권장한다. 상세 내용은 [Issuing and Operational Addresses](https://ripple.com/build/issuing-operational-addresses/) 참고.
	* ACME는 고객이 발급을 보내고받을 수 있도록 발급 주소에 [DefaultRipple](https://ripple.com/build/gateway-guide/#defaultripple) 플래그를 사용해야합니다.
* 앨리스는 XRP Ledger 주소에서 ACME의 발급 주소로 회계 관계 (트러스트 라인)를 만들어야 한다. 앨리스는 ACME의 발급 주소를 알고있는 한 XRP 원장 클라이언트 응용 프로그램을  통해 해당 작업을 수행 할 수 있습니다.
	* ACME는 고객이 찾을 수 있도록 발급 주소를 공개해야 한다. ACME는 ripple.txt를 사용하여 자동화된 시스템에 발급 주소를 게시할 수 있다.
* ACME must create a user interface for Alice to send funds from ACME into the XRP Ledger.
	* ACME는 Alice의 XRP Ledger 주소를 알아야한다. ACME는 Alice가 XRP Ledger 주소를 인터페이스의 일부로 입력하게하거나 ACME가 Alice에게 XRP Ledger 주소를 미리 입력하고 확인할 것을 요구할 수 있다.

지불을 XRP 원장으로 보내는 방법의 예는 [고객에게 지급하기](https://ripple.com/build/gateway-guide/#sending-payments-to-customers) 를 참조하면 된다.

## Sending from XRP Ledger to Gateway
// TODO - continue
