---
slug: airflow_installation 
title: Airflow installation guide for running locally on M1 Mac 
authors: ryukato
date: 2025-08-08 14:20:00
tags: [airflow, m1]
---

<!-- truncate -->

# Airflow
## Env
* python version: 3.10.14

### Install python 3.10.4 
```shell
pyenv install 3.10.14
pyenv local 3.10.14
```

### Create python venv
```shell
python3.10 -m venv .venv
source .venv/bin/activate
```

> Note
> Check python path and version
> ```shell
> which python
> python --version
> ```

## Installation
### Set AIRFLOW_HOME
Create a directory for airflow home directory whose config file(e.g. airflow.cfg) and logs. After that, set the directory as `AIRFLOW_HOME`.
```shell
export AIRFLOW_HOME=[path of the directory]
```

> Example
> 
> ```shell
> export AIRFLOW_HOME=$(pwd)/airflow-home
> ```

### Setup constraint url
```shell
AIRFLOW_VERSION=2.9.0
PYTHON_VERSION="$(python --version | cut -d " " -f 2 | cut -d "." -f 1-2)"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"
```

### Install airflow
```shell
pip install "apache-airflow[postgres,celery]==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
```

> Note
> If there is any problem then install airflow without any plugin first, then install plugins.
> ```shell
> pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
> pip install "apache-airflow[postgres,celery]" --constraint "${CONSTRAINT_URL}"
> ```
> Please remember that `--constraint` has to be in second installation

### Setup airflow database (PostgreSQL)
```sql
CREATE USER airflow WITH PASSWORD 'airflow';
GRANT ALL PRIVILEGES ON DATABASE airflow TO airflow;

ALTER DATABASE airflow OWNER TO airflow;
ALTER ROLE airflow SET client_encoding TO 'utf8';
ALTER ROLE airflow SET default_transaction_isolation TO 'read committed';
ALTER ROLE airflow SET timezone TO 'Asia/Seoul';
```

### Init airflow
First check version of the installed airflow, and it will be `2.9.0`
```shell
airflow version
```
#### Init airflow DB
```shell
airflow db init
```
After run `db init`, should check there are files and directories in $AIRFLOW_HOME.
* airflow.cfg
* webserver_config.py (optional, if it is not, it's fine)
* logs

#### Create admin user
```shell
airflow users create --username admin --role Admin --firstname admin --lastname user --email admin@example.com
```

### Update airflow config
#### Modify airflow.cfg
```text
[core]
executor = LocalExecutor

[database]
sql_alchemy_conn = postgresql+psycopg2://airflow:airflow@localhost:5432/airflow
```

> Note
> After updating `airflow.cfg`, should run `airflow db init` again.

## Run
### run scheduler
```shell
airflow scheduler
```
### run web-server
```shell
airflow webserver --port [port number]
```

## ETC
### NO sample dags
If you don't need sample dags, then update airflow.cfg like below.
```text
[core]
load_samples = False
```

### Uninstall
#### Uninstall airflow
```shell
pip uninstall apache-airflow
```

### Reset airflow DB
```shell
airflow db reset
```

#### Uninstall packages
```shell
pip freeze | grep apache-airflow | xargs pip uninstall -y
```

#### Remove airflow home directory
```shell
rm -rf ~/airflow
```

## Refs
### Installation
* [How to install Airflow: For Apple M2](https://swift-tree.dev/how-to-install-airflow-for-apple-m2/)

## Trouble shoot
### WARNING: There was an error checking the latest version of pip.
#### certifi issue
```shell
pip install --upgrade certifi
```

#### Proxy issue
```shell
pip install --proxy=http://your.proxy:port --upgrade pip
```

## 운영 환경 설정 가이드 (추가)
### 1. 네트워크 환경 설정
공공 데이터 API 호출 시 M1/M2 환경에서 `requests` 라이브러리의 `NO_PROXY` 관련 이슈가 발생할 수 있습니다.  
`NO_PROXY` 환경 변수를 반드시 설정해 주세요.
```shell
export NO_PROXY="*"
```

### 2. API Rate-Limit 대응
공공 데이터 포털 API는 보수적으로 **10~20 TPS** 수준으로 호출을 제한하는 것이 안전합니다.  
이를 위해 **Airflow Pool**을 활용해 동시 실행 Task 수를 제한합니다.

예시:
```shell
# Airflow UI > Admin → Pools
# Pool Name: fetch_external_data_api
# Slots: 3  # TPS 제한에 맞춰 조정
```

DAG 예시 설정:
```python
@task(
    pool="fetch_external_data_api",
    pool_slots=1,
    retries=5,
    retry_exponential_backoff=True,
    retry_delay=timedelta(seconds=10)
)
```

### 3. MongoDB 연결 설정
MongoDB 연결은 장기적으로 **Airflow Connections + MongoHook**을 사용하는 것이 관리와 보안에 유리합니다.  
- Connection ID: `mongo_default`  
- URI 예시: `mongodb://username:password@host:27017/dbname`

설치:
```shell
pip install "apache-airflow[mongo]" --constraint "${CONSTRAINT_URL}"
```

예시:
```python
from airflow.hooks.base import BaseHook
from pymongo import MongoClient

mongo_conn = BaseHook.get_connection("mongo_default")
client = MongoClient(mongo_conn.get_uri())
```

### 4. 타임존 설정
`airflow.cfg`에서 타임존을 `Asia/Seoul`로 변경하여 로컬 시간과 일치하도록 합니다.
```text
[core]
default_timezone = Asia/Seoul
```

### 5. 장기 실행 / 좀비 태스크 방지
- `scheduler_zombie_task_threshold`: 실행 환경과 API 응답 속도에 맞춰 조정 (기본값 300초 → 필요시 600~900초)
- `execution_timeout`: 태스크 레벨에서 설정해 무한 대기 방지

예시:
```python
@task(
    execution_timeout=timedelta(minutes=1)
)
```