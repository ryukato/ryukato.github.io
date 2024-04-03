---
slug: git-branching-model
title: git-branching-model
authors: ryukato
date: 2017-10-24 16:55:50
tags: [Git, branching, 브랜칭]
---

# Git Branching Model
참고 자료: [a-successful-git-branching-model/](http://nvie.com/posts/a-successful-git-branching-model/)
application을 개발 할때, 소스 관리 및 배포를 위한 branch 관리가 필요하다. 새로운 기능 혹은 결함 수정에 대한 코드들을 어느 branch에 적용해야 하는지, 어떤 흐름을 거쳐 배포를 해야 하는지를 정하고 이를 팀원과 협의하고 준수해야 효과적으로 소스 코드 관리 및 배포를 효율적으로 할 수 있다고 생각된다.

언제 누가 어떤 이유로 코드를 변경했고 언제 배포가 되었는지 추적하기 위한 정책들이 필요하게 되고 아래의 설명한 내용은 배포 전까지의 코드 및 branch를 관리하기 위한 하나의 방안을 기술한다.

## The Main Branches
### master
master branch의 HEAD는 항상 production-ready상태이어야 한다.

### develop
develop branch의 HEAD는 항상 다음 릴리즈에 반영될 개발이 완료된 변경 사항들을 포함한 상태이어야 한다. 따라서 통합 branch라고도 불리며 nightly build가 이루어 지는 branch이다.

develop branch내의 코드가 안정된 그리고 release를 할 수 있는 상태가 될때 마다 master branch로 release number를 달고 병합(merge)해야 한다.

## Supporting Branches
새로운 기능 혹은 결함을 조치하기 위해서는 새로운 branch가 필요하다. 이런 필요에 의해 만들어지는 branch들은 아래와 같이 feature, release 그리고 hotfix branch들이 있다. 이branch들은 branch를 생성한 목적을 달성한 후에 삭제될 branch로 제한적인 생명주기를 가진다.

### Feature branches
새로운 기능을 개발하기 위한 branch이다. 보통 develop branch를 base로 한다. develop branch를 base로 하기 때문에, 개발 완료 후 다시 develop branch로 병합되어야 한다.

그리고 branch이름은 보통 새로운 기능 번호(예) JIRA Ticket #)를 포함하여야 한다. 다만 master, develop, release-* 그리고 hotfix-*와 같은 단어는 feature branch에 포함하지 않는다.

아래의 예제에서의 **feature-#123**와 같은 feature branch명을 사용한다.

##### develop으로부터 feature branch 생성
```
git checkout -b feature-#123 develop
```
##### 개발 중 혹은 완료 후, 변경 적용
**feature-#123 branch 에 변경 사항을 적용해야 한다.**

```
git add [files]
git commit -m "Feature - [ commit message]"
```

##### develop branch로 병합

```
git checkout develop
git merge --no-ff feature-#123
```

##### feature branch 삭제
develop branch로 병합 완료 및 모든 테스트 성공 후에 해당 feature branch를 삭제한다.

```
git branch -d feature-#123
```

### Release branches
새로운 production release를 준비하기 위한 branch이다. 그리고 minor한 결함 수정 이나 version number, build 날짜 등등을 포함하는 meta-data를 준비를 포함한다. feature branch와 비슷하게 보통 develop branch를 base로 한다.  그렇지만 병합은 develop 그리고 master로 수행한다.

branch명은 release-*의 명명규칙을 사용하는 것이 좋다.

release branch를 만들 시점에는 모든 변경 사항이 develop branch에 반영이 되어 있어야 하며 반드시 테스트를 거치고 모든 기능이 정상 동작하는지가 확인되어야 한다.

만약 개발 혹은 결함이 발견된 새로운 기능 변경 사항이 있다면, 다음 release branch를 통해 배포하는 것이 좋다. 즉, release branch가 생성된 후에, develop branch로 병합하는 것이 좋다.

release branch를 생성 할때, version number를 결정하고 release notes를 작성하는 것이 좋다.

##### develop으로부터 release branch 생성

```
git checkout -b release-[version number or release numbrer] develop
```

##### master branch로 병합
release를 하기위한 모든 작업이 완료되면 release branch를 master branch로 병합하고 master branch를 tagging한다.

```
git checkout master
git merge --no-ff release-[version number or release numbrer]
git tag -a [version number or release numbrer]
git tag -l
```

##### develop branch로 병합
master로의 병합 후에, release branch의 변경 사항을 develop branch에 적용한다. 이때 보통 code conflict가 발생하게 된다. 발생한 code conflict는 모두 수정하여 커밋해야 한다.

```
git checkout develop
git merge --no-ff release-[version number or release numbrer]
```
##### release branch 삭제
모든 release작업이 완료 된 후에 해당 release branch가 필요 없게 되면 release branch를 삭제한다.

```
git branch -d release-[version number or release numbrer]
```




### Hotfix branches
Hotfix branch는 production에 반영할 새로운 release를 준비하기 위한 branch라는 점에서 release branch와 매우 유사하다. 다만 hotfix이기때문에 사전에 계획되지 않았다는 것이 다르다.

production에서 심각한 버그가 발견되었을때, 이를 수정하기 위한 긴급 패치를 작성하기 위한 branch로 버그가 발견된 version(혹은  release) number로 tag된 master branch를 base로 생성한다.

##### master로부터 hotfix branch 생성
hotfix branch를 생성할때 minor 버전 번호를 증가 시켜야 한다.

```
git checkout -b hotfix-[version number or release numbrer] master
```

##### 특정 tag로부터 hotfix branch 생성

```
git checkout -b hotfix-[version number or release numbrer] [TAG number]
```
##### master branch로 병합
hotfix를 release 하기위한 모든 작업이 완료되면 hotfix branch를 master branch로 병합하고 master branch를 tagging한다.

```
git checkout master
git merge --no-ff hotfix-[version number or release numbrer]
git tag -a [version number or release numbrer]
git tag -l
```
##### develop branch로 병합

```
git checkout develop
git merge --no-ff hotfix-[version number or release numbrer]
```

##### release branch로 병합
만약 hotfix를 작성하고 완료할때, release branch가 존재한다면 release branch로도 hotfix의 내용을 병합해줘야 한다. 이때 release branch는 최종적으로 develop branch로 병합이 될 것이기때문에 develop branch대신 release branch에 병합을 한다.




### 참고 사항
#### cherry-pick
특정 branch에 반영된 커밋 중 하나를 골라 다른 branch에 적용하는 것을 말한다.  해당 commit을 반영할 branch로 먼저 이동 후에 반영할 commit-hash를 cherry-pick명령을 통해 branch에 반영한다.

```
git checkout [commit을 반영할 branch]
git cherry-pick [commit-hash]
```

cherry-pick은 기존 history를 변경하는 것이 아니라 반영할 commit을 해당 branch의 history에 추가를 하는 것이다.



#### fast-forward
더이상 병합 작업이 필요 없는 상황에서 특정 branch의 HEAD pointer를 갱신하는 것을 의미한다. 보통의 merge 작업에선 새로운 commit을 발생 시키지만 fast-forward는 commit없이 HEAD의 pointer를 가장 마지막 커밋을 참조하도록 갱신한다.  아래의 명령어를 통해 HEAD의 현재 pointer를 알 수 있다.

```
git show-ref --head
```
병합을 할때, fast-forward가 발생할 수 있는 상황이라도 반드시 새로운 commit을 만들고 싶다면 **--no-ff** (no fast forward) 옵션을 주고 병합을 하면 된다.

```
git merge --no-ff feature-branch
```
