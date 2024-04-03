---
slug: Tomcat JNDI로 설정되어 있는 Data-source를 단위 테스트에서 사용하기.
title: Tomcat JNDI로 설정되어 있는 Data-source를 단위 테스트에서 사용하기.
authors: ryukato
date: 2019-01-08 09:36:55
tags: [Tomcat, JNDI, Unit-testing]
---

Tomcat과 같은 WAS를 기반으로 실행될 애플리케이션을 개발할 때, 보통 애플리케이션과 연동할 Database를 WAS에 DataSource로 아래와 같이 context.xml에 정의 및 등록하여 사용하게 된다.

```
<?xml version="1.0" encoding="utf-8"?>
<Context antiJARLocking="true" antiResourceLocking="true" reloadable="true">
    ...
    <Resource name="todoDataSource" auth="Container" type="javax.sql.DataSource"
              maxTotal="100" maxIdle="30" maxWaitMillis="10000"
              username="test" password="test" driverClassName="com.mysql.jdbc.Driver"
              url="jdbc:mysql://localhost:3306/test"/>
							...
</Context>
```

위와 같이 DataSource를 정의하여 사용하게 되면, WAS에서 제공하는 Connection Pool을 사용할 수 있는 이점이 있고, [JNDI](https://docs.oracle.com/javase/8/docs/technotes/guides/jndi/index.html)를 사용하여 애플리케이션의 DAO 객체 등과 같이 Database와 연동해야 하는 객체에서 DataSource와 Connection을 쉽게 가져와 사용할 수 있다.

그런데 [Spring-jdbc](https://spring.io/projects/spring-data-jdbc) 혹은 IBatis와 같은 프레임워크를 사용하지 않고 직접 JDBC 코딩을 해서 class를 작성하고 테스트해야 하는 경우, WAS에 선언되어 있는 DataSource를 어떻게 가져와야 할까? 단위 테스트를 하기 위해 WAS를 실행해야 할까?
대답은 그렇지 않다. 그 이유는 DataSource가 WAS에 선언이 되어 있지만, 선언되어 있는 DataSource는 [JNDI](https://docs.oracle.com/javase/8/docs/technotes/guides/jndi/index.html)를 통해서 가져올 수 있기때문이다. JNDI는 표준 인터페이스이고 Tomcat과 같은 WAS는 JNDI의 표준에 맞는 구현체를 제공한다. 한다마디로 Tomcat과 같은 WAS가 해주는 것처럼 DataSource를 JNDI를 통해 연결 해주기만 하면 된다.

예를 들면, 아래와 같이 JNDI를 통해 DataSource를 가져오는 `JndiDataSourceManager`가 있다고 하고 `JndiDataSourceManager`가 DataSource를 잘 가져오는지를 테스트해야한다고 하자. 그리고 `context.xml`은 `src/main/webapp/META-INF/`에 있다.

```
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

public class JndiDataSourceManager {
    private String defaultDataSourceJndiName = "java:comp/env/todoDataSource";

    @Override
    public DataSource getDataSource(String jndiName) {
        try {
            return (DataSource) new InitialContext().lookup(jndiName);
        } catch (NamingException e) {
            throw new RuntimeException("Fail to get a data-source with jndi: " + jndiName);
        }
    }

    @Override
    public DataSource getDefaultDataSource() {
        return getDataSource(defaultDataSourceJndiName);
    }
}
```

위와 같은 상황에서 `JndiDataSourceManager`를 테스트하기 위해선, 다음의 라이브러리가 필요하다. `pom.xml`에 아래의 dependency들을 추가하고,

```
<dependency>
    <groupId>com.github.h-thurow</groupId>
    <artifactId>TomcatJNDI</artifactId>
    <version>1.0.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-dbcp</artifactId>
    <version>7.0.37</version>
    <scope>test</scope>
</dependency>
```

`JndiDataSourceManager`를 테스트할 class인 `JndiDataSourceManagerTest`를 생성한다. 그리고 다음과 같이 코드를 작성하면 된다.

```
import hthurow.tomcatjndi.TomcatJNDI;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import javax.sql.DataSource;
import java.io.File;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.junit.Assert.assertThat;

public class JndiDataSourceManagerTest {
    private DataSourceManager jndiDataSourceManager;
    private TomcatJNDI tomcatJNDI;

    @Before
    public void setUp() {
        tomcatJNDI = new TomcatJNDI();
        tomcatJNDI.processContextXml(new File("src/main/webapp/META-INF/context.xml"));
        tomcatJNDI.start();
        jndiDataSourceManager = new JndiDataSourceManager();
    }

    @After
    public void tearDown() {
        tomcatJNDI.tearDown();
    }

    @Test
    public void test_getDataSourceUsingJndi() {
        DataSource dataSource = jndiDataSourceManager.getDataSource("java:comp/env/todoDataSource");
        assertThat("data source from jndi", dataSource, is(notNullValue()));
    }

    @Test
    public void test_defaultDataSource() {
        DataSource dataSource = jndiDataSourceManager.getDefaultDataSource();
        assertThat("data source from jndi", dataSource, is(notNullValue()));
    }

    @Test(expected = RuntimeException.class)
    public void test_getDataSource_with_not_defined_name() {
        jndiDataSourceManager.getDataSource("not-defined-jndi-name");
    }
}
```

먼저 `setUp`에서 `TomcatJNDI` 인스턴스를 생성해서 WAS에서 사용할 `context.xml`을 지정해 준다. 그리고 `start`. 단 `tearDown`에서 반드시 `TomcatJNDI` 인스턴스의 `tearDown`을 호출해 주어야 한다.

그리고 나머지 테스트 코드들을 작성하여 실행하면, DataSource를 받아오는 메서드들에 대한 테스트가 성공하는 걸 볼 수 있다.

이렇게 WAS의 context에 DataSource가 잘 선언이 되어 있는지, 선언되어 있는 DataSource를 잘 가져오는지를 확인하기 위해 WAS를 실행할 필요 없이 단위 테스트만 실행하여 확인할 수 있다. WAS를 띄우고 페이지 혹은 api를 호출하는 등의 End2End 테스트를 할 필요 없이 간단히 단위 테스트를 통해 확인할 수 있는 방법.
