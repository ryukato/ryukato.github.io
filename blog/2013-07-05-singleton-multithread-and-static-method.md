---
slug: Singleton, MultiThreading and static method
title: Singleton, MultiThreading and static method
authors: ryukato
date: 2013-07-05 09:36:55
tags: [Java, Design-Pattern, Singleton, MultiThreading]
---

# Singleton, MultiThreading and static method

음 프로젝트 중에 뭔가 이상한 에러가 있어 살펴보았는데 singleton class 가 있고, 그 singleton class의 getInstance 메서드가 아닌 다른 비지니스 로직이 담긴 메서드가 있다. 그런데 해당 비지니스 로직 메서드를 다른 static 메서드들을 가지고 있는 class에서 호출하고 있었다.
문제는 웹 환경 그리고 multi-thread 환경이라는 거다. 해당 부분이 굉장희 의심스러웠다. 그래서 비슷한 코드를 작성해서 statck overflow에 질문을 올렸다.

아래의 코드들이 의심이 가는 코드 구조와 유사하게 만들어 본 코드들이다. 과연 답변이 어떻게 달릴지 답변 달리는 걸 보면서 해당 코드도 업데이트를 해봐야겠다.

```
import java.io.BufferedReader;
import java.io.FileReader;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

public class SingletonCls {
    private static SingletonCls singletonInstance = null;

    private SingletonCls() {}

    public static SingletonCls getIntance(){
      if(SingletonCls.singletonInstance == null){
        singletonInstance =  new SingletonCls();
      }
      return SingletonCls.singletonInstance;
     }

    public List<Map<String,String>> call(String id) throws Exception {
    List<Map<String,String>> list = new ArrayList<Map<String,String>>();
    BufferedReader br = null;
    final String col = "col";
    try {
      br = new BufferedReader(new FileReader("test.txt"));
      String lineStr = null;
      while((lineStr = br.readLine()) != null) {
        StringTokenizer st = new StringTokenizer(lineStr, ",");
        int colIdx = 1;
        if(lineStr.startsWith(id)) {
          Map<String,String> map = new HashMap<String,String>();
          while(st.hasMoreTokens()) {
            String value = st.nextToken();
            map.put(col+(colIdx++), value);
          }
          list.add(map);
        }
      }
    }
    finally {
      if( br != null) {
        br.close();
      }
    }
    return list;
  }
}

/*
The class whose static method invokes singleton's business logic method
*/
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class TestSingleTonCaller {
  public static List<Map<String,String>> getData(String id) throws Exception {
      List<Map<String,String>> list = SingletonCls.getIntance().call(id);
          return list;
      }
}


/*
Runnable class executes the static method
*/
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class RunnableSingleTonExe implements Runnable {
    private final String id;
    public RunnableSingleTonExe(String inId){
        this.id = inId;
    }
    public void run() {
        try {
            List<Map<String,String>> list = TestSingleTonCaller.getData(this.id);
            System.out.println("thread id:"+this.id+"  list > "+ (list==null?"":list.toString()));
        }catch(IOException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
        }catch(Exception e){
          e.printStackTrace();
        }
    }
}

```

역시나 였다. 위의 Singleton 코드는 깨지기 쉽다.  문제의 지점은 getInstance 메서드에서 singleton 변수를 null 체크를 하는 구문과
새로운  instance를 생성하는 구문 사이에 또 다른 쓰레드가 치고 들어올 수 있기때문이다.
더 많은 답변들이 달렸지만 핵심은 위의 것이기 때문에 다른 말은 별로 필요하지 않는다.
그냥 링크로 대체 http://stackoverflow.com/questions/17474318/singleton-and-multithread

위와 같이 해당 Singleton 객체를 생성하는데 비용이 많이 들지 않는다면, 즉 - 생성자에서 별다른 일을 할 필요가 없는 경우 어설픈 lazy initialization을 쓰는 것보다 그냥 아래 처럼 Singleton 인스턴스를 미리 만들어 두는 것이 좋다.

```
private final static SingletonCls instance = new SingletonCls();
```

위의 방법보다 더 좋은, 확실하게 하나의 instance를 생성하는 방법은 Enum을 사용하는 것이다. 아래처럼

```
public enum SingletonEnum {
	INSTANCE;

	public void call(){
		System.out.println("enum singleton call");
	}
}
```
해당 SingletonEnum의 call method를 호출하는 방법은 ```SingletonEnum.INSTANCE.call();``` 이렇게 하면된다. Enum을 사용할 경우 오로지 하나의 Singleton  instance가 생성되는 것을 보장할 수 있다.

하지만 Singleton 객체의 생성자에서 초기화 작업등 특별히 해야할 작업이 있는 경우는 어떻게 해야할까? 즉 Singleton instance를 생성하는 비용이 많이 들어갈 경우는? 이럴 경우 lazy initialization을 써야하는 거다.

그리고 정확한 lazy initialization을 써야하는 경우 다양한 방법이 있을 수 있겠지만 Initialization-on-demand holder idiom을 쓰는 것이 좋을 것이라고 생각된다.
해당 Idiom에 대한 설명은 http://en.wikipedia.org/wiki/Initialization_on_demand_holder_idiom 참조하면 된다.

그리고 웹 프로그래밍에서-컨테이너가 요청이 들어올때마다 쓰레드를 생성하여 요청을 처리하는 환경-, 특정 사이트에 고객이 접속하여 보내는 요청에 맞는 응답 데이터를 처리하는 객체는 되도록이면 Singleton을 쓰는 것보단 요청을 처리하기 위한 Channel 성격의 객체를 만들어야 한다면, 해당 Channel 객체의 Pool을 만들어서 처리하는 것이 좋지 않나 생각해 본다.
