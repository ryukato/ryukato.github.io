---
slug: Pro git 번역중
title: Pro git 번역중
authors: ryukato
date: 2017-10-24 16:57:29
tags: [Pro-git, Git]
---

<!-- truncate -->

# Pro Git
본 문서의 모든 이미지 및 코드들은 Pro Git에서 발췌한 것이다.

## Git Basic
// TODO - maybe?

## Git Branching
Branching은 다른 VCS(Version Control System)에서도 제공하는 기능이다. 간단히 Branching에 대해 설명하자면 애플리케이션 개발의 주 코드를 안정된 상태로 유지하면서 주 코드에서 새로운 분기를 생성하는 것을 말한다. 분기를 생서한다는 것은 주 코드 전체를 복사하여 새로운 branch를 만드는 것을 말하며 Git에서는 master가 일반적으로 주 코드 branch로 사용이 되며, 새로운 기능 혹은 버그/오류 수정을 위해 새로운 branch를 생성하여 사용한다.

> **master** branch라고 해서 다른 branch와 특별히 다른 점은 없다. 그냥 일반적인 branch중의 하나일 뿐이다.

Git은 이런 branch를 만들고 삭제하고 하는 branching을 쉽고 빠르게 수행할 수 있도록 해준다. 또한 Git은 다른 VCS와는 다르게 새로운 branch를 만들고 다른 branch와 병합하는 작업 흐름을 권장한다.

Git은 일련의 변경 사항들 혹은 코드간의 차이점들을 데이터로 저장하는 것이 아닌 **일련의 snapshot들**을 저장한다.  다시 말하면 코드 commit이 이루어 질때마다 Git은 commit 객체를 저장하는데, 저장된 commit 객체는 해당 commit시 반영된 코드들의 변경사항을 포함한 snapshot을 가르킨다. commit 객체는 commit에 대한 메타 정보와 commit tree를 포함하고 있다.

![](/assets/pro_git/a_commit_and_its_tree.png)
(*  출처: Pro Git)

최초 commit 이후에 다시 commit을 하게 되면 아래와 같이 다음 commit은 바로 이전 commit에 대한 참조 값을 가지게 된다.

![](/assets/pro_git/commits_and_their_parents.png)
(*  출처: Pro Git)

Git에서의 branch는 이런 commit들 중 하나를 지칭할 수 있는 이동 가능한 참조이다. 기본 branch인 master branch를 사용한다면 master branch는 마직막 commit을 참조하고 있을 것이고, 매번 commit을 수행할때 마다, master branch가 가지는 참조값은 앞으로(forward) 이동한다. (가장 최근의 commit을 참조하기 때문)

![](/assets/pro_git/a_branch_and_its_commit_history.png)
(*  출처: Pro Git)

### 새로운 branch 생성
아래의 명령어를 통해 Testing이라는 새로운 branch를 만들어 보자.

```
git branch testing
```
위 명령어를 통해 생성된 Testing branch는 가장 최근의 commit을 참조하고 있다.

![](/assets/pro_git/two_branches_pointing_into_the_same_series_of_commits.png)

Git은 **HEAD**라는 특별한 포인터(참조값)을 가지고 있기 때문에, 현재 어떤 branch에서 작업을 하는지를 알 수 있다. 즉 HEAD가 가르키는 branch가 현재 작업 중인 branch이다.

새로운 branch를 만들어도 **HEAD**는 여전히 이전 branch를 가르키고 있다. (이전 branch가 master라면 **HEAD**는 master를 가르킨다.)

![](/assets/pro_git/HEAD_pointing_to_a_branch.png)
(*  출처: Pro Git)

위의 내용은 ``` git log ```를 통해서도 확인 가능 하다.

```
git --no-pager log  --oneline --decorate
```

아래와 유사한 로그를 확인 할 수 있으며, **HEAD**가 현재 master branch를 가르키고 있는 것과 master와 testing이 마지막 commit(f30ab)을 가르키는 것을 확인 할 수 있다.

```
“f30ab (HEAD -> master, testing) add feature #32 - ability to add new formats to the central interface
34ac2 Fixed bug #1328 - stack overflow under certain conditions
98ca9 The initial commit of my project”
```

### Branch 바꾸기
Git에서 branch를 바꾸는 것은 **HEAD**의 pointer만 바꿔주면 되기때문에 아주 쉽다. 아래의 명령어를 통해 branch를 바꿔 보자

```
git checkout testing
```
branch를 변경하게 되면 아래와 같이 **HEAD**는 testing branch를 가르키게 된다.

![](/assets/pro_git/HEAD_pointing_to_the_curren_branch.png)
(*  출처: Pro Git)

아래의 git log 명령어로 다시 확인해 보면 **HEAD**가 현재 testing branch를 가르키고 있는 것을 확인 할 수 있다.
```
git --no-pager log  --oneline --decorate
```

```
“f30ab (HEAD -> testing, master) add feature #32 - ability to add new formats to the central interface
34ac2 Fixed bug #1328 - stack overflow under certain conditions
98ca9 The initial commit of my project”
```
현재 상태에서 특정 파일을 변경 한 후에 commit을 하게 되면 testing branch는 새로운 commit hash를 가르키게 된다 (move forward).

![](/assets/pro_git/the_HEAD_branch_moves_forward_by_new_commit.png)
(*  출처: Pro Git)

반면 master branch로 변경하여 git log를 통해 master branch가 가르키는 commit hash를 보면 이전과 동일한 commit hash임을 확인 할 수 있다.

 ![](/assets/pro_git/HEAD_moves_by_checkout_to_master.png)
(*  출처: Pro Git)

위처럼 branch를 변경하게 되면,  **HEAD** pointer를 현재의 branch로 변경하게 되는 것이고 또한 변경한 branch가 가르키는 commit hash에 해당 하는 snapshot내의 파일들로 변경이 되는 것이다.

master branch에서 다른 파일을 변경하여 commit을 하게 되면 testing branch와는 별도의 commit history를 가지게 된다.

![](/assets/pro_git/divergent_history.png)
(*  출처: Pro Git)

```
“git log --oneline --decorate --graph --all”
```

```
* c2b9e (HEAD, master) made other changes
| * 87ab2 (testing) made a change
|/
* f30ab add feature #32 - ability to add new formats to the
* 34ac2 fixed bug #1328 - stack overflow under certain conditions
* 98ca9 initial commit of my project”
```

### 기본적인 branching과 병합(merging)
Git을 사용하면서 아래와 같은 실제적인 업무 수행을 한다고 가정해보자.

1. Web 기반의 애플리케이션을 개발하고 있다.
2. 새로운 기능에 대한 스토리를 구현하기 위해 새로운 branch를 만들었다.
3. 새로 만든 branch에서 코드 작업을 하고 있다.

위와 같은 순서로 일을 하고 있는 도중에 치명적인 결함이 발견되어 급패치(hotfix)를 내보내야 한다면 아래와 같이 해야 할 것이다.

1. production 코드가 존재하는 branch로 변경한다.
2. hotfix branch를 생성하여 hotfix를 위한 코드를 작성한다.
3. 작성한 코드를 확인하기 위해 테스트를 수행한 후에, hotfix branch의 코드를 병합(merge)하고 production으로 반영한다.
4. production 반영 후에, 원래의 스토리 구현 작업으로 복귀하여 계속 작업을 진행한다.

#### 기본적인 branching
master branch를 production 배포용 branch로 사용을 하고 있고, 이전에 작업한 commit들이 다수 존재한다는 상황에이라고 해보자.

![](/assets/pro_git/a_simple_commit_history.png)
(*  출처: Pro Git)

이제 새로운 스토리인 #53을 처리하기 위한 코드 작업을 하기 위해 새로운 branch를 생성한다.

```
git checkout -b iss53
Switched to a new branch iss53
```

![](/assets/pro_git/creating_a_new_branch_pointer.png)
(*  출처: Pro Git)
위의 그림상에는 표시가 되어 있지 않지만 **HEAD**는 iss53 branch를 가리킨다.

이제 #53번 일감을 처리하기 위한 코드 반영을 위해 commit을 하게 되면 iss53 branch는 아래의 그림과 같이 앞으로(forward) 이동하게 된다.

```
vim index.html
git commit -a -m 'added a new footer [issue 53]”
```

![](/assets/pro_git/iss53_branch_has_moved_forward_with_the_work.png)
(*  출처: Pro Git)

이런 상황에서 치명적인 결함을 보고 받고 이를 즉시 수정하기 위한 작업을 해야 한다면 아래와 같이 해야 할 것이다.

다음과 같이 production 배포용 branch인 master branch로 변경한다. 단, iss53 branch에서 commit되지 않은(unstaged) 코드들이 있다면 master branch로 변경을 할 수 없다. 따라서 코드를 commit해도 상관없다면 commit을 하고 그렇지 않은 경우는 stash를 한다. (* stash는 이후에 다룬다.). 즉, 현재 작업 상태를 최대한 clean하게 유지를 해야 한다. 그렇게 하기 위해선 작업을 잘게 나누고 잘게 나뉜 작업 별로 commit을 자주하는 것이 좋다.
```
git checkout master
Switched to branch 'master'
```
master branch로 변경하게 되면, master branch의 현재 상태는 #53번 이슈를 처리하기 이전의 상태가 된다. 따라서 치명적인 결함을 수정하기 위한 hotfix 코드를 작성하기 좋은 상태가 되는 것이다.

이제 hotfix를 위한 branch를 생성하고 코드를 수정한다.

```
git checkout -b hotfix
Switched to a new branch 'hotfix'
vim index.html
```

코드 수정을 완료한 후에, 반드시 테스트를 통해 결함 처리가 완료되어 정상작동을 하는지를 확인한다. 그리고 코드를 commit한다.
```
git commit -a -m 'fixed the broken email address'
[hotfix 1fb7853] fixed the broken email address
 1 file changed, 2 insertions(+)
```
![](/assets/pro_git/hotfix_branch_based_on_master.png)
(*  출처: Pro Git)

가능하다면 테스트를 한번 더 수행하고, 작성한 코드를 포함한 hotfix branch를 master로 병합(merge)한다.

```
git checkout master
git merge hotfix
Updating f42c576..3a0874c
Fast-forward
 index.html | 2 ++
 1 file changed, 2 insertions(+)
```
위의 병합 과정에서 표시되는 메세지 중 **Fast-forward**라는 단어를 발견할 수 있다. 그 이유는 현재 hotfix branch는 C4 commit을 가르키고 있고, master branch는 C2를 가르키고 있다. 즉, C2 commit이 C4 commit의 바로 이전 commit인 것이다. 이런 상황에서 master로 병합을 하게되면 Git은 master branch의 commit pointer를 C4로 이동 시켜 버린다.
다시 말하면, 특정 commit을 첫번째 commit과 연결되어 있는 다른 commit과 병합을 원할때, Git은 함께 병합할 다른 분기가 없기 때문에 바로 pointer를 이동 시켜 버린다. 이것을 "fast-forward"라고 한다. 단 master에 다른 commit이 있다면 해당 병합을 위한 commit이 생성된다.

> Fast-forward가 간단하기때문에 좋아 보일 수 있지만, 해당 병합에 대한 commit 이력이 남지 않는 단점이 있다. Fast ㅋforwarding 없이 병합을 commit 이력으로 남기기 위해선 ```--no-ff```옵션을 사용하면 된다.


master branch로 병합 후, production으로 배포 할 수 있다.
![](/assets/pro_git/master_is_fast_forwarded_to_hotfix.png)
(*  출처: Pro Git)

production으로 hotfix 수정 사항을 반영한 후, hotfix branch는 더이상 필요가 없다. 그 이유는 이미 master branch가 hotfix branch와 동일한 commit hash를 가리키고 있기 때문이다.  아래의 명령어로 hotfix branch를 삭제한다.

```
git branch -d hotfix
```
그럼 이제 hotfix이전에 작업 중인 #53을 처리하기 위한 iss53 branch로 되돌아가서 계속 진행을 하면 된다.

```
git checkout iss53
Switched to branch "iss53"
vim index.html
git commit -a -m 'finished the new footer [issue 53]'
[iss53 ad82d7a] finished the new footer [issue 53]
1 file changed, 1 insertion(+)
```

![](/assets/pro_git/work_continues_on_iss53.png)
(*  출처: Pro Git)

#### 기본적인 병합(merging)
새로운 스토리인 #53 처리를 위한 코드 작업이 완료 되었다면, master branch로의 병합을 할 준비가 된 것이다. 이전에 hotfix branch를 병합하는 것과 방법은 동일하다.

```
git checkout master
Switched to branch 'master'
git merge iss53
Merge made by the 'recursive' strategy.
index.html |    1 +
1 file changed, 1 insertion(+)”
```
![](/assets/pro_git/three_snaphots_used_in_a_typical_merge.png)
(*  출처: Pro Git)

하지만 hotfix branch를 병합할 때와는 다른 점이 있다. 이미 master branch에는 hotfix의 코드들이 commit되어 있고, iss53 branch에는 #53 일감을 처리하기 위한 코드들이 commit되어 있다. 즉, 현재의 작업 중인 branch의 commit은 병합 대상이 되는 branch의 현재 commit의 바로 이전 commit이 아니다. 그렇기 때문에 Git은 각각의 branch가 가리키는 snapshot들과 공통 조상이 되는 commit을 이용해서 three-way 병합(merge)을 수행한다.

Git은 "C2" commit을 두개의 branch들을 병합하기 위한 merge base로 사용하였다. 이렇게 Git이 알아서 merge base를 선택하고 사용하기 때문에 Git을 통해 병합을 보다 더 쉽게 수행 할 수 있다.

![](/assets/pro_git/a_merge_commit.png)
(*  출처: Pro Git)

\#53 일감을 위한 코드 작업이 완료 되었으니 iss53 branch는 더 이상 필요가 없다. 따라서 아래와 같이 삭제 처리를 한다.

```
git branch -d iss53
```

#### 기본적인 병합시 발생하는 충돌(Conflict) 해결
branch간 병합이 언제나 아무런 문제 없이 잘 되는 것은 아니다. 만약 각 branch에 동일한 파일에 대한 변경이 있을 경우, 각 branch에서의 파일 변경 내용을 병합을 해야 하는데 Git은 이런 병합을 깔끔하게 해결해 주지는 않는다.  아래는 동일한 파일에 대해 충돌(Conflic)가 발생한 경우이다.

```
git merge iss53
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```
Git은 자동으로 새로운 commit을 생성해주지 않고 충돌이 해결이 될때까지 잠시 새로운 commit을 생성하는 프로세스를 멈춘다.  이때의 상태를 확인해 보면 아래와 같을 것이다.

```
“git status
On branch master
You have unmerged paths.
  (fix conflicts and run "git commit")

Unmerged paths:
  (use "git add <file>..." to mark resolution)

    both modified:      index.html

no changes added to commit (use "git add" and/or "git commit -a")”
```
위의 메세지에서 보듯, 병합 처리 완료된 파일과 아직 병합 처리가 되지 않은, 즉 충돌이 발생한 파일을 확인 할 수 있다. 그리고 충돌이 발생한 파일을 열어 보면 Git이 충돌이 발생한 부분에 추가한 표시자(marker)를 확인 할 수 있다.

```
“<<<<<<< HEAD:index.html
<div id="footer">contact : email.support@github.com</div>
=======
<div id="footer">
 please contact us at support@github.com
</div>
>>>>>>> iss53:index.html”
```
위의 예제는 충돌 부분에 Git이 표시자를 추가한 것으로,  표시자 내용을 자세히 살펴보자.
**HEAD** (병합 대상 branch. 예) master branch)와 **=======** 표시자 사이의 내용 병합 대상 branch의 HEAD의 내용이다. 그리고 **=======** 이후 내용이 iss53 branch에서 변경된 내용을 나타낸다.  따라서 각 branch의 내용을 확인하고 한쪽을 선택하던지, 두 부분을 적절히 수정하여야 한다. 단 `<<<<<<<` 표시자, **=======** 표시자 그리고 `>>>>>>>` 표시자는 최종 수정내용에서 반드시 제거해야 한다.

충돌 내용을 모두 수정 한후에는, ```git add```명령어로 충돌 부분을 모두 처리 했음(staging) 을 Git에 알려줘야 한다.

> 충돌 부분을 처리 하기 위해, graphical tool을 사용할 수 있다. 이때의 명령어는 ```git mergetool```이고 사전에 어떤 tool을 사용할 지 설정을 해줘야 한다. 다음은 opendiff를 mergetool로 설정하는 명령어이다.

```
git config --global merge.tool opendiff
```
다시  ```git status```로 상태를 확인해 보면 아래와 같은 내용을 확인 할 수 있을 것이다.

```
git status
On branch master
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:

    modified:   index.html
```
모든 내용을 꼼꼼히 살펴보고 이상이 없다면 ```git commit``` 명령어를 통해 **merge commit**을 종료 처리해야 한다.  다음은 **merge commit**의 commit message이다.

```
Merge branch 'iss53'

Conflicts:
    index.html
#
# It looks like you may be committing a merge.
# If this is not correct, please remove the file
#	.git/MERGE_HEAD
# and try again.


# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
# On branch master
# All conflicts fixed but you are still merging.
#
# Changes to be committed:
#	modified:   index.html
#
```

#### Branch 관리하기
다음의 명령어를 아무런 인자 없이 실행하면 Git은 모든 branch를 포함한 목록을 표시해준다. 단 아래의 예제에서처럼 branch 이름 앞에 **\*** 표시가 되어 있는 branch는 현재 checkout을 한 branch를 나타낸다.
(* HEAD가 가리키는 branch를 나타낸다고도 할 수 있다.)

```
git branch
```

```
iss53
* master
  testing
```
단순히 branch 목록을 보는 것보다 각 branch의 마지막 commit 내용까지 보고 싶다면 ```git branch -v``` 명령어를 실행하면 된다. 그러면 아래와 같이 branch별로 마지막 commit을 함께 표시해 준다.

```
]git branch -v
  iss53   93b412c fix javascript issue
* master  7a98805 Merge branch 'iss53'
  testing 782fd34 add scott to the author list in the readmes
```

또한 유용한 옵션으로 **--merged**와 **--no-merged** 옵션들이 있다. **--merged** 옵션은 현재 checkout되어 있는 branch와 지금까지 병합된 적이 있는 모든 branch들을 보여 준다. 따라서 **\***표시가 없는 branch는 모두 삭제해도 무방하다고 볼 수 있다.

**--merged**와는 반대로 **--no-merged** 옵션은 병합을 하지 않은 branch들을 보여준다. **--no-merged** 옵션을 통해 표시되는 branch들은 아직 병합되지 않은 코드들을 포함하고 있기때문에 삭제할 수 없다. (* 단 **-D** 옵션을 주어 강제로 삭제는 할 수 있다.)

> **--merged**와 **--no-merged** 옵션에 추가로 branch이름을 인자로 줄 수 있다. branch이름을 인자로 줄 경우, 현재 checkout한 branch가 아닌 인자로 주어진 branch를 기준으로 병합이 이루어진 혹은 그렇지 않은 branch들을 확인 할 수 있다. 다음음 testing branch로 checkout하였지만 master branch와 병합이 이루어지지 않은 branch를 확인하는 명령어와 그 결과이다.

```
git checkout testing
git branch --no-merged master
topicA
featureB
```

#### 작업 흐름(workflow)에 맞게 Branching 하기

보통의 프로젝트에서는 계발 그리고 운영 등으로 개발 환경을 구분하여 사용한다. 이런 개발 환경은 개발 정책에 따라 변경이 되는데, 단순히 개발 그리고 운영으로 나누기 보단 개발, 릴리즈, 스테이지 그리고 운영(Production)으로 나누어 개발을 진행하게 된다.

이제 이전에 살펴 보았던 branching과 병합(merging)을 활용하여 많이 사용되는 workflow들을 살펴 볼 것이고, 살펴본 workflow들을 자신의 개발주기에 사용할지를 결정 할 수 있을 것이다.

##### Long-Running Branches

Git은 단순한 3-way merge를 사용하기때문에, 오랜 기간에 걸쳐 여러번 발생되는 특정 branch에서 다른 branch로의 병합을 쉽게 할 수 있다. 이를 통해 개발 주기의 각 단계에 해당 하는 branch를 만들어 사용 할 수 있고, 각 단계별 branch에서 다른 단계의 branch로 주기적인 병합을 할 수 있다.

보통 Git을 사용하는 많은 개발자들은 운영(Production) 환경에 배포되는 그리고 항상 결합 없이 안정된 코드를 포함하는  master branch와 개발 환경을 위한 develop(혹은 next) branch를 사용한다. develop branch는 항상 모든 코드가 안정될 필요는 없고 테스트를 위한 branch로 사용이 된다. 그리고 테스트를 거쳐 안정된 상태가 보장이 될때 master branch로 병합한다. 또한 특정 기능개발등을 위한 branch(예,  이전에 사용했던 iss53 branch)를 생성하는 기준이 되는 branch로 develop branch를 사용한다.

실제로는 일련의 commit으로 구성되는 선을 따라 움직이는 포인터에 대해 말하고 있는 것인데, master branch와 같이 안정된 branch들은 그 포인터가 commit history상에서 아래쪽에 존재하게 되며, develop branch 혹은 특정 기능 개발을 위한 branch들은 그 포인터가 commit history상의 위쪽에 존재하게 된다. 아래의 그림을 보면 쉽게 이해 할 수 있을 것이다.

![](/assets/pro_git/a_linear_view_of_progressive_stability_branching.png)
(*  출처: Pro Git)

각 branch들은 commit들을 포함하고 있는 일종의 저장소로 생각하면 좋다. 그리고 테스트를 거친 commit들은 안정된 branch로 병합이 된다.

![](/assets/pro_git/a_silo_view_of_progressive_stability_banching.png)
(*  출처: Pro Git)

여러 안정성 단계, 즉 topic, develop 그리고 master와 같이 안정성별로 branch를 유지하는 방법을 사용할 수 있다. 일부 규모가 큰 프로젝트에서는 **proposed** 혹은 pu (proposed updates) branch를 두는데, 그 이유는 develop 혹은 master branch로의 병합이 아직 준비가 되지 않은 사항들을 통합하여 저장해 놓기 위함이다.

 각 안정성 단계별로 branch를 두는 것은 각 단계별로 좀 더 안정성이 보장되도록 하기 위함이고 각 단계별 안정성이 만족이 되면 다음 단계 즉, 다음 branch로 병합하여 이동 시키기 위함이다. long-running branch들을 두는 것이 필수는 아니지만 규모가 크고 복잡한 프로젝트를 잘 관리하는데 많은 도움이 된다.

#### 토픽 Branches

프로젝트의 규모에 상관없이 topic branch를 유용하게 사용할 수 있다. Topic branch는 특정 기능 혹은 관련 작업만을 위한 용도로 사용되기때문에 짧은 기간의 생명주기를 가진다. 이런 topic branch의 사용은 기존 VCS와 같은 기존의 소스 관리 시스템에서는 거의 사용을 하지 않는데, 그 이유는 branch를 생성하고 병합하는 비용이 너무 비싸기 때문이다. 하지만 Git을 사용하게 되면 하루동안에 여러개의 branch들을 생성하고 생성된 branch에서 작업한후 병합 및 삭제하는 것이 쉽고 일상적인 일이다.

이전에 살펴 보았던 iss53과 hotfix branch들을 보면 알 수 있을 것이다. 몇개의 commit을 branch에 적용하고 주(main) branch에 병합한 후에, 바로 삭제 하였다. 이렇게 쉽게 branch를 생성, 병합 그리고 삭제하는 기술은 작업의 전환(context-switch)를 빠르고 완전하게 할 수 있도록 해준다. 왜냐면, 해야할 작업 자체가 해당 작업과 관련되 branch의 모든 변경 사항을 포함하고 있는 각 저장소에 분리되기 때문이다. 그래서 코드 리뷰와 같은 활동안에서 발생 했던 일들을 쉽게 파악할 수 있다. 변경 사항들을 특정 기간에 상관없이 가지고 있을 수 있고, 병합할 준비가 되었을때 branch를 언제 생성했고 언제 작업을 했는지에 상관없이 병합을 할 수 있다.

다음의 예를 한번 살펴 보자. 이미 master branch에서 몇개의 작업을 수행하였고, iss91번을 처리하기 위해 별도의 branch를 생성하였다. 그리고 동일한 이슈(iss91)을 처리하기 위하 다른 방법을 살펴보기 위해 두번째 branch를 생성하였다. 그런 후에 다시 master branch로 돌아가 잠시동안 작업을 한뒤, 좋은 방안인지는 모르지만 다른 방법으로 코드 작업을 수행한 branch(dumbidea)를 생성하였다. 이런 상황을 거친뒤의 각 branch의 commit history는 아래와 같을 것이다.

![](/assets/pro_git/multiple_topic_branches.png)
(*  출처: Pro Git)

이제, 두번째 해결책(iss91v2)가 가장 좋다고 결정했다고 하자. 그리고 dumbidea branch를 동료에게 보여주었고, 그 방안이 두번째 해결책보다 더 좋은 천재적인 방안으로 판명 되었다. 그래서 iss91 branch는 버려버리고(C5와 C6 commit은 잃어버리게 된다) 다른 두 branch들을 병합한다. 그러면 commit history는 아래와 같을 것이다.

![](/assets/pro_git/history_after_merging_dumbidea_and_iss91v2.png)
(*  출처: Pro Git)

위에서 했던 모든 작업은 모두 local에서 이루어진 것이라는 것을 명심해야 한다. 새로운 branch를 만들고 병합하는 등의 모든 작업은 local의 Git 저장소에서 이루어진 것이다. 원격의 서버와는 아무런 통신이 이루어 지지 않았다.

#### 원격 Branches

 원격 참조는 branch, tag 등등을 포함하는 원격 저장소의 참조(포인터)이다. 원격 저장소에 대한 참조 값의 목록은 ```git ls-remote```, ```git remote``` 혹은 ```git remote show [remote]``` 명령어를 통해 확인할 수 있다. ```git remote show [remote]``` 명령은 원격 branch들 뿐만 아니라 더 많은 정보를 보여준다. 위와 같은 명령어를 통해 원격 저장소를 확인하는 방법에도 불구하고 좀 더 일반적인 방법은 원격-추적(remote-tracking) branch들을 활용하는 것이다.

 원격-추적 branch들은 원격 branch들의 상태에 대한 참조값인데, 직접 옮길 수 없는 local 참조값이다. Git이 네트웍을 통한 통신을 할때마다 그 참조값들이 원격 저장소의 상태를 정확히 반영하고 있는지를 확신하기 위해서 local 참조값들을 옮겨준다.

 원격-추적 branch는 **\<remote\>/\<branch\>**의 형태를 취한다. 예를 들어 원격 저장소인 마지막으로 통신했을때 그때 그대로의 상태를 가지고 있을 것으로 보이는 origin의 mater branch를 보고 싶을 경우, **origin/master** branch를 확인하면 된다. 만약 파트너와 함께 이슈처리를 위한 작업을 수행하면서 파트너들이 iss53 branch를 push를 했을 경우, 이미 local에 iss53 branch가 있을 수 있다. 하지만 서버상에 존재하는 branch는 local에서 **origin/iss53**으로 표현된다.

 이게 약간 헛갈릴 수 있는데, 예를 한번 들어보자. Git 서버가 <span>git</span>.<span>compnay</span>.com의 네트웍상에 존재 한다고 하자. 이 원격의 Git 서버에서 clone을 해서 local 저장소를 만들었을때, Git의 clone 명령어는 자동으로 **origin**이라는 원격 저장소에 대한 참조값을 생성한다. 그리고 원격 저장소의 모든 데이터를 가져오고 원격 저장소의 **master** branch를 참조하는 **origin/master** 포인터를 로컬(local)에 생성한다. 또한  Git은  **원격의 master** branch와 동일한 상태를 가지는 **로컬의 master** branch를 생성한다. 따라서 **로컬의  master** branch에서 작업을 시작할 수 있다.
