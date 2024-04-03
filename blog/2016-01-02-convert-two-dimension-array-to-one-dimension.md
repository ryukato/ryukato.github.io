---
slug: Converting two dimension array to one dimension array.
title: Converting two dimension array to one dimension array.
authors: ryukato
date: 2016-01-02 09:36:55
tags: [Algorithm, convert-array-dimension]
---

# 2차원 배열(grid)를 1차원 배열로 변환
2차원 배열을 1차원 배열로 변환하는게 어렵지 않을 것 같은데, 또 막상 생각하면 이런 저런 삑싸리가 많이 나는 코드를 작성하게 되는 것 같아서, 이번에 작성을 해놓고 나중에 이 코드를 참조를 해야겠다.

## Grid
Grid는 n \* n Grid를 기본으로 사용하였다. m \* n도 그렇게 크게 다르진 않을 것이라고 생각되기때문에.
> m \* n이라고 해도, 실제로 중요한간 가로의 사이즈 즉, m이 중요하다고 생각된다.

일단 두개의 메서드가 필요하다.
* getIndexFrom(int x, int y): x, y값으로부터 일차원 배열의 index를 반환해주는 메서드
* getPointFrom(int index): 1차원 배열의 index로부터 x, y값을 반환해주는 메서드

### 1차원 배열의 index 구하기
x, y값으로부터 1차원 배열의 index를 구하는 공식은 아래와 같다.
> N은 grid의 사이즈

```
N * (x -1) + (y -1)
```

x, y에서 각각 -1을 해준 것은 1차원 배열의 index는 0부터 시작하기 때문이다. 따라서 getIndexFrom(int x, int y)의 전체 코드 내용은 아래와 같다.

```
public int getIndexFrom(int x, int y){
    return this.size * (x -1) + (y -1);
}

```

### index로부터 x, y 구하기
1차원 배열의 index를 구할때의 공식의 x를 가지고 계산하는 부분은 아래와 같고

```
N * (x -1)
```

이를 역으로 치환하면

```
(index / N) + 1
```

그리고 y는 아래와 같이 구할 수 있다.

```
(index % N) + 1
```

따라서 getPointFrom(int index)의 전체 코드는 아래와 같다.

```
public Point getPointFrom(int index){
    int x = (int) (index / this.size) + 1;
    int y = (index % this.size) + 1;
    return new Point(x, y);
}
```

## 전체 코드 및 테스트 코드
### 전체 코드

```
public class Grid<E> {
  private final int size;
  private final Object[] elements;

  public Grid(int size){
      this.size = size;
      this.elements = new Object[this.size * this.size];
  }

  public int getIndexFrom(int x, int y){
      return this.size * (x -1) + (y -1);
  }

  public int getIndexFrom(Point point){
      return this.size * (point.getX() -1) + (point.getY() -1);
  }

  public Point getPointFrom(int index){
      int x = (int)(index / this.size) + 1;
      int y = (index % this.size) + 1;
      return new Point(x, y);
  }

  public void add(int index, E e){
      if(index >= this.size){
          throw new IndexOutOfBoundsException();
      }
      this.elements[index] = e;
  }

  public void add(int x, int y, E e){
      int index = getIndexFrom(x, y);
      this.add(index, e);
  }

  public static class Point{
      private final int x;
      private final int y;
      public Point(int x, int y){
          this.x = x;
          this.y = y;
      }
      public int getX() {
          return x;
      }
      public int getY() {
          return y;
      }
      @Override
      public int hashCode() {
          final int prime = 31;
          int result = 1;
          result = prime * result + x;
          result = prime * result + y;
          return result;
      }
      @Override
      public boolean equals(Object obj) {
          if (this == obj)
              return true;
          if (obj == null)
              return false;
          if (getClass() != obj.getClass())
              return false;
          Point other = (Point) obj;
          if (x != other.x)
              return false;
          if (y != other.y)
              return false;
          return true;
      }

      @Override
      public String toString() {
          return "Point [x=" + x + ", y=" + y + "]";
      }
  }
}
```

### 테스트 코드

```
import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class GridTest {
    @Test
    public void test_(){
        Grid<?> grid1 = new Grid<>(3);

        assertEquals(0, grid1.getIndexFrom(1, 1));
        System.out.println(grid1.getIndexFrom(1, 1)); // 0
        System.out.println(grid1.getIndexFrom(1, 2)); // 1
        System.out.println(grid1.getIndexFrom(1, 3)); // 2
        System.out.println(grid1.getIndexFrom(2, 1)); // 3
        System.out.println(grid1.getIndexFrom(2, 2)); // 4
        System.out.println(grid1.getIndexFrom(2, 3)); // 5
        System.out.println(grid1.getIndexFrom(3, 1)); // 6
        System.out.println(grid1.getIndexFrom(3, 2)); // 7
        System.out.println(grid1.getIndexFrom(3, 3)); // 8

        assertEquals(new Grid.Point(1, 1), grid1.getPointFrom(0));
        System.out.println(grid1.getPointFrom(0)); // 1,1
        System.out.println(grid1.getPointFrom(1)); // 1,2
        System.out.println(grid1.getPointFrom(2)); // 1,3
        System.out.println(grid1.getPointFrom(3)); // 2,1
        System.out.println(grid1.getPointFrom(4)); // 2,2
        System.out.println(grid1.getPointFrom(5)); // 2,3
        System.out.println(grid1.getPointFrom(6)); // 3,1
        System.out.println(grid1.getPointFrom(7)); // 3,2
        System.out.println(grid1.getPointFrom(8)); // 3,3
    }
}
```
