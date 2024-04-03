---
slug: Delegation, Composition and Aggregation 이해하기
title: Delegation, Composition and Aggregation 이해하기
authors: ryukato
date: 2012-09-19 09:36:55
tags: [Delegation, Composition, Aggregation]
---

# Delegation, Composition and Aggregation.

final 키워드를 공부하다가, 우연하게 발견한 좋은 글이 있어 소개를 할려고합니다.
모델링에 있어서의 Delegation(위임), Composition(구성) and Aggregation(집합?)의 차이점에 관한 글이구요.
원문의 링크를 걸어 둡니다.
http://stackoverflow.com/questions/1384426/distinguishing-between-delegation-composition-and-aggregation-java-oo-design

첫번째 답변이 쉽게 잘 설명을 한 것같아. 저도 기억을 해둘 겸하여 번역과 함께 추가로 몇글자 적어 볼려고 합니다.
## Composition의 개념
예로 집을 들어보자. 집안에는 여러개의 방들이 있고 이 방들은 집이 있어야 반드시 존재하게된다. 즉, 방은 혼자서 존재할 수 없고 집이라는 객체안에서 존재하는 것이다. 그리고 집이라는 객체가 생성될때 반드시 함께 생성되어야하고 반대로 집이라는 객체가 사라질때 함께 사라져야 하는 것이다. 이런 관계가 Composition이라고 할 수 있다.
(*요약하면 Composition: A owns B)
예들 바탕으로 한번 방과 집간의 관계를 코드로 나타내면 아래와 같지 않을까 생각합니다.

```
public class Room{
    Room(){
    }
    ...
}

public class House{
    private List<Room> rooms;
    public House(int CountOfRoom){
        rooms = new ArrayList<Room>();
        for(int i=0;i<CountOfRoom;i++){
            rooms .add(new Room());
        }
     }
    ...
}
```

## Aggregation의 개념
Aggregation은 Composite와 비슷하긴 하나, 다른 점은 A,B라는 객체가 있고 A가 B를 포함할때, A가 B를 소유하는 개념이 아니고 일종의 집합이라고 생각하시면 될 것같습니다. 그리고 해당 집합이 없어져도 집합내의 개별 원소들은 남아있는 관계라고 하는군요.  원문에서는 예를 여러개의 블럭으로 지어진 장난감 집을 예로 들고 있습니다. 그 이유는 장난감 집을 부숴도 각각의 블럭은 남아 있기때문이죠.
(*요약하면 Aggregation: B is part of A)
간단한 예를 하나 들어보죠.

```
public class Block{
    ....    
}
public class SquareBlock extends Block{
    ....
}
public class CircleBlock extends Block{
    ...
}
public class ToyHouse{
    private List<Block> blocks;

    public ToyHouse(Block...blocks) throws Exception{
       if(blocks==null){throw new Exception("Toy house needs blocks");}
        blocks = new ArrayList<Block>();
         for(Block b:blocks){
            blocks .add(b);
        }// for end
    }// constructor end
}// class end

public class ToyHouseBuilder{
    private List<Block> blocks = new ArrayList<Block>();
    ToyHouseBuilder(){
        //initialize block
        ....
    }
    public void buildToyHouse(){
        //build toy house
        ....
    }
}
```
간단하게 할려고 했는데 좀 길어졌내요. 암튼, SquareBlock,CircleBlock들은 Block의 구현체이고, ToyHouse가 해당  block을 가지고 있는 구조 입니다. 하지만 ToyHouse의 생성자를 보시면 Block을 매개변수로 받습니다. 이말은 ToyHouse자신이 Block객체를 소유하고 있지 않다라는 것이죠. blocks라는 List( Block 집합)를 가지게 되는 것이죠. 따라서 ToyHouse의 객체 toyHouse1, toyHouse2가 있고 각 객체가 Block의 객체 인 block1,block2,block3들을 각각 가지고 있다고 해보죠. 이런 상황에서 toyHouse1객체가 소멸이 되어도 block1,block2,block3은 소멸되지 않는다라는 것이죠. 왜냐하면 toyHouse2에 의해 레퍼런스가 유지되기때문입니다. 이건 다른 객체를 포함하는 객체가 소멸되도 Aggregation에선 포함된 객체가 소멸되지 않는다라는 것을 설명하기 위해 예를 든것입니다.

## Delegation의 개념:
Delegation은 어떤 일을 내가 직접하지 않고 다른 사람한테 시키는 것이라고 할 수 있습니다. 음~이건 제 생각엔 각 객체는 자기일에만 집중하면 된다는 원리와 관련이 있다고 생각이 됩니다.
이번엔 정말 간단한 예제를 만들어보죠.

```
public class BadBoss{
    Sawon sawon = new Sawon();

    public void doCopy(){
    //Damn! do copy yourself
        sawon.doCopy();
    }
}
public class Sawon{
    public void doCopy(){
        ..
    }
    public void makeDocu(){
    ...
    }
}
```

사원과 그의 보스가 있습니다. 보스는 직접 복사를 할 수 도있는데 매번 사원을 시킨다고 하내요. 보시면 BadBoss객체는 Sawon객체를 멤버변수가 가지고 그에게 복사 일을 시키고 있습니다. 나쁜 예이긴 하지만 이것이 바로 위임(Delegation)이라고 생각하시면 됩니다.

저도 현재 모델링을 조금씩 이나마 공부를 하고 있는 상태라서, 부족한 부분이나 잘못된 부분이 있을 수 있습니다. 그런 부분들을 발견하고 지적해주시면 고마겠습니다.
그리고 조금이나마 서로 도움이 되었으면 하내요.
