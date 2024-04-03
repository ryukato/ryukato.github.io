---
slug: Spring-boot_with_Docker
title: Spring-boot_with_Docker
authors: ryukato
date: 2017-09-28 09:36:55
tags: [Java, Spring, Spring-boot, Docker]
---

# Spring-boot with Docker

## Docker 설치하기

#### home brew로 docker 설치

##### virtualbox 설치하기

```
brew cask install virtualbox
```

##### Docker, docker-compose, docker-machine 설치

```
brew install docker docker-compose docker-machine
```

## Docker VM 생성
### Docker VM 확인
이미 생성된 Docker VM(Virtual Machine)이 있다면 추가로 설치를 하지 않아도 된다. (해도 상관은 없다)
아래의 명령어를 실행하여 이미 생성된 VM이 있는 지 확인한다.
```
docker-machine ls
```
### Docker VM 생성
사용 가능한 VM이 없다면 아래의 명령어를 실행하여 VM을 생성한다.
```
docker-machine create --driver virtualbox [vm name]
docker-machine env [vm name]
eval "$(docker-machine env [vm name])"
```
위의 첫번째 라인은 virtualbox 드라이버로 vm name에 해당하는 VM을 생성하는 명령이다.
두번째 라인은 생성된 VM의 환경 변수들을 확인하는 명령이다.
마지막 라인은 docker-cli로 필요한 환경 변수들을 가져오기 위한 명령이다.

#### docker-maven-plugin추가 및 설정
##### pom 파일 수정
application project를 docker image로 만들기 위해선 docker-maven-plugin를 추가해야 한다.

```
<build>
        <plugins>
        ...
            <plugin>
                <groupId>com.spotify</groupId>
                <artifactId>docker-maven-plugin</artifactId>
                <configuration>
                    <skipDockerBuild>false</skipDockerBuild>
                    <imageName>${project.artifactId}</imageName>
                    <dockerDirectory>${basedir}/src/main/docker</dockerDirectory>
                    <resources>
                        <resource>
                            <targetPath>/</targetPath>
                            <directory>${project.build.directory}</directory>
                            <include>${project.build.finalName}.jar</include>
                        </resource>
                    </resources>
                </configuration>
            </plugin>
            ...
        </plugins>
    </build>
```
#### Dockerfile 추가
Dockerfile은 Docker container image를 생성하기 위한 base image, 포트 및 파일 추가 등의 지시사항들을 포함하고 있는 파일이다.
Spring boot application을 실행하기 위해선 일단 컨테이너(base image)를 만들거나 가져와야 하며 packiging된 application(war 혹은 jar)파일을 컨테이너에 복사해야 하는 일련의 작업을 Dockerfile에 기술해야 한다.
내용은 아래와 같다.

```
FROM frolvlad/alpine-oraclejdk8:slim
VOLUME /tmp
EXPOSE 8888
ADD [packiging된 application 파일명] app.jar
RUN sh -c 'touch /app.jar'
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom", "-Dspring.profies.active=prod","-jar","/app.jar"]
```
첫번째 라인은 컨테이너를 맨땅에서 생성하는게 아닌 base image를 가지고 만드는데 이때 사용할 base image를 가져오기 위한 명령이다.
두번째 라인은 임시로 volume을 mount하는 명령이며
세번째 라인은 application에서 사용할 port를 지정한다.
네번째 라인은 packiging된 application을 app.jar라는 이름으로 컨테이너에 추가하는 명령이다.
다섯번째 라인은 현재의 컨테이너 image에서 명령어를 실행하기 위한 것이고
마지막은 컨테이너를 실행가능하도록 설정하기 위한 명령어 이다. 내용은 Javar application을 실행하고 옵션을 전달하는 내용이다.
Dockerfile에 추가할 수 있는 지시사항들은 [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)를 참조하면 된다.

#### Dockerfile image 생성
applicaiton project의 root 경로로 이동하여 아래의 명령어를 실행하게 되면 이미지가 생성이 된다.
단 아래의 명령어를 실행하기 전에 docker-cli로 필요한 환경 변수들을 가져와야 한다. 즉 아래의 명령어를 이미지 생성 전에 반드시 실행하는 것이 좋다.

```
eval "${docker-machine env [vm name]}"
```


##### maven wrapper 사용
project내에 mvnw(혹은 mvnw.cmd)파일이 있다면 아래의 명령을 실행하면 된다.

```
./mvnw clean package docker:build -Dmaven.test.skip=true
```

##### maven 사용

```
mvn clean package docker:build -Dmaven.test.skip=true
```

#### Docker 컨테이너 실행
생성된 Docker 컨테이너 이미지를 통해 컨테이너를 실행해야 한다.  아래의 명령어를 통해 Docker 컨테이너를 실행한다.

```
docker run --rm -p 8888:8888 -e spring.profiles.active=prod --name=[컨테이너 이름] [컨테이너 이미지 이름]
```
* **--rm**옵션은 이미 컨테이너가 존재하면 삭제하기 위한 옵션이다.
* **--name** 옵션은 Docker 컨테이너의 이름을 지정하기 위한 옵션이다.
* **-p**는 Docker 컨테이너를 실행하는 Host의 port와 Docker 컨테이너의 port를 매핑하여 노출시키기 위한 옵션이다. Docker 컨테이너를 생성할때 8888로 지정하였다. 그리고 Host(예 Local 컴퓨터)의 특정 포트를 해당 컨테이너의 포트(8888)로 연결시켜 주어야 한다.
* 추가적으로 **-e**옵션을 주어 컨테이너에서 실행할 application에서 사용할 환경 변수를 설정할 수 있다.
* 마지막으로 실행할 컨테이너의 이미지를 지정해야 한다. 컨테이너 이미지명은 *docker-maven-plugin추가 및 설정*의 **imageName**과 동일하게 지정하면 된다.

#### Docker 컨테이너 실행 확인
docker-cli를 통해 현재 실행중인 컨테이너들을 확인할 수 있다. 확인 명령은 아래와 같다. 아래의 명령어를 실행하여 현재 컨테이너의 상태를 확인 할 수 있으며 application의 api등을 호출하여 application의 실행 상태를 확인 할 수 있다.

```
docker ps -a
```

##### 실행 결과
실행 결과는 아래와 같으며 각 항목의 의미는 쉽게 파악할 수 있다.

```
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                    PORTS                    NAMES
cdd0d48aa4d4        config-service      "java -Djava.secur..."   3 minutes ago       Up 2 minutes              0.0.0.0:8888->8888/tcp   config-server
```

## 참고
* https://github.com/indrabasak/docker-example
* https://docs.docker.com
* http://chanwookpark.github.io/spring/aws/docker/배포/2016/02/03/springboot-aws-docker/#spring-boot-애플리케이션에-docker-설정하기
