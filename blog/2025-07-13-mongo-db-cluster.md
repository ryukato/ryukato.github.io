---
slug: MongoDB_Cluster 
title: Mongo DB cluster using docker-compose 
authors: ryukato
date: 2025-07-13 12:56:00
tags: [Mongo, Cluster]
---

<!-- truncate -->

# 🧱 MongoDB 클러스터 구성 with Docker Compose

MongoDB의 Replica Set(복제셋)을 Docker Compose로 구성하고, `rs.initiate()` 자동 실행 및 관리 UI(mongo-express)까지 연동하는 실습입니다.

---

## 📦 구성 요소

- `mongo1`, `mongo2`, `mongo3`: Replica Set을 구성하는 3개의 MongoDB 노드
- `mongo-express`: 웹 UI 기반 MongoDB 관리자 도구
- `replica-init`: 클러스터 초기화를 수행하는 일회성 컨테이너

---

## 📁 디렉토리 구조

```
.
├── docker-compose.yml
├── .env
├── secrets/
│   └── mongo.key              # replica set용 인증 keyFile
├── mongo-init/
│   └── init-replica.sh        # 클러스터 자동 초기화 스크립트
└── mongo-express/
    ├── Dockerfile             # wait-for 기능 포함
    └── wait-for.sh
```

---

## 🛠 `.env` 파일 예시

```env
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=example

ME_CONFIG_MONGODB_ADMINUSERNAME=root
ME_CONFIG_MONGODB_ADMINPASSWORD=example
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=admin

MONGODB_URI=mongodb://root:example@mongo1:27017/?replicaSet=rs0
```

---

## 🔑 secrets/mongo.key

```bash
# 생성 방법
openssl rand -base64 756 > secrets/mongo.key
chmod 400 secrets/mongo.key
```

---

## 🐳 `docker-compose.yml`

```yaml
version: "3.9"

services:
  debug-busybox:
    image: busybox
    command: sleep 3600
    networks:
      - sample-app
  #  mongodb cluster, express and exporter for prometheus
  mongo1:
    image: mongo:6.0
    container_name: mongo1
    ports:
      - "27017:27017"
    volumes:
      - ./data/mongo1:/data/db
      - ./secrets/mongo.key:/etc/mongo.key:ro
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
    command: ["--replSet", "rs0", "--auth", "--keyFile", "/etc/mongo.key"]
    networks:
      - sample-app

  mongo2:
    image: mongo:6.0
    container_name: mongo2
    ports:
      - "27018:27017"
    volumes:
      - ./data/mongo2:/data/db
      - ./secrets/mongo.key:/etc/mongo.key:ro
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
    command: ["--replSet", "rs0", "--auth", "--keyFile", "/etc/mongo.key"]
    networks:
      - sample-app

  mongo3:
    image: mongo:6.0
    container_name: mongo3
    ports:
      - "27019:27017"
    volumes:
      - ./data/mongo3:/data/db
      - ./secrets/mongo.key:/etc/mongo.key:ro
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
    command: ["--replSet", "rs0", "--auth", "--keyFile", "/etc/mongo.key"]
    networks:
      - sample-app

  replica-init:
    image: mongo:6.0
    container_name: mongo-init
    depends_on:
      - mongo1
    volumes:
      - ./scripts/init-replica.sh:/init-replica.sh:ro
    entrypoint: [ "/bin/bash", "/init-replica.sh" ]
    networks:
      - sample-app

  mongo-express:
    image: mongo-express:1.0.0-alpha.4
    container_name: mongo-express
    restart: always # mongo1으로 접속 실패 시, 재 시작
    ports:
      - "38081:8081"
    environment:
      - ME_CONFIG_MONGODB_URL=${MONGODB_URI}
      - ME_CONFIG_MONGODB_ADMINUSERNAME=${ME_CONFIG_MONGODB_ADMINUSERNAME}
      - ME_CONFIG_MONGODB_ADMINPASSWORD=${ME_CONFIG_MONGODB_ADMINPASSWORD}
      - ME_CONFIG_BASICAUTH_USERNAME=${ME_CONFIG_BASICAUTH_USERNAME}
      - ME_CONFIG_BASICAUTH_PASSWORD=${ME_CONFIG_BASICAUTH_PASSWORD}
    depends_on:
      - mongo1
    networks:
      - sample-app

  mongodb-exporter:
    image: percona/mongodb_exporter:0.40.0
    container_name: mongodb-exporter
    ports:
      - 9216:9216
    environment:
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - mongo1
    networks:
      - sample-app

networks:
  sample-app:
    driver: bridge

```

---

## 🧪 클러스터 자동 초기화 스크립트

`mongo-init/init-replica.sh`

```bash
#!/bin/bash

echo "[replica-init] Waiting for MongoDB to be ready..."

until mongosh --host mongo1 --username root --password example --authenticationDatabase admin --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 2
done

echo "[replica-init] Connected. Checking replica set status..."

# 이미 초기화되었는지 확인
IS_INITIALIZED=$(mongosh --host mongo1 --username root --password example --authenticationDatabase admin --quiet --eval "try { rs.status().ok } catch(e) { 0 }")

if [[ "$IS_INITIALIZED" == "1" ]]; then
  echo "[replica-init] Replica set already initialized. Skipping."
else
  echo "[replica-init] Initializing replica set..."
  mongosh --host mongo1 --username root --password example --authenticationDatabase admin <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
})
EOF
  echo "[replica-init] Replica set initialized."
fi
```

---

## 🚀 실행

```bash
docker compose up -d
```

---

## ✅ 접속 정보

- MongoDB URI: `mongodb://root:example@localhost:27017/?replicaSet=rs0`
- Mongo Express: [http://localhost:8081](http://localhost:8081)  
  로그인: `admin` / `admin`

---

## 🧠 마무리 Tip

- `rs.status()`에서 primary/secondary가 잘 분배되었는지 확인
- Docker volume을 유지하면 재기동 시에도 구성 유지됨
- mongo-express는 접속 실패 시 자동 재시작됨 (`restart: always`)
