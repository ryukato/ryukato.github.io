---
slug: PG_Integration 
title: KG 이니시스 연동 시 주의 사항 
authors: ryukato
date: 2025-06-20 17:41:00
tags: [Redis, Cluster, Docker, Mac. M2]
---

<!-- truncate -->

# Setup Redis cluster with docker(compose) on M2
Here is docker-compose.yml file and init-redis-cluster.sh

## init-redis-cluster.sh
This file is required because Redis attempts to auto-detect its own IP address, but in Docker containers, it may default to 127.0.0.1 or an incorrect internal address, leading to failures in cluster communication.

The init-cluster.sh script is necessary because Docker Compose cannot reliably execute dynamic shell commands—such as resolving container IPs—within the command: field. This script ensures that all Redis nodes are discoverable by hostname, properly resolved to IP addresses, and correctly joined into a Redis cluster with the appropriate master-replica setup.

```shell
#!/bin/bash

# 1. Resolve Redis container hostnames to internal IP addresses
# 2. Format those IPs into Redis-compatible cluster node addresses (e.g., IP:6379)
# 3. Use 'redis-cli --cluster create' to form a 6-node cluster
# 4. Pipe in 'yes' to automatically confirm cluster creation


set -e

# DNS → IP conversion
NODES=$(getent hosts redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5 | awk '{print $1":6379"}' | paste -sd' ' -)

echo "[INFO] Creating Redis Cluster with nodes:"
echo "$NODES"

yes yes | redis-cli -a "$REDIS_PASSWORD" --cluster create $NODES --cluster-replicas 1

```

> Note
> The script dynamically resolves all Redis node IPs and initializes the cluster using redis-cli. It automates the slot allocation and replica assignment to avoid manual configuration and resolve timing/network issues in Docker-based environments.

## docker-compose.yml
```yml
version: "3.9"

services:
  # this is to debug like ping to redis-node container with its name   
  debug-busybox:
    image: busybox
    command: sleep 3600
    networks:
      - redis-cluster

  redis-node-0:
    image: bitnami/redis-cluster:7.2
    container_name: redis-node-0
    environment:
      - REDIS_PASSWORD=secret
      - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
      - REDIS_CLUSTER_ANNOUNCE_IP=redis-node-0
      # - REDIS_CLUSTER_DYNAMIC_IPS=yes
    ports:
      - "26379:6379"
      - "17000:16379"
    networks:
      - redis-cluster

  redis-node-1:
    image: bitnami/redis-cluster:7.2
    container_name: redis-node-1
    environment:
      - REDIS_PASSWORD=secret
      - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
      - REDIS_CLUSTER_ANNOUNCE_IP=redis-node-1
      # - REDIS_CLUSTER_DYNAMIC_IPS=yes
    ports:
      - "26380:6379"
      - "17001:16379"
    networks:
      - redis-cluster

  redis-node-2:
    image: bitnami/redis-cluster:7.2
    container_name: redis-node-2
    environment:
      - REDIS_PASSWORD=secret
      - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
      - REDIS_CLUSTER_ANNOUNCE_IP=redis-node-2
      # - REDIS_CLUSTER_DYNAMIC_IPS=yes
    ports:
      - "26381:6379"
      - "17002:16379"
    networks:
      - redis-cluster

  redis-node-3:
    image: bitnami/redis-cluster:7.2
    container_name: redis-node-3
    environment:
      - REDIS_PASSWORD=secret
      - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
      - REDIS_CLUSTER_ANNOUNCE_IP=redis-node-3
      # - REDIS_CLUSTER_DYNAMIC_IPS=yes
    ports:
      - "26382:6379"
      - "17003:16379"
    networks:
      - redis-cluster

  redis-node-4:
    image: bitnami/redis-cluster:7.2
    container_name: redis-node-4
    environment:
      - REDIS_PASSWORD=secret
      - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
      - REDIS_CLUSTER_ANNOUNCE_IP=redis-node-4
      # - REDIS_CLUSTER_DYNAMIC_IPS=yes
    ports:
      - "26383:6379"
      - "17004:16379"
    networks:
      - redis-cluster

  redis-node-5:
    image: bitnami/redis-cluster:7.2
    container_name: redis-node-5
    environment:
      - REDIS_PASSWORD=secret
      - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
      - REDIS_CLUSTER_ANNOUNCE_IP=redis-node-5
      # - REDIS_CLUSTER_DYNAMIC_IPS=yes
    ports:
      - "26384:6379"
      - "17005:16379"
    networks:
      - redis-cluster

  redis-cluster-init:
    image: bitnami/redis-cluster:7.2
    container_name: redis-cluster-init
    volumes:
      - ./init-redis-cluster.sh:/opt/bitnami/scripts/redis-cluster/setup.sh
    depends_on:
      - redis-node-0
      - redis-node-1
      - redis-node-2
      - redis-node-3
      - redis-node-4
      - redis-node-5
    environment:
      - REDIS_PASSWORD=secret
      - REDIS_NODES=redis-node-0 redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5
    command: >
      bash -c "sleep 15 &&
      /opt/bitnami/scripts/redis-cluster/setup.sh
      --cluster-announce-ip redis-cluster-init
      --password secret
      --cluster-replicas 1
      --use-password"
    networks:
      - redis-cluster

networks:
  redis-cluster:
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