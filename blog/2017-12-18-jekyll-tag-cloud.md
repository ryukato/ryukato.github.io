---
slug: Jekyll 블로그에 태그 클라우드 만들기
title: Jekyll 블로그에 태그 클라우드 만들기
authors: ryukato
date: 2017-12-18 09:36:55
tags: [Jekyll, tag-cloud]
---

# Jekyll 블로그에 태그 클라우드 만들기
![](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Web_2.0_Map.svg/1024px-Web_2.0_Map.svg.png)
[태그 클라우드](https://ko.wikipedia.org/wiki/태그_클라우드)는 위키 피디아의 정의와 비슷하게 블로그 상에서 사용된 태그들을 한곳에 모아 표시 해놓은 것을 말합니다.

위의 이미지처럼 예쁘진 않지만 간단한 태그 클라우드를 만들어서 블로그에 추가해 보겠습니다.

## 필요한 코드
### 라이브러리 파일
태그 클라우드 기능을 제공하는 라이브러리인 **jQCloud**를 사용합니다. [jQCloud github](https://github.com/mistic100/jQCloud)로 가서 압축 파일을 내려 받아 아래의 두 파일을 필요한 경로로 옮겨 놓습니다.
* jqcloud.min.css : **/css** 혹은 css 파일을 모아 놓은 폴더로 복사하여 넣습니다.
* jqcloud.min.js: **/assets** 혹은 js 파일을 모아 놓은 폴더로 복사하여 넣습니다.

### 태그 가져오기 코드
필요한 jQCloud 파일들을 head.html, footer.html에서 각각 참조하도록 합니다. 그리고 footer.html에 전체 태그를 가져와서 태그 클라우드로 만드는데
필요한 코드를 작성해야 합니다.

#### head.html
jQCloud의 css 파일을 사용할 수 있도록 합니다.

```
<link rel="stylesheet" href="{{ "/css/jqcloud.min.css" | prepend: site.baseurl }}">
```

#### footer.html

jQCloud의 js 파일을 사용할 수 있도록 합니다. 그리고 jQCloud는 jQuery를 필요로 하기 때문에 footer.html에 jQuery가 먼저 선언이 되어 있어야 합니다.

```
<script src="{{ site.baseurl }}/assets/js/jqcloud.min.js" charset="utf-8"></script>
```

블로그 모든 포스트의 태그들을 가져와서 태크 클라우드를 만드는 코드는 아래와 같이 작성하면 됩니다. jQCloud 태그 클라우드를 만들때, text와 weight이 반드시 필요합니다. weight는 태그 단어의 중요로를 상대적으로 나타내는 값으로, 아래의 예제코드에서는 단순하게 태그 단어의 카운트를 사용하였습니다.

```
$(document).ready(function() {
  var tags = [
    {% for tag in site.tags %}"{{ tag | first }}"{% if forloop.last == false %}, {% endif %}{% endfor %}
  ]

  var words = [];
  tags.forEach(t => {
    var key = t;
    if (words[key]) {
      words[key] = words[key] + 1;
    } else {
      words[key] = 1;
    }
  });
  var tagCloudWords = Object.keys(words).map(w => {
    return {
      text: w, weight: words[w], link: '/search/?tag=' + w
    };
  }).sort((a, b) => {
    return a.weight < b.weight ? 1 : -1;
  });
  $('#jqcloud').jQCloud(tagCloudWords,
    {
      height: 400,
      autoResize: true,
      fontSize: { from: 0.1, to: 0.01 }
    }
  );
});
```

#### 태그 클라우드 표시 파일
태그 클라우드를 표시할 파일에 아래와 같이 div 태그를 사용해야 합니다. 해당 div의 id값과 footer.html에서 작성한  ```$('#jqcloud').jQCloud(tagCloudWords....```에서의 jQuery selector의 값이 동일해야 합니다.

```
<div id="jqcloud"></div>
```

모든게 정상적으로 되었다면 아래와 같이, 예쁘진 않지만 그래도 태그 클라우드를 표시할 수 있습니다.

![](/assets/jekyll/tag_cloud.png)
