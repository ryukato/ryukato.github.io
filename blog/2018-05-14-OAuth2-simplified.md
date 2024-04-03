---
slug: OAuth2 Simplified
title: OAuth2 Simplified
authors: ryukato
date: 2018-05-14 16:52:19
tags: [OAuth2]
---

원본: https://aaronparecki.com/oauth-2-simplified/

# OAuth2
## OAuth2 Simplified

### Roles
#### Client
OAuth2에서 Client는 제 3자가 개발했거나, 개발하는 애플리케이션을 말한다. 해당 애플리케이션은 애플리케이션에서 필요한 사용자 정보에 접근 하길 원하고 사용자 정보에 접근하기위해서는 사용자 정보를 가지고 있는 서비스(애플리케이션) 혹은 사용자로부터 승인을 받아야 한다.

#### Resource Server
Resource Server는 사용자 정보에 접근할 수 있는 API를 제공하는 애플리케이션(혹은 서비스)를 말한다.

#### Authorization Server
Authorisation Server는 Client, 즉, 제 3자의 애플리케이션으로부터 사용자 정보에 접근하고자 하는 요청을 사용자가 승인하거나 혹은 거절할 수 있는 인터페이스를 제공하는 애플리케이션 혹은 서비스를 말한다.  규모가 작은 경우, Resource Server와 함께 구현될 수 있으며, 규모가 큰 경우는 별도의 애플이케이션 혹은 서비스로 구현한다.

#### Resource Owner
사용자에 해당하며, 자신의 정보에 접근을 필요로 하는 애플리케이션의 요청을 승인하거나 거절할 수 있다.

###  Creating App (Client)
OAuth2를 통한 인증 처리를 위해선 먼저 App(Client)를 등록해야 한다. App을 등록할때 App이름, 웹 사이트 주소, 로고 및 기타 등등의 정보를 함께 등록한다. 또한 사용자를 돌려보낼 주소인 **redirectURI**를 반드시 등록해야 한다.

#### Redirect URIs
Authorization 서비스는 등록된 URI으로만 사용자를 이동 시킨다. 그 이유는 악의적인 공격을 방지하기 위해서이며, **redirectURI**는 **TLS 보안**으로 보호되어야 한다. 따라서 Authorization 서비스는 **“https”**로 시작하는 **redirectURI**로만 사용자를 보내야 한다. 이렇게 함으로써 인증 과정중에 토큰(token)이 탈취되는 것을 방지 할 수 있다. Native App은 **redirectURI**를 `demoapp://redirect`와 같은 사용자 정의 URL Schema를 사용하여 등록할 수 있다.

#### Client ID와 Secret
Authorization 서비스를 통해 App(Client) 등록을 완료하게 되면, 응답으로 **client ID**와 **client secret**을 받게 된다. **client ID**는 일반적인 ID와 같은 값으로 로그인을 할때 주소 혹은 로그인 코드에 직접 추가하면 된다. 하지만 **client secret**은 보안을 요하는 값으로 SPA와 같이 **client secret**을 보안적으로 안전하게 보관할 수 없다면, 해당 값을 응답으로 발급하는 것은 적절하지 않다.

### Creating an Application
OAuth2 service와 연동하기위해서는 미리 애플리케이션을 등록해야 한다. 애플리케이션 등록을 통해 **client_id**와 **client_secret**을 발급 받을 수 있다. 또한 애플리케이션을 등록할때 **redirect_url**들을 등록하여, 인증과정에서 등록되지 않은 주소로 사용자를 redirection 시키는 것을 방지 할 수 있다.

애플리케이션의 등록 예는 [Github](https://github.com/settings/developers)를 통해 확인해볼 수 있다.

### Redirect URLs and State
OAuth2는 악의적인 의도를 가진 공격자에 의해 access-token이 탈취되는 것을 방지하기 위해 사전에 등록된 redirect-url로만 사용자를 보내도록 한다. 또한 운영 환경에서 redirect-url들은 반드시 https를 사용한 주소이어야 한다. 만약 https를 사용하지 않는다면 반드시 다른 방안을 통해 access-token이 공격자에 의해 탈취되지 않도록 해야 한다.

state 매개변수를 통해 사용자가 redirect url로 보내졌을때, 인증 요청 시 사용된 값과 동일한지를 검증하여 외부 공격에 대한 방어 수단으로 사용할 수 있다. 또한 애플리케이션의 여러 페이지에서 인증 요청을 할 수 있는 경우에, state값을 사용하여 어느 페이지에서 요청을 했는지를 구분할 수 있으며, 인증이 완료된 후, 해당 페이지로 사용자를 보낼 수 있다.


### Authorization
OAuth2의 첫번째 단계는 사용자로부터 인증을 받는 것으로, 웹 기반의 앱이나 모바일 앱의 경우 사용자에게 앱이 요청한 권한에 대해 승인을 할 수 있는 인터페이스를 제공해야 한다.

OAuth2는 여러 **grant type**들을 제공하는데, 각 **grant type**에 대한 use case는 다음과 같다.

* Authorization Code: web-server, 브라우져 기반의 앱과 모바일 앱을 위한 grant type
* Password: 사용자 계정(아이디, 패스워드)로 로그인 할 수 있는 grant type
* Client credentials: 사용자 정보에 대한 접근 및 사용 요청이 아닌, 등록된 App(Client) 자신의 정보를 확인하거나 수정하기 위한 용도의 grant type.
* Implicit: 예전에는 **secret**을 포함하지 않고 사용하도록 권장되었지만 **secret**없이 **Authorization Code** grant type으로 대체된 grant type.

위의 각 use case에 대한 상세 설명은 다음의 개별 부분에서 상세히 다룬다.

### Web Server Apps
OAuth2 인증 방식을 사용할 경우, Web server 애플리케이션은 가장 일반적인 형태의 애플리케이션이다. 서버 개발 언어로 작성되며, 작성된 코드들은 외부로 공개되지 않기 때문에, **client secret**을 사용할 수 있다.

#### Authorization
Web server 애플리케이션에서 authorization server로 로그인 요청은 아래와 같다. (* 로그인 요청 주소는 구현 시 변경이 가능하다. 첨부되는 매개변수들이 중요하다.)

```
https://authorization-server.com/auth?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=SCOPE&state=STATE
```

* response_type=code: response_type를 *code*로 하게 되면 응답으로 code=authorization-code 형태로 인증 코드를 받을 수 있다.
* client_id: 사전에 app을 등록하여 받은 아이디 값
* redirect_uri: 인증 절차를 마친 후, 사용자를 보낼 주소를 말한다.
* scope: 사용자의 정보 중, 어떤 정보를 원하는지를 의미하는 것으로 사전에 정의해야 한다.
* state: 무작위로 생성된 값을 사용하되, 응답에 포함된 *state*값과 일치 여부를 검증하여 응답의 정합성을 검증할 수 있다.

위의 요청 전송 후, 사용자는 해당 요청을 허용할지 혹은 거절할 지를 결정할 수 있는 인터페이스를 보게 된다. 사용자가 해당 요청을 허용할 경우, 사용자는 **redirect_uri**에 설정된 주소로 보내지게 되며, 이때 첨부되는 매겨변수들은 아래와 같이 **code**, **state** 이다.

`https://example-app.com/callback?code=AUTHORIZATION_CODE&state=STATE`

* code: Authorisation code값이다. 하지만 최종적인 Access Token 값은 아니다.
* state: 요청을 전송할 때 첨부된 **state**값과 동일한 값이어야 한다.

위와 같은 응답을 받은 후에, **state**값이 요청을 보낼 때 첨부한 값과 동일한 지 검증해야 한다. 보통 state 값을 쿠키나 세션에 저장해놓았다가 응답을 받은 후에 응답에 첨부된 **state**값과 동일한 지 비교한다.  **state**값의 동일 여부 검증으로 악의적으로 임의의 주소로 보내 authorrization code를 바꿔치는 것을 방지 할 수 있다.

#### Token Exchange
인증 코드(Authorization code)를 받은 다음, 다음과 같이 **Access Token**을 받기 위한 요청을 보낼 수 있다.

```
POST https://api.authorization-server.com/token
grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=REDIRECT_URI&
client_id=CLIENT_ID&
client_secret=CLIENT_SECRET*
```

* `grant_type=authorization_code` : Authorization code를 통해 `Access Token`을 받는 다는 것을 명시한다.
* `code=AUTHORIZATION_CODE`:  이전 Authorization 단계에서 받은 `AUTHORIZATION_CODE`를 전달해야 한다.
* `redirect_uri=REDIRECT_URI`: 이전 Authorization 단계에서 사용했던 값과 다른 값을 사용해야 한다. `Access Token`이 첨부된 정상적인 응답을 처리할 페이지 주소를 전송해야 한다.
* `client_id=CLIENT_ID`: 사전에 app을 등록하여 받은 아이디 값
* `client_secret=CLIENT_SECRET`: 사전에 app을 등록할때 받은 `client_secret` (* `client_secret` 값은 server쪽에 안전한 곳에 보관해야 한다.)

위와 같이 각 항목에 올바른 값을 넣어 전송하게 되면, 아래와 같이 `Access Token`을 받게 된다.

```
{
"access_token": "RsT5OjbzRn430zqMLgV3Ia",
"expires_in": 3600
}
```

* access_token: `Access Token` 값으로 이후 요청을 전송할 때 마다, 보통 헤더에 첨부하는 값이다.
* expires_in: 응답으로 받은  `Access Token`은 무한정 사용할 수 없으며, `expires_in`에 명시된 시간(milli-seconds) 이후에 사용이 만료된다.

> 주의
> 위의 예제에서는 `redirect_uri`를 요청 시 첨부하였지만, 일반적으로 app을 등록할 때 함께 등록하는 것이 보안상 더 안전하다.

### Single-Page Apps
  브라우져 기반으로 작동하게 되는 Single-Page App들의 경우, 애플리케이션을 구성하는 페이지들의 전체 소스코드들이 브라우져를 통해 확인이 가능하다. 따라서 외부로 노출이 되면 안되는 **client_secret**을 코드 상에 선언하여 사용할 수 없으며, **client_secret**을 애플리케이션이 가지고 있도록 하는 것은 바람직하지 않다.  

Access-Token을 받는 과정은 위에 언급된 과정들과 대부분 유사하지만, 마지막에 Access-Token과 authorisation code를 교환하는 과정에서 **client_secret**은 사용하지 않는다.

> 참고
> 이전에는 브라우져 기반의 애플리케이션에서 *Implicit* grant_type을 사용하도록 하였으나, 현재 상황에서  **client_secret**을 사용하지 않는 **authorization code flow**을 업계 표준으로 하고 있다.

#### Authorization
`https://authorization-server.com/auth?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=photos&state=1234zyx`

* code: **authorization code**를 요청한다는 의미이다.
* client_id: 사전에 app을 등록하여 받은 아이디 값
* redirect_uri: 인증 절차를 마친 후, 사용자를 보낼 주소를 말한다.
* scope: 사용자의 정보 중, 어떤 정보를 원하는지를 의미하는 것으로 사전에 정의해야 한다.
* state: 무작위로 생성된 값을 사용하되, 응답에 포함된 *state*값과 일치 여부를 검증하여 응답의 정합성을 검증할 수 있다.

위의 요청 전송 후, 사용자는 해당 요청을 허용할지 혹은 거절할 지를 결정할 수 있는 인터페이스를 보게 된다. 사용자가 해당 요청을 허용할 경우, 사용자는 **redirect_uri**에 설정된 주소로 보내지게 되며, 이때 첨부되는 매겨변수들은 아래와 같이 **code**, **state** 이다.
* code: Authorisation code값이다. 하지만 최종적인 Access Token 값은 아니다.
* state: 요청을 전송할 때 첨부된 **state**값과 동일한 값이어야 한다.

위와 같은 응답을 받은 후에, **state**값이 요청을 보낼 때 첨부한 값과 동일한 지 검증해야 한다. 보통 state 값을 쿠키나 세션에 저장해놓았다가 응답을 받은 후에 응답에 첨부된 **state**값과 동일한 지 비교한다.  **state**값의 동일 여부 검증으로 악의적으로 임의의 주소로 보내 authorrization code를 바꿔치는 것을 방지 할 수 있다.

#### Token Exchange

```
POST https://api.authorization-server.com/token
  grant_type=authorization_code&
  code=AUTH_CODE_HERE&
  redirect_uri=REDIRECT_URI&
  client_id=CLIENT_ID
```

* `grant_type=authorization_code` : Authorization code를 통해 `Access Token`을 받는 다는 것을 명시한다.
* `code=AUTHORIZATION_CODE`:  이전 Authorization 단계에서 받은 `AUTHORIZATION_CODE`를 전달해야 한다.
* `redirect_uri=REDIRECT_URI`: 이전 Authorization 단계에서 사용했던 값과 다른 값을 사용해야 한다. `Access Token`이 첨부된 정상적인 응답을 처리할 페이지 주소를 전송해야 한다.
* `client_id=CLIENT_ID`: 사전에 app을 등록하여 받은 아이디 값
