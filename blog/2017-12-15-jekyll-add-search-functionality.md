---
slug: Jekyll 블로그에 태그 및 카테고리 검색 기능 추가하기
title: Jekyll 블로그에 태그 및 카테고리 검색 기능 추가하기
authors: ryukato
date: 2017-12-15 09:36:55
tags: [Jekyll, tag-search, 카테고리검색, 태그검색]
---

<!-- truncate -->

# Jekyll 블로그에 태그 및 카테고리 검색 기능 추가하기
## Front Matter
Jekyll을 통해 블로그를 운영하면서 작성하는 글들을 분류하기 위한 방법으로 카테고리 및 태그들을 활용할 수 있습니다. Jekyll은 [Front Matter](https://jekyllrb.com/docs/frontmatter/)를 사용하여, 아래와 같이 포스트에 대한 레이아웃, 제목, 작성일, 태크 및 카테고리 등을 설정할 수 있습니다.

```
---
layout: post
title: Jekyll 블로그에 태그 및 카테고리 검색 기능 추가하기
date: 2017-12-15 09:36:55
tags: [Jekyll, JavaScript, 카테고리검색, 태그검색]
categories: [Jekyll]
---
```
단 [Front Matter](https://jekyllrb.com/docs/frontmatter/)는 무조건 포스트 파일의 시작이 되어야 하는데, 다시 말하면 [Front Matter](https://jekyllrb.com/docs/frontmatter/)위에 주석등의 내용이 있으면 안됩니다.

[Front Matter](https://jekyllrb.com/docs/frontmatter/)를 통해 설정된 태그와 카테고리를 활용하여 블로그의 포스트들을 분류하여 검색할 수 있는 기능을 추가해 보도록 하겠습니다.

## 검색 기능 추가
간단히 어떤 방식으로 검색 기능이 가능한지 살펴보면, 포스트마다 설정된 카테고리와 태그들을 한곳에 모읍니다.
모인 카테고리와 태그들은 ```site```라는 전역변수에 저장이 됩니다.
그리고 링크된 태그와 카테고리를 선택하게 되면, 선택한 태크 혹은 카테고리 이름이 query parameter형식으로 검색 페이지로 전달이 됩니다.
전달된 태크 혹은 카테고리 이름으로 일치하는 태크나 카테고리를 선택하게 되고 동일한 태그 혹은 카테고리의 포스트들을 표시하는 방식입니다.

예를 들어, A, B, C 이렇게 세개의 전체 카테고리가 있고 A 카테고리로 검색이 되었다면 A 카테고리로 설정된 포스트들을 표시하게 되는 것이죠.

### 사전 준비
검색 설정 이전에, 만약 jekyll-archive가 ```_config.yml```에 설정이 되어 있다면 관련 설정을 모두 주석 처리해주세요. Github page로 올리기되면 jekyll-archive는 잘 작동을 하지 않습니다.

검색 설정을 하기위해 필요한 파일들이 있습니다. 직접 작성할 필요는 없으며, 아래의 내용을 참고하시거나 링크된 파일을 받으면 됩니다.

* [alexpearce.js](/assets/js/alexpearce.js) : 검색 조건이 되는 태그 혹은 카테고리에 맞는 태그 혹은 카테고리 영역을 제어하는 스크립트를 포함하고 있습니다.
* [search.html](/search.html) : 검색된 포스트들을 표시하는 View 역활을 하는 페이지입니다.

### 설정 하기
#### 필요한 파일 생성 및 파일 참조 추가
위에서 다운 받은 [alexpearce.js](/assets/js/alexpearce.js)과 [search.html](/search.html)을 각각 다음과 같은 위치에 저장하시면 됩니다.

###### [alexpearce.js](/assets/js/alexpearce.js)
* 저장 위치 : ```/assets/js/``` 밑에 저장.
* *footer.html* 파일이나 *head.html* 파일과 같이 자바 스크립트 파일의 참조 설정을 할 수 있는 파일에 아래의 내용을 추가합니다.

  ```
    <script src="{{ site.baseurl }}/assets/js/alexpearce.js" charset="utf-8"></script>
  ```

###### [search.html](/search.html)
* 저장 위치 : 블로그 프로젝트 루트에 저장. 제가 블로그 프로젝트 폴더는 *ryukato.github.io* 입니다. 이 폴더 바로 아래에 저장합니다.

#### 검색 페이지로 링크 변경
블로그 포스트를 표시하는 *post.html* 파일 혹은 이와 유사한 파일에 아래와 같이 태그 및 카테고리를 표시하는 부분이 있습니다. 아마 링크처리를 해당 코드안에서 할 것으로 생각되는데요. 그 링크를 태그는 ```/search/?tag={{ tag | escape }}```, 카테고리는 ```/search/?category={{ cat | escape }}``` 이런식으로 변경해 주면 됩니다.

###### post.html
```
{% if page.tags.size > 0 %}
<section class="tags">
  <strong>Tags:</strong> {% for tag in page.tags %}<a href="/search/?tag={{ tag | escape }}">{{ tag }}</a>{% if forloop.last == false %},&nbsp;{% endif %}{% endfor %}
</section>
{% endif %}
```

이제 링크된 태그 혹은 카테고리를 선택하여 검색 페이지로 이동하게 되면 아래와 같이 선택된 태그나 카테고리로 분류된 포스트들이 표시 될 것입니다.
![](/assets/jekyll/search_result.png)
