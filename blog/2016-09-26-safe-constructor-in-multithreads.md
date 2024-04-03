---
slug: 다중 쓰레드 환경에서 안전하게 생성자 작성하기
title: 다중 쓰레드 환경에서 안전하게 생성자 작성하기
authors: ryukato
date: 2016-09-26 16:57:29
tags: [Java, Multi-threads, Constructor]
---

# 다중 쓰레드 환경에서 안전하게 생성자 작성하기

(원문: Java theory and practice: Safe construction techniques)[http://www.ibm.com/developerworks/library/j-jtp0618/]

## Race condition(위험한 경쟁상황을 만들지 말자)
### sample codes
#### Listing 1.

```
public class DataRace {
    static int a = 0; // target for race condition.

    public static void main(){
        new MyThread().start();
        a = 1;
    }

    public static class MyThread extends Thread {
        public void run(){
            System.out.println(a); // print 0 ? or 1, you can't sure for that.
        }
    }
}
```

위의 코드를 보고 음~ 별 문제 없내라고 생각할 수 도 있다. 왜냐면 위의 코드를 실행하면 거의 대부분 예상대로 1을 출력할 것이기 때문이다. (0을 출력할 것이라고 생각할 수도 있겠지만) 그건 실제로 어떤 개발 환경인지, 어떤 JDK를 사용하는지, Thread 스케쥴링을 어떻게 하는지에 따라 결과는 0 혹은 1이 될 수 있다. 즉, 특정 조건에 따라 값이 바뀔 수 있다는 것. 그러면 안되는데…

그 이유는 서브 쓰레드(MyThread)가 a 변수에 대한 가시성(visibility)에 대해 메인 쓰레드와 경쟁하는 상황이 만들어 지기 때문이다.
그럼 서브 쓰레드와 메인 쓰레드간 a에 대한 경쟁을 없애주면 해결이 될 것이므로, 아래와 같이 코드를 변경하는 것이 좋을 것으로 생각된다. (아니면 큰일날까?)

```
public class DataRace {
  private int a = 0; // target for race condition.
  public final synchronized void setA(int a){
    this.a = a;
  }
  public final synchronized int getA(){
    return this.a;
  }

  public static void main(String[] args) {
    DataRace dr = new DataRace();
    dr.setA(1);
    new MyThread(dr.getA()).start();
  }

  public static class MyThread extends Thread {
    private final int a;
    public MyThread(int a){
      this.a = a;
    }
    public void run(){
        System.out.println(a);
    }
  }
}
```

## 생성자내에서 “this” 참조를 공유하지 말자.
### sample codes
#### Listing 2.

```
public class EventListener {

  public EventListener(EventSource eventSource) {
    // do our initialization
    ...

    // register ourselves with the event source
    eventSource.registerListener(this);
  }

  public onEvent(Event e) {
    // handle the event
  }
}
```

위의 코드만 보면, 아무런 이상이 없는 코드로 보일 수 있다. 하지만 심각한 동시성 문제를 야기 시킬 수 있는 코드가 존재하고 있다. 어디일까?
EventListener의 생성자에서 EventSource 인스턴스를 인자로 받아 이벤트 리스너로 자기자신(this)를 등록하고 있다. 즉, EventSource에게 “ **this** ”라는 자기 자신에 대한 참조 변수를 넘겨줌으로 자기자신을 공유하고 있다. 지금까지도 그렇게까지 문제는 심각해 보이지 않는다. 그렇지만 아래의 코드를 보게 되면 이야기는 달라진다.

#### Listing 3.

```
public class RecordingEventListener extends EventListener {
  private final ArrayList list;

  public RecordingEventListener(EventSource eventSource) {
    super(eventSource);
    list = Collections.synchronizedList(new ArrayList());
  }

  public onEvent(Event e) {
    list.add(e);
    super.onEvent(e);
  }

  public Event[] getEvents() {
    return (Event[]) list.toArray(new Event[0]);
  }
}
```

위의 코드는 EventListener를 상속받아 구현한 RecordingEventListener의 클래스 정의이다. 그런데 RecordingEventListener의 생성자에서 부모의 생성자를 호출(super(eventSource))한 다음에, list를 초기화를 하고 있다. 그런데 문제는 부모 생성자를 호출하게 되면 이미, eventSource에게 자기 자신을 노출시켰고 이는 먹이가 던져지기를 기다리는 승냥이때와 같은 Thread들이 기다릴 수 있는 상황에 “this”를 던져 준 꼴이된다.
즉, list가 초기화 되기 전에, 외부에 있는 특정 Thread에서 onEvent 혹은 getEvents 메서드를 호출할 수 있게 되고, 그렇게 되면 NullPointerException이 발생하게 된다.
따라서 생성자에서 자신이 가지고 있는 속성들이 완전히 초기화 되지 않은 상황에서 자기 자신을 외부에 노출하는 것은 좋지 않은 방법이다.

아래와 같이 코드를 변경하는 것이 좋을 것으로 생각된다.

```
public class EventListener {

  public EventListener() {
    // do our initialization
    ...
  }

  public void doRegisterTo(EventSource eventSource){
       // register ourselves with the event source
    eventSource.registerListener(this);
  }

  public onEvent(Event e) {
    // handle the event
  }
}

public class RecordingEventListener extends EventListener {
  private final ArrayList list;

  public RecordingEventListener() {
    super();
    list = Collections.synchronizedList(new ArrayList());
  }

  public onEvent(Event e) {
    list.add(e);
    super.onEvent(e);
  }

  public Event[] getEvents() {
    return (Event[]) list.toArray(new Event[0]);
  }
}
```

## 생성자내에서 Thread를 시작하지 말자.
생성자내에서 “this” 참조를 공유하지 말자.처럼, “this”가 노출될 수 있기때문에, 생성자내에서 Thread를 start 시키지 말고, 따로 Thread를 시작시키는 start라는 메서드를 제공하는 것이 좋은 방법이다.

### sample codes
#### Listing 5.

```
public class Safe {

  private Object me;
  private Set set = new HashSet();
  private Thread thread;

  public Safe() {
    // Safe because "me" is not visible from any other thread
    me = this;

    // Safe because "set" is not visible from any other thread
    set.add(this);

    // Safe because MyThread won't start until construction is complete
    // and the constructor doesn't publish the reference
    thread = new MyThread(this);
  }

  public void start() {
    thread.start();
  }

  private class MyThread(Object o) {
    private Object theObject;

    public MyThread(Object o) {
      this.theObject = o;
    }

    ...
  }
}

public class Unsafe {
  public static Unsafe anInstance;
  public static Set set = new HashSet();
  private Set mySet = new HashSet();

  public Unsafe() {
    // Unsafe because anInstance is globally visible
    anInstance = this;

    // Unsafe because SomeOtherClass.anInstance is globally visible
    SomeOtherClass.anInstance = this;

    // Unsafe because SomeOtherClass might save the "this" reference
    // where another thread could see it
    SomeOtherClass.registerObject(this);

    // Unsafe because set is globally visible
    set.add(this);

    // Unsafe because we are publishing a reference to mySet
    mySet.add(this);
    SomeOtherClass.someMethod(mySet);

    // Unsafe because the "this" object will be visible from the new
    // thread before the constructor completes
    thread = new MyThread(this);
    thread.start();
  }

  public Unsafe(Collection c) {
    // Unsafe because "c" may be visible from other threads
    c.add(this);
  }
}
```
