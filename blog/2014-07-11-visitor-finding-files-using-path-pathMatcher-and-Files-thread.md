---
slug: Visitor 패턴 및 java.nio.Path, PathMatcher, Files를 이용한 File찾기 - Thread 활용
title: Visitor 패턴 및 java.nio.Path, PathMatcher, Files를 이용한 File찾기 - Thread 활용
authors: ryukato
date: 2014-07-11 09:36:55
tags: [Java, Design-Pattern, Visitor, PathMatcher]
---

<!-- truncate -->

# Visitor 패턴 및 java.nio.Path, PathMatcher, Files를 이용한 File찾기 - 쓰레드 활용

[Visitor 패턴 및 java.nio.Path, PathMatcher, Files를 이용한 File찾기](/design-pattern/2014/07/11/visitor-finding-files-using-path-pathMatcher-and-Files.html)
를 기본으로 이번엔 Thread 버전으로 해봤습니다.

아래의 두 파일만 변경이 되었고 나머진 그대로 입니다.
* ResourceFinder >> ResourceFinderRunnable
* ResourceFinderMain >> ResourceFinderRunnableMain

###### ResourceFinderRunnable class

```
import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Set;

import pattern.visitor.file2.matcher.ResourceMatcher;

public class ResourceFinderRunnable implements Runnable {
	private final Set<File> resultFileList;
	private final File rootDirectory;
	private final ResourceMatcher resourceMatcher;

	public ResourceFinderRunnable(Set<File> resultFileList, File rootDirectory, ResourceMatcher resourceMatcher){
		this.resultFileList = resultFileList;
		this.rootDirectory = rootDirectory;
		this.resourceMatcher =resourceMatcher;
	}

	@Override
	public void run() {
		search(rootDirectory, resourceMatcher);
	}

	public void search(final File rootDirectory, final ResourceMatcher resourceMatcher){
		Path path = Paths.get(rootDirectory.getPath());
		search(path, resourceMatcher);
	}

	public void search(Path path, final ResourceMatcher resourceMatcher){
		if(resourceMatcher == null){
			throw new IllegalArgumentException("Empty ResourceMatcher");
		}

		try {
			java.nio.file.Files.walkFileTree(path, new SimpleFileVisitor<Path>(){
				@Override
				public FileVisitResult visitFile(Path file,BasicFileAttributes attrs) throws IOException {
					File targetFile = file.toFile();
					if(resourceMatcher.isMatch(targetFile)){
						if(!resultFileList.contains(targetFile)){
							System.out.println(Thread.currentThread().getName()+ " added "+targetFile);
							resultFileList.add(targetFile);
						}
					}
					return FileVisitResult.CONTINUE;
				}

			});
		}
		catch (IOException e) {
			String exceptionMessage = String.format("Resource searching failed - path:%s, exception: %s", path, e);
			throw new RuntimeException(exceptionMessage, e);
		}
	}
}

```

###### ResourceFinderRunnableMain class

```
import java.io.File;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import pattern.visitor.file2.matcher.ResourceMatcher;
import pattern.visitor.file2.matcher.ResourceMatcherFactory;
import pattern.visitor.file2.matcher.ResourceMatcherFactory.ResourceType;

public class ResourceFinderRunnableMain {

	public static void main(String[] args) {
		Set<File> resultFileList = Collections.synchronizedSet(new HashSet<File>());
		File rootDirectory  = new File("D:\\Download\\");
		ResourceMatcher javaMatcher = ResourceMatcherFactory.createMatcher(ResourceType.JAVA);
		ResourceFinderRunnable javaFinder = new ResourceFinderRunnable(resultFileList, rootDirectory, javaMatcher);

		ResourceMatcher excelMatcher = ResourceMatcherFactory.createMatcher(ResourceType.MS_OFFICE);
		ResourceFinderRunnable excelFinder = new ResourceFinderRunnable(resultFileList, rootDirectory, excelMatcher);

		Thread javaFinderThread = new Thread(javaFinder, "Java Finder Thread");
		Thread excelFinderThread = new Thread(excelFinder, "Excel Finder Thread");
		javaFinderThread.start();
		excelFinderThread.start();

		try {
			javaFinderThread.join();
			excelFinderThread.join();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}

		printFileList(resultFileList);
	}

	private static void printFileList(Collection<File> files){
		for(File file:files){
			System.out.println(file);
		}
	}

}
```

Collections.synchronizedSet 메서드를 활용해서 ResourceFinderRunnable객체가 찾은 파일을 담을 수 있도록 활용하였습니다.
그리고 이미 추가한 파일은 추가하면 안된다는 조건을 추가하였고 그 이외에는 이전과 동일합니다.

> 위와 같이 개별 Thread를 생성해서 처리하는 것보다는 Executors의 thread pool을 사용하는 것이 더 좋을 것으로 보이네요.
