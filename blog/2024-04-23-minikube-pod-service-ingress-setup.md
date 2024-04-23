---
slug: k8s-setup
title: Uising mini-kube, setup pods, services and ingress
authors: ryukato
date: 2024-04-23 12:42:50
tags: [development, k8s, mini-kube]
---

<!-- truncate -->

# k8s setting on m1/m2 Mac

## On Local

### install qemu and socket_vmnet

```shell
brew install qemu
```

```shell
brew install socket_vmnet
brew tap homebrew/services
HOMEBREW=$(which brew) && sudo ${HOMEBREW} services start socket_vmnet
```

### mini-kube

#### install

##### home-brew

```shell
brew install minikube
```

#### start k8s on local with qemu driver

```shell
minikube start --driver=qemu --network=socket_vmnet --alsologtostderr
```

> Note
> Using `qemu` driver with(or without) `socket_vmnet` cause an error from adding `ingress-controller` add-on to minikube. But starting minikube with `docker` driver does not cause any issue with adding `ingress` add-on. Unfortunately I don’t know how to resolve the error yet.
> Error log
> `...failed to register layer: lsetxattr security.capability...`

start k8s on local with docker driver

```shell
minikube start --driver=docker --alsologtostderr
```

## Add image to mini-kube

After building application docker image, please run below to put the image into mini-kube.

```shell
docker save sample-app | (eval $(minikube docker-env) && docker load)
```

## Apply deployment

### sample deployment

```yml title="sample-deployment.yml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
spec:
  selector:
    matchLabels:
      app: sample-app
  replicas: 2
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
        - name: sample-app
          image: sample-app:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 20080
              protocol: TCP
```

### How to apply the deployment

Please run below command.

```shell
kubectl apply -f [path of the file/sample-deployment.yml]
```

There has to be result messages including something like `deployment.apps/sample-app created`

### Check status of deployed pods

#### Check status of pods

```shell
kubectl get pods -w -n default
```

#### Check logs of pods

```shell
kubectl logs --selector app=sample-app -n default
```

## Apply service

### sample service

```yml title="sample-service.yml"
apiVersion: v1
kind: Service
metadata:
  name: sample-app
spec:
  selector:
    app: sample-app
  ports:
    - name: webview
      appProtocol: http
      protocol: TCP
      port: 20080
      targetPort: 20080
    - name: weview-health
      protocol: TCP
      port: 20081
      targetPort: 20081
```

### How to apply service

```shell
kubectl apply -f [path of the file/sample-service.yml]
```

## Config ingress-controller

### Enable ingress on mini-kube

```shell
minikube addons enable ingress
```

### How to check enabled ingress-controller

#### Check status of ingress-controller pod

```shell
kubectl get pods -w -n ingress-nginx
```

### Apply our ingress config

#### sample

```yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sample-ingress
  annotations:
    kubernates.io/ingress.class: nginx
    nginx.ingress.kubernates.io/rewrite-target: /
spec:
  rules:
    - http:
        paths:
          - path: /sample/view/
            pathType: Prefix
            backend:
              service:
                name: sample-app
                port:
                  number: 20080
```

#### How to apply

```shell
kubectl apply -f [path of the file/sample-ingress.yml]
```

#### Access to ingress-controller’s NGINX

We need to do port-forwarding or tunneling because mini-kube uses NAT and host-only network, which means it seems there is no way to connect from your host to ingress nginx on mini-kube.

##### Port-forwarding to ingress

```shell
kubectl port-forward [name of ingress controller pod] [host port]:80
```

##### tunneling

```shell
minikube tunnel
```

##### Check connection to ingress-controller nginx

###### case of tunneling

- Using httpie

  - ```shell
    http -vv ":80/[api or resource path]"
    ```

- Using curl
  - ```shell
    curl -v localhost:80/[api or resource path]
    ```

###### case of port-forwarding

- Using httpie

  - ```shell
    http -vv ":[host port]/[api or resource path]"
    ```

- Using curl
  - ```shell
    curl -v localhost:[host port]/[api or resource path]
    ```

## Trouble shoot

If there is an error from starting mini-kube, then please stop the process and run below commands.

```shell
minikube delete --all --purge
docker system prune -a
```

## Commands

### bind mini-kube and docker-env

```shell
eval $(minikube -p minikube docker-env)
```

### delete all pods

```shell
kubec delete $(kubec get po -o=name)
```

## ETC

### registering aliases

we can use aliases for k8s commands, please copy below scripts to your `.zshrc` file

```shell
# k8s aliases
alias mkube="minikube"
alias kubec="kubectl"
alias mkubec="minikube kubectl"
```
