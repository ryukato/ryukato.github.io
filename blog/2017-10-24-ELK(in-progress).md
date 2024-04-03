---
slug: ELK 정리중
title: ELK 정리중
authors: ryukato
date: 2017-10-24 16:57:29
tags: [ELK]
---

<!-- truncate -->

# ELK (Elasticsearch, Logstash, Kibana)
ELK (Elasticsearch, Logstash, Kibana)를 통해 애플리케이션 혹은 시스템의 로그들을 수집하여 검색 및 분석을 할 수 있는 환경을 구성할 수 있다.

## Logstash
파일, TCP, HTTP 등의 [다양한 입력 소스](https://www.elastic.co/guide/en/logstash/current/input-plugins.html)를 통해들어 오는 데이터를 수집할 수 있는 파이프라인을 제공한다. 들어오는 데이터를 가공할 수 있으며, Elasticsearch로 데이터를 전송할 수 있다.

### 설치
#### 사전 조건
Logstash 설치를 위해선 Java 8이 설치되어 있어야 한다. Java 8설치 유무를 확인하기 위해 아래의 명령어를 실행한다.
만약 Java 8이 설치 되어 있지 않다면, [Java 8 다운로드](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)페이지를 통해 다운로드 하여 설치한다.

###### java version 확인

```
java -version
```
###### java version 확인 결과

```
java version "1.8.0_65"
Java(TM) SE Runtime Environment (build 1.8.0_65-b17)
Java HotSpot(TM) 64-Bit Server VM (build 25.65-b01, mixed mode)
```
(*위의 Java version 값은 로컬 환경에 설치된 Java에 따라 다를 수 있다.)

#### 설치 및 설정
Logstash 설치를 위한 설치 파일을 직접 [다운로드](https://www.elastic.co/downloads/logstash)할 수 있다.

##### Binary 파일을 통한 설치
윈도우 환경에 설치를 진행하기 위한 [ZIP 파일](https://artifacts.elastic.co/downloads/logstash/logstash-5.0.0.zip)을  다운로드하여 설치하고자 하는 경로에 압축을 풀면 된다.

##### 리눅스 환경
##### 유닉스 환경
##### 맥 환경
[Homebrew](https://brew.sh/)를 통해 Logstash를 설치 할 수 있다. 설치를 위해 아래의 명령어를 실행한다.

```
brew install logstash
```


### 구성

![](https://www.elastic.co/guide/en/logstash/current/static/images/basic_logstash_pipeline.png)
(* *출처: www.elastic.co*)

위의 이미지에서 볼 수 있듯이 Logstash는 기본적으로 input, filter 그리고 out이라는 구성요소를 가지고 있다. Input과 output은 필수 요소이고 filter는 필요에 따라 구성할 수 있다. 아래의 명령어를 통해 콘솔을 통한 입/출력 하는 가장 기본적인 구성으로 Logstash를 실행할 수 있다.

```
bin/logstash -e 'input {stdin { } } output { stdout { } } '
```
(* 위에서 사용은 ```-e``` 옵션은 Logstash의 설정을 명령어를 통해 직접 입력 할 수 있게 해준다.)

위의 명령어를 실행한 후, 명령어 창에 ```hello world``` 를 입력하면 입력한 ```hello world``` 가 바로 출력되는 것을 볼 수 있다.

#### 기본 설정 구성
위에서 언급한 것처럼 Logstash 설정 파일은 input, filter 그리고 output으로 구성이 되어 있다. 아래는 템플릿으로 사용 가능한 설정 파일 내용이다.

```
# The # character at the beginning of a line indicates a comment. Use
# comments to describe your configuration.
input {
}
# The filter part of this file is commented out to indicate that it is
# optional.
# filter {
#
# }
output {
}
```

#### Input
##### File
Logstash가 설치된 로컬 환경에 존재하는 파일의 내용을 input으로 설정하여 처리할 수 있다. 아래는 로컬 파일을 처리하기 위한 설정의 예이다.

```
input {
  file {
    path => "/tmp/access_log"
    start_position => "beginning"
  }
}
```

##### FileBeat를 통한 File 처리
Filebeat를 통해 pipeline을 구축할 수 있다. 다만 Beats input plugin이 먼저 설치되어 있어야 한다.
(* Beats input plugin은 Logstash 설치 시 기본으로 함께 설치된다. )

> Note: 일반적으로 Filebeat는 Logstash가 설치된 machine과는 다른 machine에 설치하여 실행한다.

Filebeat 설치 및 설정은 [Filebeat](#toc_22)를 참조하면 된다.

Filebeat 설치 후, 아래와 같은 설정을 통해 Logstash와 연동 시킬 수 있다.

###### Filebeat 설정
```
filebeat.prospectors:
- type: log
  paths:
    - /path/to/file/logstash-tutorial.log
  output.logstash:
    hosts: ["localhost:5044"]
```

###### Logstash Filebeat input 설정
아래의 내용은 Logstash에서 Filebeat의 내용을 input으로 설정하는 것으로 Beats input plugin을 사용한다.

```
input {
  beats {
    port => "5044"
  }
}
filter {
  json {
    source => "message"
    target => "message"
  }
}
output {
  stdout { codec => rubydebug }

  elasticsearch {
    hosts => ["localhost:9200"]
    index => "application-log-%{+YYYY.MM.dd}"
    workers => 1
    user => elastic
    password => changeme
  }
}

```

###### filter 설정
```
filter {
  json {
    source => "message"
    target => "message"
  }
}
```
위와 같은 filter 설정에 대해 좀 더 설명하면, 애플리케이션에서 남기는 로그 형태가 JSON 형태일때 Filebeat는 해당 로그를 JSON으로 인식하여 읽어 들이지 않는다. 즉, 일반 문자열로 읽어 들이기 때문에 로그 내용이 아래와 같을 경우 큰 따옴표(")를 escaping 처리한다. 따라서 Logstash의 input으로 해당 로그 내용이 전달이 되면 json filter를 통해 정상적인 JSON 형식으로 만들어 주어야 한다.

###### 애플리케이션에서 남긴 로그 예제

```
...
"{
	"method ": "GET ",
	"userAgent ": {
		"operatingSystem ": "MAC_OS_X ",
		"browser ": "SAFARI "
	},
	"@timestamp ": "2017 - 11 - 22 T18: 40: 41.639 + 09: 00 ",
	"instanceId ": "localhost"
}"
...

```

###### Filebeat가 읽어 들인 로그 예제

```
...
"{
  \"method \":\"GET \",
  \"userAgent \": {
    \"operatingSystem \":\"MAC_OS_X \",
    \"browser \":\"SAFARI \"
  },
  \"@timestamp \":\"2017 - 11 - 22 T18: 40: 41.639 + 09: 00 \",
  \"instanceId \":\"localhost\"
}"
...

```

###### Logstash json filter 처리 후 내용 예제

```
...
"message" => {
  "instanceId" => "localhost",
  "method" => "GET",
   "userAgent" => {
    "operatingSystem" => "MAC_OS_X",
    "browser" => "SAFARI"
  }
}
...
```

위와 같은 설정 방법이 아닌 다른 방법으로는 [Filebeat의 processor](https://www.elastic.co/guide/en/beats/filebeat/master/filtering-and-enhancing-data.html#using-processors)를 사용하면 된다. 아래는 Filebeat에서 읽어 들인 내용을 JSON으로 처리하기 위한 예제 설정 내용이다. 아래의 설정에 추가적으로 사용된 [json 옵션](https://www.elastic.co/guide/en/beats/filebeat/master/configuration-filebeat-options.html#config-json)을 살펴보면 된다.

```
filebeat.prospectors:
- type: log
  paths:
    - /path/to/file/logstash-tutorial.log
  json.keys_under_root: true
  json.overwrite_keys: true
processors:
  -decode_json_fields:
    fields: ["message"]

output:
  logstash:
    hosts: ["localhost:5044"]
```

##### TCP, UDP
Logstash는 TCP 혹은 UDP을 input으로 사용할 수 있다. 아래는 TCP, UDP를 사용한 예제 설정이며 Logstash는 9600 포트를 통해 TCP, UDP input을 처리하도록 설정된다.

```
tcp {
    port => 9600
    type => syslog
  }
  udp {
    port => 9600
    type => syslog
  }
```
input data의 형식이 JSON 형식일 경우 아래와 같이 codec을 추가하여 준다.

```
tcp {
    port => 9600
    type => syslog
    codec =>   json {
      charset => "UTF-8"
    }
  }
  udp {
    port => 9600
    type => syslog
    codec =>   json {
      charset => "UTF-8"
    }
  }

```

##### HTTP
[Logstash의  http plugin](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-http.html)을 사용하여 HTTP(S)를 통해 단일 혹은 multiline을 입력 받을 수 있도록 할 수 있다. Http를 통해 들어 오는 내용의 Content-Type에 해당 하는 codec이 사용된다. 예를 들어 Content-Type이 application/json일 경우, **json** codec이 사용된다. 반면 다른 Content-Type에 대해선 **plain** codec이 사용된다.

HTTP의 기본 인증 표준을 지원하며, SSL 설정에 따라 https를 통해 들어 오는 데이터를 처리할 수 있다. 인증서 설정은 [Java Keystore format](https://docs.oracle.com/cd/E19509-01/820-3503/ggfen/index.html)을 통해 가능하다.

사용 가능한 옵션들은 [Http Input Configuration Options](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-http.html#plugins-inputs-http-options)를 참고하면 된다.

간단한 설정 예제는 아래와 같다.

```
input {
  http {
    host => "localhost"
    port => 9600
    user => "elastic"
    password => "changeme"
  }
}
```

#### Filter
Logstash의 pipeline을 통해 읽어 들인 로그에서 원하는 정보를 뽑아내거나, 해당 로그를 원하는 형태로 만들기 위해선 filter를 사용해야 한다. Logstash는 다양한 filter plugin을 지원하면 이중 하나인 [grok filter](http://www.elastic.co/guide/en/logstash/6.0/plugins-filters-grok.html)를 살펴본다.

Grok filter를 통해 들어오는 로그 데이터의 일정한 패턴을 분석하여 구조화된 그리고 검색 가능한 데이터로 변경할 수 있다.  Grok filter는 기본적으로 정규식을 사용하여 표현 할 수 있다. Logstash는 다양한 filter pattern을 기본 제공하고 있으며, [https://github.com/logstash-plugins/logstash-patterns-core/tree/master/patterns](https://github.com/logstash-plugins/logstash-patterns-core/tree/master/patterns) 이곳에서 원하는 filter를 검색하여 사용할 수 있다.

##### Grok Basics
Grok pattern의 사용 문법은 ```%{SYNTAX:SEMANTIC}``` 이며, **SYNTAX**는 로그의 내용 중 뽑아내고자 하는 부분의 패턴을 의미한다. 예를 들어 로그 내용 중 **3.44**라는 숫자 값을 뽑아낼려면 **NUMBER** pattern을 사용하면 된다.
그리고 **SEMANTIC**은 SYNTAX를 통해 일치된 부분을 식별하기 위한 식별자를 의미한다. 예를 들어 이미 언급한 NUMBER pattern을 통해 뽑아낸 3.44가 duration을 의미한다면 **SEMANTIC**에 duration을 설정하면 된다.

```
%{NUMBER: duration}
```
##### 정규식 표현
Grok에서 사용하는 정규식 표현 라이브러리는 Oniguruma로 지원 가능한 상세 표현식은 [Oniguruma Site](https://github.com/kkos/oniguruma/blob/master/doc/RE)에서 확인 가능하다.

##### 사용자 정의 패턴
Logstash가 제공하지 않는 패턴을 사용하기 위해 아래와 같이 직접 패턴을 정의할 수 있다.

```
(?<queue_id>[0-9A-F]{10,11})
```
또한 자주 사용하는 패턴의 경우 다음의 단계를 통해 저장해서 재 사용 할 수 있다.
* **patterns**라는 이름으로 폴더를 생성한다.
* 사용할 pattern을 포함한 파일명을 지정하여 저장한다.
* 해당 파일에 사용할 패턴을 작성하여 저장한다.

```
# contents of ./patterns/postfix:
POSTFIX_QUEUEID [0-9A-F]{10,11}
```
위의 패턴을 사용한 예제는 아래와 같다.

###### 로그 내용

```
Jan  1 06:25:43 mailserver14 postfix/cleanup[21403]: BEF25A72965: message-id=<20130101142543.5828399CCAF@mailserver14.example.com>
```

###### filter 설정 내용

```
filter {
  grok {
    patterns_dir => ["./patterns"]
    match => { "message" => "%{SYSLOGBASE} %{POSTFIX_QUEUEID:queue_id}: %{GREEDYDATA:syslog_message}" }
  }
}
```

###### 결과 항목
* timestamp: Jan 1 06:25:43
* logsource: mailserver14
* program: postfix/cleanup
* pid: 21403
* queue_id: BEF25A72965
* syslog_message: `message-id=<20130101142543.5828399CCAF@mailserver14.example.com>`

##### Grok Filter Configuration Options
Grok filter 설정 시 사용 가능한 상세 옵션은 [상세 옵션](https://www.elastic.co/guide/en/logstash/6.0/plugins-filters-grok.html#plugins-filters-grok-options)을 통해 확인 가능하다.


#### Output
//TODO

## Elasticsearch
//TODO

## Kibana
//TODO

## Filebeat
Filebeat는 파일에 담겨 있는 로그 내용을 수집하여 원격의 Logstash로 전송하기 위한 도구 이다. Logstash를 설치하게 되면 Filebeat와 연동 가능한 Beats input plugin이 기본적으로 함께 설치되어 있다. Logstash는 Beats input plugin를 통해 Elastic Beats framework으로부터의 이벤트를 수신하게 된다.

### 설치
#### 윈도우에 설치
* 윈도우에 Filebeat를 설치하기 위해선 [다운로드 페이지](https://www.elastic.co/downloads/beats/filebeat)에서 ZIP 파일을 다운 받는다.
*  다운로드한 압축 파일을 **C:\Program Files** 하위에 압축을 풀어 준다.
*  폴더 명을 **Filebeat**로 변경한다.
*  PowerShell을 관리자 권한으로 실행한다.
*  Filebeat를 윈도우 서비스로 실행하기 위해 아래의 명령어를 PowerShell창에 입력하고 실행한다.

```
PS > cd 'C:\Program Files\Filebeat'
PS C:\Program Files\Filebeat> .\install-service-filebeat.ps1
```

#### 윈도우이외의 환경에 설치

##### deb

```
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-6.0.0-amd64.deb
sudo dpkg -i filebeat-6.0.0-amd64.deb
```

##### rpm

```
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-6.0.0-x86_64.rpm
sudo rpm -vi filebeat-6.0.0-x86_64.rpm
```
##### mac

```
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-6.0.0-darwin-x86_64.tar.gz
tar xzvf filebeat-6.0.0-darwin-x86_64.tar.gz
```
(* homebrew를 통해 Filebeat를 설치 할 경우, **/usr/local/Cellar/filebeat/6.0.0/.bottle/etc/filebeat** 밑dp filebeat.reference.yml 파일과 filebeat.yml 파일이 존재한다.)

##### docker

```
docker pull docker.elastic.co/beats/filebeat:6.0.0
```

### 설정
Filebeat는 filebeat.yml파일을 통해 설정 내용을 관리한다. Filebeat는 참조용 설정 파일인 **filebeat.reference.yml**을 제공한다. 각 환경별 filebeat.yml의 위치는 아래와 같다.
* rpm, deb : /etc/filebeat/filebeat.yml
* Docker: /usr/share/filebeat/filebeat.yml
* Mac, Windows: 압축 푼 경로내에 위치.

#### 샘플 설정 파일

```
filebeat.prospectors:
- type: log
  enabled: true
  paths:
    - /var/log/*.log
    #- c:\programdata\elasticsearch\logs\*
```
Filebeat 설정은 다음과 같은 단계를 거쳐 진행하면 된다.
##### 로그 파일의 위치를 지정한다.  
Filebeat 설정의 가장 기본적인 단계로 하나의 prospector를 다음과 같이 정의 할 수 있다.

```
filebeat.prospectores:
- type: log
  enabled: true
  paths:
    - /var/log/*.log
  output.logstash:
    hosts: ["localhost:5044"]
```
위에 설정한 내용처럼 설정된 prospector는 ```/var/log``` 하위의 모든 log 확장자를 가진 파일의 내용을 수집하게 된다. 단, 현재는 디렉토리의 모든 하위 디렉토리에있는 모든 파일을 재귀 적으로 가져올 수 없다.

##### output 설정
###### Logstash로 보내기
아래와 같이 hosts 옵션을 통해 다수의 Logstash 서버를 지정할 수 있으며 Beats connection을 위해 사용되는 5044 포트를 설정한다.  아래와 같이 설정하여 운영하기 위해선 Elasticsearch에 직접 index template을 생성해야 한다.

```
output.logstash:
  hosts: ["localhost:5044"]
```

###### Elasticsearch로 바로 보내기
Filebeat가 수집한 내용을 Elasticsearch로 바로 보낼 수 있는데, 이를 위한 설정은 아래와 같다. Elasticsearch에 보안 목적의 사용자 계정과 비밀번호가 설정되어 있는 경우에는 username, password를 꼭 설정해야 한다.

```
output.elasticsearch:
  hosts: ["localhost:9200"]
  username: elastic
  password: changeme
```

###### Kibana에 dashboard 설정
Kibana에 Filebeat가 제공하는 샘플 dashboard를 다음과 같이 설정할 수 있다.

```
setup.kibana:
  host: "localhost:5601"
  username: elastic
  password: changeme
```

## 기타 사항
Logstash의 geoip plugin 사용 시, client의 ip가 **127.0.0.1**인 경우, **_geoip_lookup_failure**가 발생한다.


## 참고 자료
### Filebeat
* [filebeat-reference-yml](https://www.elastic.co/guide/en/beats/filebeat/6.0/filebeat-reference-yml.html)
