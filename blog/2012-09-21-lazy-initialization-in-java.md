---
slug: Lazy Initialization in Java
title: Lazy Initialization in Java
authors: ryukato
date: 2012-09-21 09:36:55
tags: [Java, Design Pattern ,Lazy-Initialization]
categories: [Design-pattern]
---

<!-- truncate -->

# Lazy Initialization in Java
원문: http://antrix.net/posts/2012/java-lazy-initialization/

Lazy Initialization에 대해 잘못된 구현 방법과 왜 그런지, 그리고 어떻게 해야 올바른 Lazy Initialization을 구현할 수 있는지에 대한 글입니다. 이글을 번역해보면서 Lazy Initialization에 대해 좀 더 이해하고 올바른 방법을 배워보면 좋을 것 같습니다.
아래의 예제는 보통 많이 쓰이는 Lazy Initialization의 패턴이라고 합니다. 아래의 예제에서 어떤 점을 개선해야 할지 한번 살펴보겠습니다.

```
class Demo{
    private Collaborator  collaborator = new Collaborator();
    public Collaborator   getCollaborator(){
        return collaborator;
    }
    public static void main(String[] args{
        Demo demo = new Demo();
        Collaborator  collaborator = demo.getCollaborator();
    }
}

```

위의 예제에선 Collaborator객체는 Demo객체(instance)가 생성이 될때 함께 생성이 됩니다. 그런데 여기서 생각해 볼 것이 Collaborator의 생성 비용과 Collaborator객체가 항상 필요한 것인가입니다. 만약 Collaborator의 생성 비용이 비싸고, Collaborator객체가 항상 필요하지 않다면, 위의 예제는 자원을 낭비하는 꼴이 되는 것이죠.
그래서 좀 더 개선을 해보면, 즉 Collaborator가 필요할 경우만 생성하도록, 아래의 예제와 같이 될것 입니다.

```
class Demo{
  private Collaborator  collaborator;
  public Collaborator   getCollaborator(){
      if(collaborator == null){
          collaborator = new Collaborator();
      }
      return collaborator;
  }
  public static void main(String[] args{
      Demo demo = new Demo();
      Collaborator  collaborator = demo.getCollaborator();
  }
}

```

위의 개선된 Demo 클래스 예제를 보면 getCollaborator 메서드를 통해서 Collaborator를 생성하고 반환하도록 하였습니다. 그러면 getCollaborator 메서드를가 호출되기 전까지는 Collaborator객체를 생성하지 않는다라는 것이죠. 즉, Collaborator객체가 필요할때 getCollaborator 메서드를 호출하면되고, 그전까지는 불필요한 Collaborator객체 생성으로 인한 비용,메모리를 좀 더 아낄 수 있다라는 것이죠.
하지만 첫번째 문제는 개선을 하였지만 두전째 예제에는 여전히 문제점이 있습니다. 무엇일까요?
바로 multi-thread환경하에선 문제가 발생할 수 있습니다. 두개 혹은 그 이상의 thread가 돌고 있고, 그 thread들이 동시에 getCollaborator 메서드를 호출하게 되면 어떻게 될까요? 그렇게 되면 singleton을 깨버리게 됩니다. 즉, 하나 이상의 Collaborator객체가 생성이 될 가능성이 굉장히 높다는 것이죠. 그렇게 되면 경우에 따라서 엄한 결과 혹은 위험한 결과를 초래할 수 도 있습니다.
그러면 이 문제를 해결할려면 어떻게 해야할까요? 어렵지 않습니다. 바로 아래와 같이 synchronized를 걸어주면 됩니다.

```
class Demo{
  private Collaborator  collaborator;
  public synchronized Collaborator   getCollaborator(){
      //first check
      if(collaborator == null){
          collaborator = new Collaborator();
      }
      return collaborator;
  }
}
```
이렇게 synchronized를 걸어주면 한번에 하나의 thread만이 getCollaborator메서드를 호출할 수 있게 되는 것이죠.바꿔말하면 오직 하나의 Collaborator가 생성이 된다라는 것입니다.
하지만 위의 예제 또한 **multi-thread** 환경에서 정말 완벽하게 돌아간다라고 100%확신 할 수는 없습니다. 왜냐하면 하나의 thread가 first check를 수행하고 있는 상황에서 또 다른 thread가 치고 들어와 버릴 수 있기때문입니다. 그렇게 되면 그 두개의 thread가 Collaborator객체를 생성해 버릴 수 있습니다.  이런 상황을 방지 하기 위해서는 또 아래와 같이 바꿔줘야 합니다.

```
class Demo{
  private Collaborator collaborator;

  public Collaborator getCollaborator(){
      //first check
      if(collaborator == null){
          synchronized(this){ //demo instance
              //second check
              if(collaborator == null){
                  collaborator = new Collaborator();
              }
          }
          return collaborator;
      }
  }
}
```

이렇게 하는 것은,일명 double-check lock 패턴이라고도 합니다. 해당 Object(Demo instance)에 대한 lock을 획득한 후에 collaborator가 null인지를 한번 더 체크하여 Collaborator 객체가 오직 하나만 생성이 되도록 하는 것입니다.
앞에서 얘기한 것처럼 first check에서 치고 들어온 thread를 second check에서 한번 더 걸러주어 오직 하나의 Collaborator만 생성이 되도록 하는 것이죠.
그럼 다 된 것일까요? 한번 생각해 보시죠.
다 된것이 아닙니다.

// TODO
