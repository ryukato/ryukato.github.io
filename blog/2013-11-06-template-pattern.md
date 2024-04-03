---
slug: Template pattern
title: Template pattern
authors: ryukato
date: 2013-07-05 09:36:55
tags: [Java, Design-Pattern, Template-pattern]
---

<!-- truncate -->

# Template pattern 예제
프로젝트 진행중 비상연락망을 엑셀로 업로드하여 데이터를 DB table에 insert하는 기능을 구현해야하는데 문제는 비상연락망이 하나가 아니라 현업 비상연락망, 외부기관 및 협력업체 이렇게 세가지가 있다고 한다. 차후에 추가될지도(그렇지 않겠지만) 모른다는 생각이 들어  template pattern으로 해보면 어떨가 하여 샘플 코드를 아래와 같이 짜 보았다. 전자정부 프레임워크인가 프로젝트 workspace에 있는 패키지 중에 ExcelUtil이라는 클래스가 있는데 엑셀 내용을 읽어서 `List<Map<String,Object>>` 타입으로 반환해주는 함수가 있었는데 이를 이용하면 쉽게 아래의 **AbstractExcelUploadTemplate** 클래스의 read 메서드를 구현할 수 있을 거라는 생각이 든다. 그래서 일단은 테스트 용이기때문에 테스트 데이터를 반환해주는 용도로 사용하였다.

## Interface
실제 구현 내용을 포함함 AbstractExcelUploadTemplate를 숨기는 용도로 그리고 그냥 Spring에서 interface와 구현체를 선언해서 하는 것에 익숙해 일단 interface를 만들었다. 별거 없다. upload 하나다.

###### ExcelUploader class
```
public interface ExcelUploader {
	void upload(String filePath) throws Exception;
}
```

## Template Class

###### AbstractExcelUploadTemplate class
```
public abstract class AbstractExcelUploadTemplate implements ExcelUploader {
	abstract Map<String,String> buildColMapper(Set<String> colNameSet);
	abstract void insertExcelRow(Map<String,Object> queryParam) throws Exception;

	protected List<Map<String,Object>> read(String filePath){
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>(10);

    for(int i=0;i<10;i++){
			Map<String,Object> item = new HashMap<String,Object>();

			for(int j=0;j<10;j++){
				String key = "col"+j;
				String value="test_data_"+i+"_"+j;
				item.put(key, value);
			}// end of inner for loop

			list.add(item);
		}// end of outer for loop
	  return list;
	}

	protected Map<String,Object> buildQueryParam(Map<String,Object> rowItem) {
		if(rowItem == null) return null;

		Set<String> colNameSet = rowItem.keySet();
		Map<String,Object> queryParam = new HashMap<String,Object>();
		Map<String,String> colMapper = buildColMapper(colNameSet);

		for(String colName:colNameSet){
			String key = colMapper.get(colName);
			Object value = rowItem.get(colName);
			queryParam.put(key, value);
		}
		return queryParam;
	}

	//template method
	public void upload(String filePath) throws Exception{
		List<Map<String,Object>> list = read(filePath);
		Iterator<Map<String,Object>> it = list.iterator();

    while(it.hasNext()){
			Map<String,Object> rowItem = it.next();
			Map<String,Object> queryParam = buildQueryParam(rowItem);
			if(queryParam == null){
				continue;
			}
			insertExcelRow(queryParam);
		}
	}
}
```

## Implementation classes

```
public class EmergencyUploader extends AbstractExcelUploadTemplate {

	@Override
	Map<String, String> buildColMapper(Set<String> colNameSet) {
		Map<String,String> colMapper = new HashMap<String,String>();
		colMapper.put("col0", "newCol0");
		colMapper.put("col1", "newCol1");
		colMapper.put("col2", "newCol2");
		colMapper.put("col3", "newCol3");
		colMapper.put("col4", "newCol4");
		colMapper.put("col5", "newCol5");
		colMapper.put("col6", "newCol6");
		colMapper.put("col7", "newCol7");
		colMapper.put("col8", "newCol8");
		colMapper.put("col9", "newCol9");
		return colMapper;
	}

	@Override
	void insertExcelRow(Map<String, Object> queryParam) throws Exception{
		System.out.println(queryParam);
		//call insert method of DAO object
	}
}
```

각 비상연락망 마다 달라지는 부분은 엑셀의 컬럼명과 Table의 칼럼명이고 테이블에 insert할 쿼리 반면  전체적인 흐름 - 엑셀을 읽고 엑셀 칼럼과 테이블 칼럼을 매핑 시키고 테이블에 insert할 데이터를 생성해서 테이블에 데이터를 insert하는 동일한 흐름을 가지기 때문에 **buildColMapper**, **insertExcelRow** 두 메서드를 추상 메서드로 선언하고 실제 구현은 각 구현체에게 위임함으로써 전체적인 흐름은 유지를 하되 변경되는 부분만 구현체에서 구현해주면 된다는 것. 이것이 Template pattern의 핵심이 아닐까 생각한다.
