---
slug: spring_boot_r2dbc_postgresql 
title: spring-boot with r2dbc for PostgreSQL
authors: ryukato
date: 2025-07-06 16:21:00
tags: [spring-boot, r2dbc, PostgreSQL]
---

<!-- truncate -->
# R2DBC + PostgreSQL with Spring Boot

이 문서는 Spring Boot에서 **R2DBC**와 **PostgreSQL**을 함께 사용할 때 유용한 설정과 팁을 정리한 것입니다.

---

## ✅ 의존성 설정 (Gradle)

```kotlin
plugins {
    id("org.springframework.boot") version "3.2.5"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "1.9.23"
}

...

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    implementation("io.r2dbc:r2dbc-postgresql")
    runtimeOnly("org.postgresql:postgresql") // Flyway or JDBC tools
}
```

---

## ✅ application.yml 설정 예시

```yaml
spring:
  r2dbc:
    url: r2dbc:postgresql://localhost:5432/dummy
    username: devuser
    password: devpass
    pool:
      enabled: true
      initial-size: 5
      max-size: 20
      max-idle-time: 30s
      max-create-connection-time: 5s
      validation-query: SELECT 1
      properties:
        connectTimeout: PT15S
        ssl: false
        maxCreateConnectionTime: PT3S
        maxAcquireTime: PT10S
        maxLifeTime: PT300S
```

---

## ✅ R2dbcEntityTemplate 파라미터 사용 예시

### Criteria API

```kotlin
val criteria = Criteria.where("name").like("%test%")
template.select<DummyEntity>()
    .matching(Query.query(criteria))
    .all()
    .collectList()
```

### 복합 쿼리

```kotlin
val query = Query
    .query(Criteria.where("name").like("%test%"))
    .limit(10)
    .sort(Sort.by("id").descending())

template.select<DummyEntity>()
    .matching(query)
    .all()
```

---

## ✅ DatabaseClient로 직접 파라미터 바인딩

```kotlin
template.databaseClient
    .sql("SELECT * FROM dummy WHERE name like %:name%")
    .bind("name", "test")
    .map { row -> row.get("name", String::class.java) }
    .first()
```

---

## ✅ 쿼리 로그 활성화

```yaml
logging:
  level:
    org.springframework.r2dbc.core: DEBUG
    io.r2dbc.spi: DEBUG # query, query-param만 보고 싶은 경우, 주석 처리
    io.r2dbc.postgresql.QUERY: DEBUG
    io.r2dbc.postgresql.PARAM: DEBUG
```

---

## ✅ Testcontainers + PostgreSQL 초기 SQL 연동

```kotlin
object TestPostgresContainer {
    @Container
    val container = PostgreSQLContainer("postgres:15").apply {
        withDatabaseName("drug_metadata")
        withUsername("devuser")
        withPassword("devpass")
        withInitScript("sql/init.sql") // classpath: src/test/resources/sql/init.sql
        start()
    }
}
```

```kotlin
class TestPostgresInitializer : ApplicationContextInitializer<ConfigurableApplicationContext> {
    override fun initialize(context: ConfigurableApplicationContext) {
        val c = TestPostgresContainer.container
        val props = mapOf(
            "spring.r2dbc.url" to "r2dbc:postgresql://${c.host}:${c.firstMappedPort}/${c.databaseName}",
            "spring.r2dbc.username" to c.username,
            "spring.r2dbc.password" to c.password,
            "spring.datasource.url" to c.jdbcUrl,
            "spring.datasource.username" to c.username,
            "spring.datasource.password" to c.password
        )
        context.environment.propertySources.addFirst(MapPropertySource("testcontainers", props))
    }
}
```

```kotlin
@SpringBootTest
@ContextConfiguration(initializers = [TestPostgresInitializer::class])
class MyTest {

    @Autowired
    private lateinit var transactionalOperator: TransactionalOperator

    @Autowired
    private lateinit var r2dbcEntityTemplate: R2dbcEntityTemplate

    @Test
    fun testCheckBeanComponents() = runBlocking {
        assertNotNull(transactionalOperator)
        assertNotNull(r2dbcEntityTemplate)
    }
}
```

---

## ✅ 기타 유용한 설정 및 리소스

- `r2dbc-postgresql` 버전은 Spring Boot BOM에 의해 자동 관리됨

> Note
>
> `r2dbc-postgresql` 의존성 라이브러리를 자동으로 가져오지 못하는 경우, 원하는 버전을 명시해주면 됩니다. 
> 참고: [maven r2dbc-postgresql](https://mvnrepository.com/artifact/io.r2dbc/r2dbc-postgresql)

### ✅ PostgreSQL Docker-componse
#### compose yml file
```yaml title="docker-compose.yml"
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: r2dbc_postgres
    restart: unless-stopped
    ports:
      - "25432:5432"
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: dummy
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./initdb:/docker-entrypoint-initdb.d

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin
    restart: unless-stopped
    ports:
      - "38080:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
      - ./pgadmin/servers.json:/pgadmin4/servers.json
      - ./pgadmin/.pgpass:/pgadmin4/.pgpass
    depends_on:
      - postgres

volumes:
  postgres_data:
  pgadmin_data:

```
#### .pgpass
Put `.pgpass` under `pgadmin` directory

```text title=".pgpass"
postgres:5432:dummy:devuser:devpass
```

#### servers.json
Put `servers.json` under `pgadmin` directory
```json title="servers.json"
{
  "Servers": {
    "1": {
      "Name": "drug-db",
      "Group": "Servers",
      "Host": "postgres",
      "Port": 5432,
      "MaintenanceDB": "dummy",
      "Username": "devuser",
      "SSLMode": "prefer",
      "PassFile": ".pgpass"
    }
  }
}
```