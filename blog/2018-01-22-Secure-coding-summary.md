---
slug: Secure Coding Summary and Practices
title: Secure Coding Summary and Practices
authors: ryukato
date: 2018-01-22 09:36:55
tags: [Java, "Secure Coding"]
---

# Secure Codings 요약 정리
## Secure Coding Practices
### SQL Injection
SQL Injection(주입 혹은 삽입)은 데이터베이스와의 연동하기 위한SQL문을 사용할때, 사용자 입력값에 대한 검증을 하지 않고 쿼리문을 생성하는 과정에서 발생한다.
공격자는 입력 값으로 예상 되는 실행 SQL문을 예측하여 입력 값으로 해당 SQL문을 조작하여 공격을 시도하게 된다. SQL Injection은 DBMS의 종류에 상관없이 취약점이 노출 될 수 있다.

#### Examples
예를 들어, 다음과 같이 사용자 입력 항목과 사용자 정보를 조회하는 애플리케이션에서 실행되는 SQL문이 있다고 할 경우, 공격자는 다음과 같은 입력 항목으로 작성된 쿼리문이 아닌 조작된 쿼리문을 실행할 수 있다.

* ``` '' or ='' and password='' or ='' ```
* ``` '' or 1=1; -- ```
* ``` '' or 1=1 -- ```
* ``` ' or 'a' = 'a ```
* ``` ') or ('a' = 'a ```
* ``` + or 1=1 -- ```

위의 입력 가능 항목 외에도, 예외를 발생 시킬 수 있는 값을 입력한 후, 발생되는 예외의 내용을 보고 SQL injection에 대한 취약점 여부를 판단할 수 있다. 따라서 발생 가능한 예외에 대한 적절한 처리가 필요하다.

##### 입력 항목

```
ID: <input type=-"text" name="id" />
Password: <input type=-"password" name="password" />
```

##### Codes with SQL

```
String sql = "select * from member where id ='"+id+"' and password='"+password+"'";
```

##### 필터링 해야하는 특수문자들
``` ' " # - ( ) ; @ = * / + ```

##### 필터링 해야하는 구문들

* union
* select
* insert
* drop
* update
* from
* where
* join
* substr (oracle)
* substring (ms-sql)
* user_tables (oracle)
* sysobjects (ms-sql)
* table_schema (mysql)
* declare (ms-sql)
* information_schema (mysql)
* user_table_columns (oracle)

#### 처리 방법
SQL injection은 부당한 입력값으로 실행될 SQL문의 구조를 변경하는 공격이므로, 입력 값에 따라 실행될 SQL의 구조가 변경되지 않도록 해야 한다.

##### JDBC API 사용
최대한 ```PreparedStatement```를 사용하여 외부에서 입력된 값을 바인딩해 사용해서, SQL의 구조가 바뀌지 않도록 한다.

```
String sql = "select * from member where id ='?' and password='?';
PreparedStatement pstmt = connection.prepareStatement(sql);
pstmt.setString(1, userId);
pstmt.setString(2, password);
...
```
##### MyBatis 사용
MyBatis와 같은 SQL Mapping framework을 사용하면 SQL injection 공격에 안전할 것이라고 생각되지만, MyBatis를 사용할때도 다음과 같은 사항에 유의해야 한다.

###### 안전하지 않은 사용
아래와 같이 ```${}``` 매개변수 치환 방식은 입력된 문자열 연결 방식으로 해당 SQL문을 실행하기 때문에, 외부의 입력값에 따라 SQL문의 구조가 변경될 수 있다.

```
<select id="getMember" parameterType="java.util.Map" resultType="Member">
  SELECT * FROM MEMBER WHERE ID = '${id}' AND PASSWORD = '${password}'
</select>
```
###### 안전한 사용
미리 만들어진 SQL문의 구조를 변경하지 않고 입력 값을 바인딩하는 ```#{}``` 매개변수 치환 방식을 사용해야 한다.
```
<select id="getMember" parameterType="java.util.Map" resultType="Member">
  SELECT * FROM MEMBER WHERE ID = '#{id}' AND PASSWORD = '#{password}'
</select>
```

##### JPA API 사용
"JDBC API 사용"과 마찮가지로 쿼리문의 구조가 변경될 수 있는 코드를 사용하면 안된다.

###### 안전하지 않은 사용

```
Object memberObj = entityManager.createQuery("select * from member where id ='"+id+"' and password='"+password+"'").getSingleResult();
```

###### 안전한 사용

```
Query query = entityManager.createQuery("select * from member where id ='?' and password='?'")
Object memberObj = query.setParameter(1, "id")
                        .setParameter(2, "password")
                        .getSingleResult();
```

### Command Injection
cmd.exe 혹은 bash와 같은 쉘 프로그램 실행을 위해 사용자의 입력값이 필요한 경우, 사용자의 입력값을 충분히 검증하지 않고 해당 프로그램을 실행하여 공격자가 의도한 명령이 실행될 수 있는 취약점을 말한다.

Command Injection에 대한 대응 방법은 SQL Injection에서 필터를 사용한 것과 유사한 방법을 사용하면 된다. 즉, 외부에서 실행 가능한 명령들만을 사용할 수 있도록 제한한다.


### XPath Injection
DOM과 같이 XML 문서도 문서내의 element들간에 상하 관계등을 표현한 트리 구조로 표현된다. XPath는 문서내의 특정 요소 혹은 속성까지 도달하기 위한 경로를 문서내의 요소의 계층을 이용해서 표현한다. 따라서 XPath는 element 혹은 데이터를 조회하기 위해 사용된다.

이런 XPath를 사용할때, 사용자의 입력값을 검증없이 동적으로 생성되는 XPath를 삽입하여 사용하게 되면 정해진 요소 혹은 데이터를 노출하게 되는 취약점이 발생하게 된다.

조회되는 데이터의 범위를 용도에 맞게 설정하고, 사용자의 입력값을 엄격하게 검증하고 제한하여 필요한 항목만을 받아서 사용할 수 있도록 해야 한다.

### LDAP Injection
XPath와 마찮가지로 조회되는 데이터의 범위를 용도에 맞게 설정하고, 사용자의 입력값을 엄격하게 검증하고 제한하여 필요한 항목만을 받아서 사용할 수 있도록 해야 한다. 
