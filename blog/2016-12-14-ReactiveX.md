---
slug: ReactiveX
title: ReactiveX
authors: ryukato
date: 2016-12-14 16:57:29
tags: [Java, ReactiveX]
---

<!-- truncate -->

# ReactiveX
[How-To-Use-RxJava](https://github.com/ReactiveX/RxJava/wiki/How-To-Use-RxJava)에 나온 Groovy 예제를 Java로 바꿔보았습니다.

## Java
### Getting started
#### Sample project 구조
메이븐 프로젝트 구조를 따르며 폴더 구조는 아래와 같습니다.
> 단순히 reactiveX 예제 코드를 실행만 할 것이기때문에, test 폴더는 추가하지 않았습니다.

```
project-folder
    - src
        - main
            - java
            - resources
pom.xml
```

예제 프로젝트 폴더 구조

```
reactive
    - src
        - main
            - java
            - resources
pom.xml
```

#### 라이브러리 추가
아래의 dependency를 추가하면 됩니다.

```
<dependency>
  <groupId>io.reactivex</groupId>
  <artifactId>rxjava</artifactId>
  <version>1.1.6</version>
</dependency>
```

#### pom.xml

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <artifactId>reactive-examples</artifactId>
  <groupId>com.yyoo</groupId>
  <version>1.0-SNAPSHOT</version>
  <packaging>jar</packaging>
  <modelVersion>4.0.0</modelVersion>
  <dependencies>
    <dependency>
      <groupId>io.reactivex</groupId>
      <artifactId>rxjava</artifactId>
      <version>1.1.6</version>
    </dependency>
  </dependencies>
  <build>
    <plugins>
    <!-- maven 명령어(mvn)을 통해 main method를 가지는 클래스 실행을 위한 플러그인 -->
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>exec-maven-plugin</artifactId>
        <version>1.5.0</version>
      </plugin>
      <!-- maven 구조 및 maven을 통해 다운받은 라이브러리 classpath 등을 일일이 잡지 않아도 컴파일 되게 해주는 플러그인 -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.6.0</version>
        <configuration>
          <source>1.8</source>
          <target>1.8</target>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

#### Codes
##### 단순 HelloWorld 수준의 코드

```
package reactive;
import rx.Observable;
import rx.functions.Action1;
import java.util.*;
public class Hello{
  public static void main(String[] args) {
    String[] names = new String[]{"Ryu", "Kim"};
    Observable.from(names).subscribe(new Action1<String>(){
      @Override
      public void call(String s){
        System.out.println("Hello " + s);
      }
    });
  }
}
```

##### 동기적으로 숫자 출력

```
package reactive;
import rx.Observable;
import rx.functions.Action1;
import java.util.*;
import java.util.stream.*;
public class Hello{
  public static void main(String[] args) {

    customObservableBlocking().subscribe(s -> {System.out.println(s);});
  }

  public static Observable customObservableBlocking(){
    return Observable.create(subscriber -> {
      IntStream.rangeClosed(1, 50)
      .forEach((i) -> {
        if(subscriber.isUnsubscribed()){
          return;
        }
        subscriber.onNext("value: " + i);

      }); // end of forEach
      if(!subscriber.isUnsubscribed()){
        subscriber.onCompleted();
      }
    }
    );// end of create
  }
}
```

##### 비동기적으로 숫자 출력
subscriber가 subscription할때마다, Thread를 생성하여 blocking되지 않도록 처리하였습니다.

```
package reactive;
import rx.Observable;
import rx.functions.Action1;
import java.util.*;
import java.util.stream.*;
public class Hello{
  public static void main(String[] args) {
    customObservableNonBlocking().subscribe(s -> {System.out.println("Hello " + s);});
  }

  public static Observable customObservableNonBlocking(){
    return Observable.create(subscriber -> new Thread(){
      @Override
      public void run(){
        IntStream.rangeClosed(1, 50).forEach((i) -> {
          if(subscriber.isUnsubscribed()){
            return;
          }
          subscriber.onNext("value: " + i);
        }); // end of forEach
        if(!subscriber.isUnsubscribed()){
          subscriber.onCompleted();
        }

      }
    }.start());
  }

} // end of class
```

#### 컴파일 및 실행
##### 컴파일

```
mvn clean compile
```

##### 실행

```
mvn exec:java -Dexec.mainClass=reactive.Hello
```

## 출처
[How-To-Use-RxJava](https://github.com/ReactiveX/RxJava/wiki/How-To-Use-RxJava)
