---
slug: PG_Integration 
title: KG 이니시스 연동 시 주의 사항 
authors: ryukato
date: 2025-06-20 17:41:00
tags: [Redis, Cluster, Docker, Mac. M2]
---

<!-- truncate -->

# Setup Redis cluster with docker(compose) on M2
Here is docker-compose.yml file and `redis.conf`

## redis.conf
We need to create conf files for each node with same port but different `cluster-announce-port` and `redis-cli -h localhost -p 26380 -a secret`.

```text
port 6379
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 3000
cluster-announce-ip [host IP]
cluster-announce-port 26379
cluster-announce-bus-port 17000
appendonly yes
requirepass secret
masterauth secret
```

## docker-compose.yml
```yml
version: "3.9"

services:
# for debugging to use ping nslookup and etc.
  debug-busybox:
    image: busybox
    command: sleep 3600
    networks:
      - sample-app
  redis-node-1:
    image: redis:7.2
    container_name: redis-node-1
    volumes:
      - ./redis-data/node1/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "26379:6379"
      - "17000:16379"
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    networks:
      - sample-app
    extra_hosts:
      - "host.docker.internal:host-gateway"

  redis-node-2:
    image: redis:7.2
    container_name: redis-node-2
    volumes:
      - ./redis-data/node2/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "26380:6379"
      - "17001:16379"
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    networks:
      - sample-app
    extra_hosts:
      - "host.docker.internal:host-gateway"

  redis-node-3:
    image: redis:7.2
    container_name: redis-node-3
    volumes:
      - ./redis-data/node3/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "26381:6379"
      - "17002:16379"
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    networks:
      - sample-app
    extra_hosts:
      - "host.docker.internal:host-gateway"

  redis-node-4:
    image: redis:7.2
    container_name: redis-node-4
    volumes:
      - ./redis-data/node4/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "26382:6379"
      - "17003:16379"
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    networks:
      - sample-app
    extra_hosts:
      - "host.docker.internal:host-gateway"

  redis-node-5:
    image: redis:7.2
    container_name: redis-node-5
    volumes:
      - ./redis-data/node5/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "26383:6379"
      - "17004:16379"
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    networks:
      - sample-app
    extra_hosts:
      - "host.docker.internal:host-gateway"

  redis-node-6:
    image: redis:7.2
    container_name: redis-node-6
    volumes:
      - ./redis-data/node6/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "26384:6379"
      - "17005:16379"
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    networks:
      - sample-app
    extra_hosts:
      - "host.docker.internal:host-gateway"

  redis-cluster-init:
    image: redis:7.2
    container_name: redis-cluster-init
    depends_on:
      - redis-node-1
      - redis-node-2
      - redis-node-3
      - redis-node-4
      - redis-node-5
      - redis-node-6
    entrypoint: [ "bash", "-c" ]
    command:
      - >
        sleep 5 &&
        echo yes | redis-cli -a secret --cluster create
        host.docker.internal:26379
        host.docker.internal:26380
        host.docker.internal:26381
        host.docker.internal:26382
        host.docker.internal:26383
        host.docker.internal:26384
        --cluster-replicas 1
    networks:
      - sample-app
    extra_hosts:
      - "host.docker.internal:host-gateway"

networks:
  sample-app:
    driver: bridge
```

## Time to run
Ok, it's time to run and moment of truth. Run following commands.

```shell
docker-compose -f docker-compose.yml up -d
```

### Check
If there is any error during containers are up and running, then you can run following command to connect one of redis node container.

#### Connect a redis node
```shell
redis-cli -h localhost -p 26380 -a secret
```

#### Get List of cluster nodes
```shell
cluster nodes
```

if you run successfully the command on redis-cli, then you can see following results. If not, then please do debug using busybox. :) 

```text
a93fd053554bb8fdb6f1bfaf0a370a143dc3213a 172.20.0.8:6379@16379 slave a3e2edc5f519a7eea1a2bedd3d907ccabc89ae7a 0 1750408699000 3 connected
aaf139c2d79a9cb1d7eb087b57a0a8dcd9c1e671 172.20.0.4:6379@16379 master - 0 1750408699203 1 connected 0-5460
a3e2edc5f519a7eea1a2bedd3d907ccabc89ae7a 172.20.0.5:6379@16379 master - 0 1750408700000 3 connected 10923-16383
3a108159226cffb39a581f2dd5ee60d0c4ba47bf 172.20.0.7:6379@16379 slave 4297dec43cb75777abbf3d03b518da18419ebdef 0 1750408701272 2 connected
fce6a11b47b440945dea039c0c2b0ff29234a31e 172.20.0.3:6379@16379 slave aaf139c2d79a9cb1d7eb087b57a0a8dcd9c1e671 0 1750408700242 1 connected
4297dec43cb75777abbf3d03b518da18419ebdef 172.20.0.6:6379@16379 myself,master - 0 1750408701000 2 connected 5461-10922
```

> Note
> How to install redis-cli
> `brew install redis`


## Debugging
### Check the logs
First we'd better check the logs from `redis-cluster-init` container. Check below command.

```shell
docker logs redis-cluster-init
```

### Check status of nodes in cluster (not in cluster yet. :)
If you see any wired thing in the log and something like below. then check directly status cluster nodes.

#### sample log when nodes are configured in cluster
```text
2025-06-20 17:38:07 Master[0] -> Slots 0 - 5460
2025-06-20 17:38:07 Master[1] -> Slots 5461 - 10922
2025-06-20 17:38:07 Master[2] -> Slots 10923 - 16383
2025-06-20 17:38:07 Adding replica 172.20.0.3:6379 to 172.20.0.4:6379
2025-06-20 17:38:07 Adding replica 172.20.0.7:6379 to 172.20.0.6:6379
2025-06-20 17:38:07 Adding replica 172.20.0.8:6379 to 172.20.0.5:6379
```

### Check communication b/w nodes
Next we'd better check a node can find another node(s), so we can check that using below commands.
```shell
docker exec redis-node-0 redis-cli -a secret cluster meet redis-node-1 6379
```

#### Figure it out.
If you see like below error message, then it goes fail to resolve ip address.

```text
ERR Invalid node address specified 
```