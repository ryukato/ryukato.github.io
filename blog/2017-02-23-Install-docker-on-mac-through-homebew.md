---
slug: Install docker on Mac with homebrew
title: Install docker on Mac with homebrew
authors: ryukato
date: 2017-02-23 09:36:55
tags: [Docker, homebrew]
---

<!-- truncate -->

# Install Docker on Mac with Homebrew

## virtualbox 설치하기

```
brew cask install virtualbox
```

## Docker 설치하기

```
brew install docker docker-compose docker-machine
```

## Virtual Machine 생성하기

docker image로부터 생성한 container를 실행하기 위한 Virtual Machine을 생성하는 과정이다.

## VM 생성

dev라는 이름의 Virtual Machine을 생성한다. 생성 후 해당 vm은 자동 실행된다.

```
docker-machine create -d virtualbox dev
```

## VM 실행 확인

```
docker-machine status dev
```

###### output

```
running
```

## VM 중지

VM 중지하고, 다시 시작할 경우, docker-cli를 위해 필요한 환경변수 가져오기의 script를 다시 실행해야 docker run [container-name]을 실행할때 에러없이 실행할 수 있다.

```
docker-machine stop dev
```

## docker-cli를 위해 필요한 환경변수 가져오기

```
eval "$(docker-machine env dev)"
```

## Docker container 실행

```
docker run hello-world
```

###### output
아래와 같은 메세지를 보면 성공

```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://cloud.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/engine/userguide/
```
