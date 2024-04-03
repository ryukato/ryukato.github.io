---
slug: Thread run 메서드 선언 시 유의사항, 그리고 Thread 죽이기
title: Thread run 메서드 선언 시 유의사항, 그리고 Thread 죽이기
authors: ryukato
date: 2014-12-24 09:36:55
tags: [Java, thread, kill-thread]
---

<!-- truncate -->

# Thread run 메서드 선언 시 유의사항, 그리고 Thread 죽이기
회사에서 여러 Thread 혹은 하나의 Thread를 죽이는 유틸 클래스를 만들어서 Test를 하는데 죽이고 난 담에 살아 있는 Thread가 없는지를 assert하는 구분에서 자꾸 fail이 나는 거였다. 그래서 이유를 찾아 보니 Mock으로 만든 테스트용 Thread의 run메서드에 문제가 있었다.
그래서 동일한 실수를 반복하지 말아야하겠단 의도에서 기록을 남긴다.

## Thread run 메서드 선언 시 유의사항
### 잘못된 run 메서드
아래의 코드 예제어서 1초동안 sleep을 한다. 이 sleep 시간 동안 Interruption이 발생할 수 있기 때문에 InterruptedException을 잡는 catch문을 넣어 놓았다.
하지만 catch문에서 별다른 처리 없이 “Interrupted”라는 문구만 출력한다. 이것이 문제다. 왜냐면 에러가 발생하는 시점에 해당 Thread의 interrupted flag는 초기화되는데, 예외를 잡긴 했지만 예외를 호출한 쪽 혹은 JVM으로 던져야 할 예외를 먹은 것이다.
그렇기 때문에 해당 run 메서드의 while loop를 한번 더 타게 된다. 그리고 다시 1초동안 sleep을 한다.
즉, 해당 Thread가 죽었는지를 assert하는 시점에 해당 thread는 살아 있는 상태가 된다. 그렇기때문에 assert는 fail이 되는 것이다.

아래의 catch 구문이 문제다.

```
catch(InterruptedException e){
  //ignore
  System.out.println(“Interrupted”);
}
```

```
private static class ThreadHasWrongRunMethod extends Thread{
  private ThreadHasWrongRunMethod(){}
  private int loopCounnt = 0;
  public static Thread create(){
      return new ThreadHasWrongRunMethod();
  }

  @Override
  public void run(){
      while(!Thread.currentThread().isInterrupted()){
          try{
              /*
               * do some work or process
               */
              System.out.println("loopCounnt :"+ (++loopCounnt));
              Thread.sleep(50);
          }catch(InterruptedException e){
              //ignore
              System.out.println("Interrupted");
          }
      }
  }
}
```

### 괜찮은 run 메서드
sleep을 하는 동안 발생한 interruption을 잡는 catch에서 while loop를 빠져 나가기 위한 break와 해당 Thread를 다시 한번 interrupt를 거는 코드가 추가 되었다.
그 이유는 위의 잘못된 예의 설명된 부분을 보면 알 수 있을 것으로 생각된다. 그런데 다시 한번 interrupt를 거는 이유는 에러가 발생하는 시점에 해당 Thread의 interrupted flag는 초기화가 된다. 확실히 while을 종료하기 위해 interrupt를 다시 호출한 것이다. 그리고 만약 while문 안에 또다른 inner loop가 있고 inner loop안에서 sleep 및 InterruptedException을 catch하는 구문이 있다면 outer loop 인 while loop에서 문제가 발생할 수 있다. 따라서 확실히 해당 Thread를 종료하기 위해 interrupt를 다시 호출하는 것이 좋다고 생각된다.

loop를 빠져 나오긴 위한 break와 Thread.currentThread().interrupt()를 호출하여 해당 Thread를 확실히 interrupt를 한다.

```
catch(InterruptedException e) {
  System.out.println(“Interrupted”);
  Thread.currentThread().interrupt();
  break;
}
```

```
private static class MockThreadKeepRunning extends Thread{
    private int loopCounnt = 0;
    private MockThreadKeepRunning(){}
    public static Thread create(){
        return new MockThreadKeepRunning();
    }

    @Override
    public void run(){
        while(!Thread.currentThread().isInterrupted()){
            try{
                System.out.println("loopCounnt :"+ (++loopCounnt));
                Thread.sleep(50);
            }catch(InterruptedException e){
                System.out.println("Interrupted");
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}
```
## Thread 죽이기
Java API에는 stop메서드가 표시는 되어 있다. 하지만 stop메서드는 사용하지 말라고 표시를 해두었기 때문에 사용을 하면 안된다.
따라서 Thread를 죽이기 위해서는 interrupt 메서드를 호출하면 된다.

```
import java.util.List;

public class ThreadUtil {
    public static void stopThreads(Thread...threads){
        if(threads == null){
            throw new RuntimeException("given threads is null");
        }
        for(Thread thread:threads){
            stopThread(thread);
        }
    }

    public static void stopThread(Thread thread) {
        if(thread == null){
            throw new RuntimeException("given thread is null");
        }
        thread.interrupt();
    }

}
```
