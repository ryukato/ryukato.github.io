---
slug: Visitor 패턴 및 java.nio.Path, PathMatcher, Files를 이용한 File찾기
title: Visitor 패턴 및 java.nio.Path, PathMatcher, Files를 이용한 File찾기
authors: ryukato
date: 2014-07-11 09:36:55
tags: [Java, Design-Pattern, Visitor, PathMatcher]
---

# Visitor 패턴 및 java.nio.Path, PathMatcher, Files를 이용한 File찾기

###### ResourceMatcher class
```
import java.io.File;

public interface ResourceMatcher {
	public static final String MATCH_PATTERN_PREFIX = "glob:";
	boolean isMatch(File file);
}

```

###### AbstractResourceMatcher class
```
import java.io.File;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.PathMatcher;

public abstract class AbstractResourceMatcher implements ResourceMatcher {

	@Override
	public boolean isMatch(File file) {
		String searchPattern = String.format("%s%s", ResourceMatcher.MATCH_PATTERN_PREFIX, getPattern());
		Path path = file.toPath();
		PathMatcher matcher = FileSystems.getDefault().getPathMatcher(searchPattern);
		final boolean isMatch = matcher.matches(path.getFileName());
		return isMatch;
	}

	abstract String getPattern();

}
```

###### ExcelFileMatcher class
```
public class ExcelFileMatcher extends AbstractResourceMatcher{
	@Override
	String getPattern() {
		final String exelFilePattern = "*.{xlsx, xls}";
		return exelFilePattern;
	}

}
```
###### ImageFileMatcher class
```
public class ImageFileMatcher extends AbstractResourceMatcher{

	@Override
	String getPattern() {
		final String imageFilePattern = "*.{jpg, png,bmp}";
		return imageFilePattern;
	}

}

```

###### JavaFileMatcher class
```
public class JavaFileMatcher extends AbstractResourceMatcher{

	@Override
	String getPattern() {
		final String javaFilePattern = "*.{java, class}";
		return javaFilePattern;
	}

}

```

###### ResourceMatcherFactory class

```
public class ResourceMatcherFactory {
	public enum ResourceType{
		EXCEL, TEXT, IMAGE,JAVA;
	}

	private static ResourceMatcher excelFileMatcher = new ExcelFileMatcher();
	private static ResourceMatcher textFileMatcher = new TextFileMatcher();
	private static ResourceMatcher imageFileMatcher = new ImageFileMatcher();
	private static ResourceMatcher javaFileMatcher = new JavaFileMatcher();

	public static ResourceMatcher createMatcher(ResourceType resourceType){
		if(resourceType == null){
			final String exceptionMessage = "Empty(Null) resource type";
			throw new RuntimeException(exceptionMessage);
		}
		ResourceMatcher testResourceMatch = null;
		switch(resourceType){
			case EXCEL:
				testResourceMatch = excelFileMatcher;
				break;
			case TEXT:
				testResourceMatch = textFileMatcher;
				break;
			case IMAGE:
				testResourceMatch = imageFileMatcher;
				break;
			case JAVA:
				testResourceMatch = javaFileMatcher;
				break;
				default:
					testResourceMatch = textFileMatcher;
				break;
		}

		return testResourceMatch;
	}
}
```

###### ResourceFinder class

```
import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;

import pattern.visitor.file2.matcher.ResourceMatcher;

public class ResourceFinder {
	private static ResourceFinder INSTANCE = new ResourceFinder();

	public static ResourceFinder getInstance(){
		return ResourceFinder.INSTANCE;
	}

	public List<File> search(final File rootDirectory, final ResourceMatcher resourceMatcher){
		Path path = Paths.get(rootDirectory.getPath());
		return search(path, resourceMatcher);
	}

	public List<File> search(Path path, final ResourceMatcher resourceMatcher){
		if(resourceMatcher == null){
			throw new IllegalArgumentException("Empty ResourceMatcher");
		}
		final List<File> testCaseFileList = new ArrayList<File>();

		try {
			java.nio.file.Files.walkFileTree(path, new SimpleFileVisitor<Path>(){
				@Override
				public FileVisitResult visitFile(Path file,BasicFileAttributes attrs) throws IOException {
					File targetFile = file.toFile();
					if(resourceMatcher.isMatch(targetFile)){
						testCaseFileList.add(targetFile);
					}
					return FileVisitResult.CONTINUE;
				}

			});
		}
		catch (IOException e) {
			String exceptionMessage = String.format("Resource searching failed - path:%s, exception: %s", path, e);
			throw new RuntimeException(exceptionMessage, e);
		}
		return testCaseFileList;
	}
}
```
###### ResourceFinderMain class
```
import java.io.File;
import java.util.List;

import pattern.visitor.file2.matcher.ResourceMatcher;
import pattern.visitor.file2.matcher.ResourceMatcherFactory;
import pattern.visitor.file2.matcher.ResourceMatcherFactory.ResourceType;

public class ResourceFinderMain {

	public static void main(String[] args) {
		ResourceFinder resourceFinder = ResourceFinder.getInstance();
		File rootDirectory  = new File("D:\\Test");  // 테스트 시 변경 필요
		ResourceMatcher resourceMatcher = ResourceMatcherFactory.createMatcher(ResourceType.JAVA);
		List<File> files = resourceFinder.search(rootDirectory, resourceMatcher);
		printFileList(files);
	}

	private static void printFileList(List<File> files){
		for(File file:files){
			System.out.println(file);
		}
	}

}
```

java.nio.file.Files.walkFileTree 메서드를 통하여 주어진 root directory경로 아래의 모든 폴더 및 파일을 하나 하나 방문하면서 주어진 ResourceMatcher 객체가 반환 해주는 isMatch결과에 따라서 파일을 추가하는 구조입니다.
ResourceMatcher의 구현체들은 ResourceMatcherFactory를 통하여 얻을 수 있습니다. 다만 ResourceMatcher의 구현체가 추가될때마다 ResourceMatcherFactory에 추가를 해줘야 하는 번거로움이 있을 수 있겠내요.

위의 구조를 바탕으로 Multi-Thread로 찾고자 하는 파일들을 찾는 다면 아주 짧은 시간안에 많은 파일을 찾을 수 있을 것 같내요.
