---
slug: 정규식을 사용한 숫자,영문,한글 입력 제한
title: 정규식을 사용한 숫자,영문,한글 입력 제한
authors: ryukato
date: 2016-01-27 09:36:55
tags: [JavaScript, RegEx, "숫자,영문,한글 입력 제한"]
---

# JavaScript - 숫자,영문,한글 입력 제한
정규식을 사용하여 숫자만, 영문만, 영문과 숫자만 그리고 우리 위대한 한글만 입력할 수 있게 하였다.
테스트는 윈도우즈 크롬, 맥 크롬, 맥 사파리, 우분투 파폭에서 해보았고 모두 정상 작동 하는것을 확인하였다.  이벤트 keyCode를 받아 처리하는 코드도 보았지만 이 방법이 코딩도 적고 간단하여 구현해보았다. 정규식 참 요긴하게 쓰인다. 날잡아서 정규식을 다시 한번 봐야겠다.

## 정규식
정규식을 사용하면 숫자만, 알파벳만, 숫자-알파벳 혹은 한글만을 입력할 수 있도록 제한 할 수 있다. 다음음 숫자만, 알파벳만, 숫자-알파벳만을 뽑아내는 정규식이다.

* 숫자만 : ```/[0-9]/gi```
* 대소문자 상관없이 알파벳만: ```/[a-z]/gi```
* 숫자와 알파벳만: ```/[a-z0-9]/```

위의 각각의 정규식에서 ```^```(not)을 붙이게 되면 숫자가 아닌 문자, 알파벳이 아닌 문자, 숫자와 알파벳이 아닌 문자들을 제거 할 수 있다.

* 숫자가 아닌 나머지 제거: ```text.replace(/[^0-9]/gi)```
* 알파벳이 아닌 나머지 제거: ```text.replace(/[^a-z]/gi)```
* 숫자와 알파벳이 아닌 문자 제거: ```text.replace(/[^a-z0-9]/)```

## 예제 코드
위의 정규식과 원하는 문자 유형을 제외한 나머지를 제거하는 코드를 사용한 예제는 아래와 같다. 아래의 코드를 실행하기 위해선 jQuery가 필요하다. 하지만 input 요소의 값을 읽기 위해 jQuery가 필요한 것이고 정규식을 활용한 원하지 않는 문자 제거 코드들은 jQuery가 없어도 동작한다.

```
<html>
    <head>
        <script
  src="https://code.jquery.com/jquery-1.12.4.min.js"
  integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="
  crossorigin="anonymous"></script>
        <script type="text/javascript">
            $(document).ready(function(){
                $("#input1").keyup(function(event){
                    if(event.keyCode !=8){
                        var result = "keycode="+ event.keyCode + " value="+ String.fromCharCode(event.keyCode);
                        var preHtml = $("#result").html();
                        $("#result").html(preHtml+ "<br />" +result);
                    }
                    if($(this).val() ==""){
                        $("#result").empty();
                    }

                });
                $("#onlyNumber").keyup(function(event){
                    if (!(event.keyCode >=37 && event.keyCode<=40)) {
                        var inputVal = $(this).val();
                        $(this).val(inputVal.replace(/[^0-9]/gi,''));
                    }
                });
                $("#onlyAlphabet").keyup(function(event){
                    if (!(event.keyCode >=37 && event.keyCode<=40)) {
                        var inputVal = $(this).val();
                        $(this).val(inputVal.replace(/[^a-z]/gi,''));    
                    }
                });
                $("#notHangul").keyup(function(event){
                    if (!(event.keyCode >=37 && event.keyCode<=40)) {
                        var inputVal = $(this).val();
                        $(this).val(inputVal.replace(/[^a-z0-9]/gi,''));
                    }
                });
                $("#onlyHangul").keyup(function(event){
                    if (!(event.keyCode >=37 && event.keyCode<=40)) {
                        var inputVal = $(this).val();
                        $(this).val(inputVal.replace(/[a-z0-9]/gi,''));
                    }
                });
            });
        </script>
    </head>
    <body>
        숫자만: <input type="text" id="onlyNumber" /> <br />
        영문만: <input type="text" id="onlyAlphabet" /> <br />
        영문,숫자만:<input type="text" id="notHangul" /><br />
        한글만:<input type="text" id="onlyHangul" /><br />
        keyCode: <input type="text" id="input1" />
        <div id="result">
        </div>
    </body>
</html>
```

### 2013 /10/ 05 IE 버그 수정

```
<html>
    <head>
        <title>
            input handler test
        </title>
        <script
  src="https://code.jquery.com/jquery-1.12.4.min.js"
  integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="
  crossorigin="anonymous"></script>
        <script type="text/javascript">
            /*
            conditions
             - jquery obj for input
             - data type(AP: alphabet, N: number, HA: hangul, AN: alphanumeric)
             - event type (click, keydown, keypress, keyup(*default) ...)
             - handler binded event type (*optional)
             - max length( *optional)

            */
            function addInputHandler(conditions){
                var $input = conditions.input;
                var dataType = conditions.dataType;
                var eventType = conditions.eventType;
                if ((!$input) || (!dataType)) {
                    throw {error:"NotEnoughArguments", errorMsg:"required argument is missing " +((!$input)?" target input element":" dataType")}
                    return;
                }
                if ($input[0].tagName != "INPUT") {
                    throw {error:"IlregalTargetElement", errorMsg:"target element is not input"};
                    return;
                }
                if ((!eventType)) {
                    eventType = "keyup";
                }
                var handlerFunc = conditions.handler;
                if ((!handlerFunc)) {
                    handlerFunc = function(event){
                        $("#divKeyCode").empty().html("<span> event key code = "+event.keyCode+"</span>");
                        var regEx = null;
                        if (dataType == "N") {
                            regEx = /[^0-9]/gi;
                        } else if (dataType == "AP") {
                            regEx = /[^a-z]/gi;
                        }else if (dataType == "AN") {
                            regEx = /[^a-z0-9]/gi;
                        }else if (dataType == "HA") {
                            regEx = /[a-z0-9]/gi;

                        }else{
                            throw {error:"IlregalDataType", errorMsg:"dataType("+dataType+") is incorrect"}     
                        }
                        remainOnlyTargetValue(regEx, $input,event);
                        //return true;
                    };  // end of handlerFunc
                } // end of if to check handlerFunc
                $input.on(eventType,handlerFunc);

                if (conditions.maxlength) {
                    $input.attr("maxlength",conditions.maxlength);
                }

            }
            function remainOnlyTargetValue(regEx, $input,event) {
                if ((!(event.keyCode >=34 && event.keyCode<=40)) && event.keyCode != 16) {
                    var inputVal = $input.val();
                    if (regEx.test(inputVal)) {
                        $input.val(inputVal.replace(regEx,''));    
                    }
                }
            }

            $(document).ready(function(){

                try {
                    addInputHandler({input:$("#onlyNumber"),dataType:"N",maxlength:7});
                    addInputHandler({input:$("#onlyAlphabet"),dataType:"AP"});
                    addInputHandler({input:$("#alphaNumeric"),dataType:"AN"});
                    addInputHandler({input:$("#hangul"),dataType:"HA"});
                } catch(e) {
                    console.log(e);
                }
            });
        </script>
    </head>
    <body>
        <label for="onlyNumber">onlyNumber:</label><input type="text" name="onlyNumber" id="onlyNumber" /> <br />
        <label for="onlyAlphabet">onlyAlphabet:</label><input type="text" name="onlyAlphabet" id="onlyAlphabet" /> <br />
        <label for="alphaNumeric">alphaNumeric:</label><input type="text" name="alphaNumeric" id="alphaNumeric" /> <br />
        <label for="hangul">hangul:</label><input type="text" name="hangul" id="hangul" /> <br />

        <select name="testSelect" id="testSelect">
            <option value="1">1</option>
        </select>
        <div id="divKeyCode"></div>
    </body>
</html>
```

## 수정사항
- 입력된 keyCode값을 알아내는 부분 (```$("#input1").keyup(function(event){```) 을 keydown에서 keyup으로 변경. keydown으로 했을 경우 첫입력 글자가 누락되는 현상이 있어 수정
- 숫자만, 영문만, 영문 그리고 숫자만 입력 받는 부분에서 정규식만 사용할 경우 방향키도 막아버리는 오류가 있어 입력된 keycode값이
방향키가 아닐 경우만 처리하도록 분기처리
- 그리고 위대한 한글만 입력 받는 부분 추가.  (한글만 받는 부분은 당연 입력된 문자에서 영문과 숫자가 있으면 해당 부분을 공백으로 대체하여 한글만 입력되는 효과를 낸것이다. 물론 다른 부분도 마찮가지.)
