---
slug: Thread에서 발생한 예외 처리하기
title: Thread에서 발생한 예외 처리하기
authors: ryukato
date: 2014-12-23 09:36:55
tags: [Java, thread, exception-handling]
---

# Thread에서 발생한 예외 처리하기

Thread를 사용하여 특정 로직을 수행하도록 할 경우, 해당 Thread가 예상치 못한 예외 등으로 종료가 되는 경우가 있다. 이럴 경우 Thread를 실행한 객체에서는 해당 Thread가 던진 예외를 가져 올 수 없기때문에 정확한 원인 파익이 힘들 수 있다.

따라서 Thread가 던지는 예외 사항을 파악할 수 있도록 하는 방법을 살펴보겠다.

 > Thread가 던지는 예외를 잡는 방법만 설명하기때문에, Thread에 대한 자세한 내용을 살펴보고 싶다면 Java API를 살펴보면 된다.

## Thread에서 던져진 예외 가져오기
### Thread.UncaughtExceptionHandler
아래의 코드 예제 중 바로 아래와 같은 코드를 사용하여 특정 Thread 객체에서 던지는 예외를 잡을 수 있는 Thread.UncaughtExceptionHandler를 설정하여 준다.

```
thread.setUncaughtExceptionHandler(threadExceptionHandler);
```

```
Thread thread = new Thread(){
    @Overridce
    public void run(){
        throw new RuntimeException();
    }
};
thread.setUncaughtExceptionHandler(threadExceptionHandler);
thread.start();
```
아래의 코드 예제처럼 Thread.UncaughtExceptionHandler의 구현체로부터 예외를 가져오면 된다.

```
Throwable exception = threadUncaughtExceptionHandler.getExceptionFrom(thread);
```
아래는 Thread.UncaughtExceptionHandler를 구현한 구현체의 예제이다.

```
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ThreadUncaughtExceptionCatcher implements Thread.UncaughtExceptionHandler{
    private Map<String, Throwable> threadExceptionMap = new ConcurrentHashMap<String, Throwable>();

    public static ThreadUncaughtExceptionCatcher create(){
        return new ThreadUncaughtExceptionCatcher();
    }

    @Override
    public void uncaughtException(Thread threadThrownException, Throwable caughtException) {
        threadExceptionMap.put(threadThrownException.getName(), caughtException);
    }

    public Throwable getExceptionFrom(Thread thread){
        return threadExceptionMap.get(thread.getName());
    }

    public Throwable getExceptionFrom(String threadName){
        return threadExceptionMap.get(threadName);
    }
}
```
